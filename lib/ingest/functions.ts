import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/tempelate"
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction, Budget, User, Account, RecurringInterval, TransactionType } from "@prisma/client";

// Type definitions
interface MonthlyStats {
  totalExpenses: number;
  totalIncome: number;
  byCategory: Record<string, number>;
  transactionCount: number;
}

interface BudgetWithUser extends Budget {
  user: User & {
    accounts: Account[];
  };
}

interface TransactionWithAccount extends Transaction {
  account: Account;
}

// Updated to match email template expectations
interface BudgetAlertData {
  percentageUsed?: number;
  budgetAmount?: string | number;
  totalExpenses?: string | number;
  accountName?: string;
}

interface MonthlyReportData {
  month?: string;
  stats?: MonthlyStats;
  insights?: string[];
}

interface EmailTemplateProps {
  userName?: string | null;
  type?: "monthly-report" | "budget-alert";
  data?: BudgetAlertData | MonthlyReportData;
}
// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  {
    name: "Check Budget Alerts",
    id: "check-budget-alerts"
  },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      const budgetData = await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
      
      console.log(`Found ${budgetData.length} budgets to check`);
      return budgetData;
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) {
        console.log(`No default account found for user ${budget.user.email}`);
        continue; // Skip if no default account
      }

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1); // Start of current month

        console.log(`Checking budget for user ${budget.user.email}, budget amount: ${budget.amount}`);

        // Calculate total expenses for the default account only
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id, // Only consider default account
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount ? 
          (typeof expenses._sum.amount === 'object' && 'toNumber' in expenses._sum.amount ? 
            expenses._sum.amount.toNumber() : Number(expenses._sum.amount)) : 0;
        
        const budgetAmount = Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        console.log(`User ${budget.user.email}: expenses=${totalExpenses}, budget=${budgetAmount}, percentage=${percentageUsed.toFixed(1)}%`);
        
        const lastAlertSent = (budget as any).lastAlertSent;
        const isNewMonthCheck = !lastAlertSent || isNewMonth(new Date(lastAlertSent), new Date());
        
        console.log(`LastAlertSent: ${lastAlertSent}, IsNewMonth: ${isNewMonthCheck}`);

        if (
          percentageUsed >= 80 &&
          isNewMonthCheck
        ) { // Default threshold of 80%
          console.log(`🚨 Budget alert triggered for user ${budget.user.email}: ${percentageUsed.toFixed(1)}% used`);
          
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: budgetAmount.toFixed(1),
                totalExpenses: totalExpenses.toFixed(1),
                accountName: defaultAccount.name,
              } as BudgetAlertData,
            }),
          });
          
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() } as any,
          });

          console.log(`✅ Database updated - lastAlertSent set for budget ${budget.id}`);
        } else {
          console.log(`❌ No alert sent for user ${budget.user.email}: threshold not met or alert already sent this month`);
        }
      });
    }

    return { processed: budgets.length };
  }
);

function isNewMonth(lastAlertDate: Date, currentDate: Date): boolean {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Utility functions
function isTransactionDue(transaction: TransactionWithAccount): boolean {
  // If no lastProcessed date, transaction is due
  if (!transaction.nextRecurringDate) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date: Date, interval: RecurringInterval): Date {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

// async function getMonthlyStats(userId: string, month: Date): Promise<MonthlyStats> {
//   const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
//   const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

//   const transactions = await db.transaction.findMany({
//     where: {
//       userId,
//       date: {
//         gte: startDate,
//         lte: endDate,
//       },
//     },
//   });

//   return transactions.reduce(
//     (stats, t) => {
//       const amount = typeof t.amount === 'object' && 'toNumber' in t.amount ? 
//         t.amount.toNumber() : Number(t.amount);
      
//       if (t.type === "EXPENSE") {
//         stats.totalExpenses += amount;
//         stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
//       } else {
//         stats.totalIncome += amount;
//       }
//       return stats;
//     },
//     {
//       totalExpenses: 0,
//       totalIncome: 0,
//       byCategory: {} as Record<string, number>,
//       transactionCount: transactions.length,
//     }
//   );
// }