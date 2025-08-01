"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, unstable_cache, unstable_noStore as noStore } from "next/cache";
import { Account, Transaction, User } from "@prisma/client";

// Extended Account type with transactions and count
interface AccountWithTransactions extends Account {
  transactions: Transaction[];
  _count: {
    transactions: number;
  };
}

// Serialized versions for return types
interface SerializedAccount extends Omit<Account, "balance"> {
  balance: number;
}

interface SerializedTransaction extends Omit<Transaction, "amount"> {
  amount: number;
}

interface SerializedAccountWithTransactions extends SerializedAccount {
  transactions: SerializedTransaction[];
  _count: {
    transactions: number;
  };
}

// Helper function to serialize Decimal fields
const serializeDecimal = <T extends Record<string, any>>(obj: T): T & {
  balance?: number;
  amount?: number;
} => {
  const serialized = { ...obj };
  
  if (obj.balance !== null && obj.balance !== undefined) {
    if (typeof obj.balance === "object" && typeof (obj.balance as any).toNumber === "function") {
      (serialized as any).balance = (obj.balance as any).toNumber();
    } else if (typeof obj.balance === "string") {
      (serialized as any).balance = parseFloat(obj.balance);
    } else if (typeof obj.balance === "number") {
      (serialized as any).balance = obj.balance;
    }
  }
  
  if (obj.amount !== null && obj.amount !== undefined) {
    if (typeof obj.amount === "object" && typeof (obj.amount as any).toNumber === "function") {
      (serialized as any).amount = (obj.amount as any).toNumber();
    } else if (typeof obj.amount === "string") {
      (serialized as any).amount = parseFloat(obj.amount);
    } else if (typeof obj.amount === "number") {
      (serialized as any).amount = obj.amount;
    }
  }
  
  return serialized;
};

// Helper function to get user with caching
const getCachedUser = unstable_cache(
  async (clerkUserId: string) => {
    return await db.user.findUnique({
      where: { clerkUserId },
    });
  },
  ['user-by-clerk-id'],
  {
    revalidate: 300, // 5 minutes
    tags: ['user'],
  }
);

export async function getAccountWithTransactions(
  accountId: string
): Promise<SerializedAccountWithTransactions | null> {
  noStore(); // Prevent caching for real-time updates
  
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getCachedUser(userId);

  if (!user) throw new Error("User not found");

  // Cache the account query
  const getAccountData = unstable_cache(
    async (accountId: string, userId: string) => {
      return await db.account.findUnique({
        where: {
          id: accountId,
          userId: userId,
        },
        include: {
          transactions: {
            orderBy: { date: "desc" },
            take: 50, // Limit transactions to improve performance
          },
          _count: {
            select: { transactions: true },
          },
        },
      });
    },
    [`account-${accountId}`],
    {
      revalidate: 60, // 1 minute
      tags: [`account-${accountId}`, 'accounts'],
    }
  );

  const account = await getAccountData(accountId, user.id);

  if (!account) return null;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  } as SerializedAccountWithTransactions;
}

export async function bulkDeleteTransactions(
  transactionIds: string[]
): Promise<{ success: boolean; error?: string; timestamp?: number; headers?: Record<string, string> }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc: Record<string, number>, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? typeof transaction.amount === "object" && typeof (transaction.amount as any).toNumber === "function"
            ? (transaction.amount as any).toNumber()
            : Number(transaction.amount)
          : typeof transaction.amount === "object" && typeof (transaction.amount as any).toNumber === "function"
            ? -(transaction.amount as any).toNumber()
            : -Number(transaction.amount);
      
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/account");
    revalidatePath("/account", "layout");
    
    // Revalidate specific account pages
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      select: { id: true }
    });
    
    for (const account of accounts) {
      revalidatePath(`/account/${account.id}`);
      revalidatePath(`/account/${account.id}`, "layout");
    }

    return { 
      success: true,
      timestamp: Date.now(), // Force cache bust
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}