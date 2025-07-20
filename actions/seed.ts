"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";
import { TransactionType, TransactionStatus } from "@prisma/client";

const ACCOUNT_ID = "dc6e9d01-a6f9-4345-9f0b-1f753527a50b";
const USER_ID = "93849b95-aed3-487c-832f-676459f6d128";

// Interface for category definition
interface CategoryDefinition {
  name: string;
  range: [number, number];
}

// Interface for categories object
interface Categories {
  INCOME: CategoryDefinition[];
  EXPENSE: CategoryDefinition[];
}

// Interface for category with amount result
interface CategoryWithAmount {
  category: string;
  amount: number;
}

// Interface for transaction data
interface TransactionData {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  category: string;
  status: TransactionStatus;
  userId: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for function return type
interface SeedTransactionsResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Categories with their typical amount ranges
const CATEGORIES: Categories = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type: keyof Categories): CategoryWithAmount {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export async function seedTransactions(): Promise<SeedTransactionsResult> {
  try {
    // Generate 90 days of transactions
    const transactions: TransactionData[] = [];
    let totalBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type: TransactionType = Math.random() < 0.4 ? TransactionType.INCOME : TransactionType.EXPENSE;
        const { category, amount } = getRandomCategory(type);

        const transaction: TransactionData = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${
            type === TransactionType.INCOME ? "Received" : "Paid for"
          } ${category}`,
          date,
          category,
          status: TransactionStatus.COMPLETED,
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === TransactionType.INCOME ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert transactions in batches and update account balance
    await db.$transaction(async (tx) => {
      // Clear existing transactions
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error: any) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}