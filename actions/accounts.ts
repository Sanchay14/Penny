"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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
  
  if (obj.balance && typeof obj.balance === "object" && typeof (obj.balance as any).toNumber === "function") {
    (serialized as any).balance = (obj.balance as any).toNumber();
  }
  
  if (obj.amount && typeof obj.amount === "object" && typeof (obj.amount as any).toNumber === "function") {
    (serialized as any).amount = (obj.amount as any).toNumber();
  }
  
  return serialized;
};

export async function getAccountWithTransactions(
  accountId: string
): Promise<SerializedAccountWithTransactions | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  } as SerializedAccountWithTransactions;
}

export async function bulkDeleteTransactions(
  transactionIds: string[]
): Promise<{ success: boolean; error?: string }> {
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
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}