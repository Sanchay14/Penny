// actions/budget.ts
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { Budget, Transaction } from "@prisma/client";

// Input interface for updating budget
interface UpdateBudgetInput {
  amount: number;
}

// Serialized budget type (convert Decimal to number)
function serializeBudget(budget: Budget): Omit<Budget, "amount"> & { amount: number } {
  return {
    ...budget,
    amount:
      typeof budget.amount === "object" && typeof (budget.amount as any).toNumber === "function"
        ? (budget.amount as any).toNumber()
        : Number(budget.amount),
  };
}

// Get current budget and expenses for the month
export async function getCurrentBudget(
  accountId: string
): Promise<{ success: boolean; data?: { budget: any | null; currentExpenses: number }; error?: string }> {
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
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Force fresh data by using unstable_noStore or adding timestamp
    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    // Calculate current month date range
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: { amount: true },
    });

    return {
      success: true,
      data: {
        budget: budget ? serializeBudget(budget) : null,
        currentExpenses: expenses._sum.amount
          ? (expenses._sum.amount as any).toNumber?.() ?? Number(expenses._sum.amount)
          : 0,
      },
    };
  } catch (error: any) {
    console.error("Error fetching budget:", error);
    return { success: false, error: error.message || "Failed to fetch budget" };
  }
}

// Update or create budget
export async function updateBudget(
  data: UpdateBudgetInput
): Promise<{ success: boolean; data?: any; error?: string; timestamp?: number; headers?: Record<string, string> }> {
  // Force no caching for budget updates
  noStore();
  
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    // Find existing budget for the user
    const existingBudget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    const budget = await db.budget.upsert({
      where: existingBudget ? { id: existingBudget.id } : { id: "" }, // Prisma requires a value, so use empty string if not found
      update: { amount: data.amount },
      create: {
        userId: user.id,
        amount: data.amount,
        period: "MONTHLY", // or another valid value for your schema
        startDate: new Date(), // or another appropriate date
      },
    });

    // Aggressive cache invalidation for budget updates
    revalidatePath("/dashboard");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard", "page");
    
    // Revalidate all account pages since budget affects dashboard views
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
      data: serializeBudget(budget),
      timestamp: Date.now(), // Force cache bust
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      }
    };
  } catch (error: any) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message || "Failed to update budget" };
  }
}
