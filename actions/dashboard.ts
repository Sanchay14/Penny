// actions/dashboard.ts
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { Account, User, AccountType, Transaction } from "@prisma/client";

// Input interface for account creation
interface CreateAccountInput {
  name: string;
  balance: string;
  isDefault?: boolean;
  color?: string;
  icon?: string;
  type?: string;
  [key: string]: any;
}

// Serialized transaction type
interface SerializedTransaction extends Omit<Transaction, "amount"> {
  amount: number;
}

// Dashboard data response
interface DashboardData {
  transactions: SerializedTransaction[];
  accounts: (Omit<Account, "balance"> & { balance: number; _count: { transactions: number } })[];
}

function isValidAccountType(value: any): value is AccountType {
  return Object.values(AccountType).includes(value);
}
// Helper to serialize Decimal fields
function serializeAccount(account: Account): Omit<Account, "balance"> & { balance: number } {
  return {
    ...account,
    balance: typeof account.balance === "object" && typeof (account.balance as any).toNumber === "function"
      ? (account.balance as any).toNumber()
      : Number(account.balance),
  };
}

// Helper to serialize transaction amounts
function serializeTransaction(transaction: Transaction): SerializedTransaction {
  return {
    ...transaction,
    amount: typeof transaction.amount === "object" && typeof (transaction.amount as any).toNumber === "function"
      ? (transaction.amount as any).toNumber()
      : Number(transaction.amount),
  };
}

// Get dashboard data including transactions and accounts
export async function getDashboardData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
  // Force dynamic data fetching - disable caching completely
  noStore();
  
  // Add no-cache headers
  if (typeof globalThis !== 'undefined' && 'headers' in globalThis) {
    try {
      const { headers } = await import('next/headers');
      (await headers()).set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      (await headers()).set('Pragma', 'no-cache');
      (await headers()).set('Expires', '0');
    } catch (e) {
      // Ignore header errors in server actions
    }
  }
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Fetch all transactions sorted by date descending
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    // Fetch all accounts with transaction counts
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const serializedTransactions = transactions.map(serializeTransaction);
    const serializedAccounts = accounts.map((account) => ({
      ...serializeAccount({
        ...account,
        userId: account.userId ?? "",
      } as Account),
      _count: account._count
    }));

    return { 
      success: true, 
      data: {
        transactions: serializedTransactions,
        accounts: serializedAccounts
      }
    };
  } catch (error: any) {
    console.error("Error in getDashboardData:", error);
    return { success: false, error: error.message || "Failed to fetch dashboard data" };
  }
}


// Get monthly expense statistics by category
export async function getMonthlyStats(accountId?: string): Promise<{ 
  success: boolean; 
  data?: { category: string; amount: number; color: string }[]; 
  error?: string 
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const whereClause: any = {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    };

    if (accountId) {
      whereClause.accountId = accountId;
    }

    const expenses = await db.transaction.findMany({
      where: whereClause,
      select: {
        category: true,
        amount: true,
      },
    });

    // Group by category and sum amounts
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const amount = typeof expense.amount === "object" && typeof (expense.amount as any).toNumber === "function"
        ? (expense.amount as any).toNumber()
        : Number(expense.amount);
      
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + amount);
    });

    // Convert to array with colors
    const colors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe",
      "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d084d0"
    ];

    const result = Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " "),
      amount,
      color: colors[index % colors.length],
    }));

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in getMonthlyStats:", error);
    return { success: false, error: error.message || "Failed to fetch monthly stats" };
  }
}

// Get all accounts for a user - now cached
export async function getUserAccounts(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    console.log("Fetching accounts for user:", userId);
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    console.log("User found:", user.id);
    
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    const serializedAccounts = accounts.map((account) => ({
      ...serializeAccount({
        ...account,
        userId: account.userId ?? "",
      } as Account),
      _count: account._count
    }));

    console.log("Found accounts:", serializedAccounts.length);
    return { success: true, data: serializedAccounts };
  } catch (error: any) {
    console.error("Error in getUserAccounts:", error);
    return { success: false, error: error.message || "Failed to fetch accounts" };
  }
}

// Create a new account for the user
export async function createAccount(
  data: CreateAccountInput
): Promise<{ success: true; data: any }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Handle default account logic
    if (data.isDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    const accountType=isValidAccountType(data.type)?data.type:AccountType.SAVINGS;
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        type: accountType,
      },
    });

    const serializedAccount = serializeAccount({
      ...account,
      userId: account.userId ?? "",
    } as Account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error: any) {
    console.error("Error creating account:", error);
    throw new Error(error.message);
  }
}

// Set an account as default
export async function setDefaultAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify the account belongs to the user
    const account = await db.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Use a transaction to ensure atomicity
    await db.$transaction(async (tx) => {
      // First, set all accounts to not default
      await tx.account.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });

      // Then set the selected account as default
      await tx.account.update({
        where: { id: accountId },
        data: { isDefault: true },
      });
    });

    // Aggressive cache invalidation - revalidate everything
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard", "page");
    revalidatePath("/dashboard");
    revalidatePath("/");
    
    // Also try to clear any potential Next.js cache
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag('dashboard');
      revalidateTag('budget');
      revalidateTag('accounts');
    } catch (e) {
      // Ignore if revalidateTag is not available
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error setting default account:", error);
    return { success: false, error: error.message || "Failed to set default account" };
  }
}