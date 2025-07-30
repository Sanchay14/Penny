// actions/dashboard.ts
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Account, User, AccountType} from "@prisma/client";

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

    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error setting default account:", error);
    return { success: false, error: error.message || "Failed to set default account" };
  }
}