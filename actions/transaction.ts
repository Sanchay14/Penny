"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Account, Transaction, User } from "@prisma/client";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { th } from "date-fns/locale";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Types for serialized data
interface SerializedTransaction extends Omit<Transaction, "amount"> {
  amount: number;
}

interface SerializedTransactionWithAccount extends SerializedTransaction {
  account: Account;
}

// Transaction creation data
interface CreateTransactionData {
  accountId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description: string | null;
  date: string | Date;
  isRecurring?: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  notes?: string | null;
}

// Receipt scan result
interface ReceiptScanResult {
  amount: number;
  date: Date;
  description: string;
  category: string;
  merchantName: string;
}

// API response types
interface TransactionResponse {
  success: boolean;
  data: SerializedTransaction;
}

interface TransactionsResponse {
  success: boolean;
  data: SerializedTransactionWithAccount[];
}

// Query parameters for transactions
interface TransactionQuery {
  accountId?: string;
  type?: "INCOME" | "EXPENSE";
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

// Helper function to serialize Decimal amounts
const serializeAmount = <T extends { amount: any }>(obj: T): T & { amount: number } => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data: CreateTransactionData): Promise<TransactionResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const req = await request();
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT",
          message: `Rate limit exceeded. Try again in ${reset} seconds.`,     
        });

        throw new Error(`Rate limit exceeded. Try again in ${reset} seconds.`);
      }
      throw new Error("Request denied by Arcjet");
    }
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange: number = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance: number = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query: TransactionQuery = {}): Promise<TransactionsResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const serializedTransactions: SerializedTransactionWithAccount[] = transactions.map(
      (transaction): SerializedTransactionWithAccount => ({
        ...serializeAmount(transaction),
        account: transaction.account,
      })
    );

    return { success: true, data: serializedTransactions };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file: File): Promise<ReceiptScanResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String: string = Buffer.from(arrayBuffer).toString("base64");

    const prompt: string = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text: string = response.text();
    const cleanedText: string = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText) as {
        amount: string | number;
        date: string;
        description: string;
        category: string;
        merchantName: string;
      };

      return {
        amount: parseFloat(data.amount.toString()),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError: any) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error: any) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(
  startDate: string | Date,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
): Date {
  const date: Date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Invalid recurring interval: ${interval}`);
  }

  return date;
}