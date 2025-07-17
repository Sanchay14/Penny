"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { Account, User } from "@prisma/client";

// Input interface for account creation
interface CreateAccountInput {
  name: string;
  balance: string;
  isDefault?: boolean;
  color?: string;
  icon?: string;
  [key: string]: any;
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

// Get all accounts for a user
export async function getUserAccounts(): Promise<{ success: true; data: any[] }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    console.log(userId);
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

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
      } as Account)
    }));

    return { success: true, data: serializedAccounts };
  } catch (error: any) {
    throw new Error(error.message);
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

    if (data.isDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        type:data.type??"CHECKING"
      },
    });

    const serializedAccount = serializeAccount({
      ...account,
      userId: account.userId ?? "",
    } as Account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
