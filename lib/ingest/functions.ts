import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/tempelate";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction, Budget, User, Account, RecurringInterval } from "@prisma/client";

// Type definitions to ensure type safety
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
  lastProcessed: Date | null;
  nextRecurringDate: Date | null;
}

// Data shapes for the email template
interface BudgetAlertData {
  percentageUsed: number;
  budgetAmount: string;
  totalExpenses: string;
  accountName: string;
}

interface MonthlyReportData {
  month: string;
  stats: MonthlyStats;
  insights: string[];
}

interface EmailTemplateProps {
  userName?: string | null;
  type: "monthly-report" | "budget-alert";
  data: BudgetAlertData | MonthlyReportData;
}

// Utility functions
function isNewMonth(lastAlertDate: Date, currentDate: Date): boolean {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

function isTransactionDue(transaction: Transaction): boolean {
  // A transaction is due if it has never been processed or its next recurring date has passed.
  if (!transaction.lastProcessed) {
    return true;
  }
  
  if (!transaction.nextRecurringDate) {
    return false; // Should not happen for recurring transactions, but as a safeguard
  }
  
  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);
  return nextDue <= today;
}

function calculateMissedOccurrences(transaction: Transaction): Date[] {
  const occurrences: Date[] = [];
  
  if (!transaction.recurringInterval) {
    return occurrences;
  }
  
  const today = new Date();
  let currentDate: Date;
  
  if (!transaction.lastProcessed) {
    // For new recurring transactions, start from the NEXT occurrence after the original date
    // The original transaction remains as-is and serves as the template
    currentDate = calculateNextRecurringDate(new Date(transaction.date), transaction.recurringInterval as RecurringInterval);
  } else {
    // If already processed, start from the next occurrence after last processed
    currentDate = calculateNextRecurringDate(new Date(transaction.lastProcessed), transaction.recurringInterval as RecurringInterval);
  }
  
  // Generate all missed occurrences up to today (excluding the original transaction date)
  while (currentDate <= today) {
    occurrences.push(new Date(currentDate));
    currentDate = calculateNextRecurringDate(currentDate, transaction.recurringInterval as RecurringInterval);
  }
  
  return occurrences;
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

async function getMonthlyStats(userId: string, month: Date): Promise<MonthlyStats> {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      // Prisma's Decimal type needs to be converted to a number
      const amount = typeof t.amount === 'object' && 'toNumber' in t.amount ?
        t.amount.toNumber() : Number(t.amount);
      
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {} as Record<string, number>,
      transactionCount: transactions.length,
    }
  );
}

// Test function to debug event reception
export const testEventReception = inngest.createFunction(
  { id: "test-event-reception", name: "Test Event Reception" },
  { event: "transaction.recurring.process" },
  async ({ event }) => {
    console.log("=== TEST FUNCTION RECEIVED EVENT ===");
    console.log("Event received by test function:", JSON.stringify(event, null, 2));
    return { received: true, eventData: event };
  }
);

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Log the entire event object for debugging
    console.log("=== DEBUGGING EVENT STRUCTURE ===");
    console.log("Full event object:", JSON.stringify(event, null, 2));
    console.log("Event name:", event.name);
    console.log("Event data:", event.data);
    console.log("Event keys:", Object.keys(event || {}));
    if (event.data) {
      console.log("Event data keys:", Object.keys(event.data || {}));
      console.log("TransactionId:", event.data.transactionId);
      console.log("UserId:", event.data.userId);
    }
    console.log("=== END DEBUG ===");
    
    // Validate event data with detailed logging
    if (!event?.data?.transactionId) {
      console.error("Missing transactionId in event data. Event structure:", {
        hasEvent: !!event,
        hasData: !!(event?.data),
        dataKeys: event?.data ? Object.keys(event.data) : 'no data',
        fullEvent: event
      });
      return { error: "Missing required transactionId in event data" };
    }
    
    if (!event?.data?.userId) {
      console.error("Missing userId in event data:", event);
      return { error: "Missing required userId in event data" };
    }

    console.log(`Processing recurring transaction: ${event.data.transactionId} for user: ${event.data.userId}`);

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      }) as TransactionWithAccount | null;

      if (!transaction || !isTransactionDue(transaction)) {
        console.log(`Skipping transaction ${event.data.transactionId}: not found or not due.`);
        return;
      }

      // Calculate all missed occurrences for catch-up processing
      const missedOccurrences = calculateMissedOccurrences(transaction);
      
      if (missedOccurrences.length === 0) {
        console.log(`No missed occurrences for transaction ${transaction.id}`);
        return;
      }

      console.log(`Processing ${missedOccurrences.length} missed occurrences for transaction ${transaction.id}`);
      console.log(`Dates: ${missedOccurrences.map(d => d.toISOString().split('T')[0]).join(', ')}`);

      // Create all missed transactions and update account balance in a single database transaction
      await db.$transaction(async (tx) => {
        let totalBalanceChange = 0;

        // Create a transaction for each missed occurrence
        for (const occurrenceDate of missedOccurrences) {
          await tx.transaction.create({
            data: {
              type: transaction.type,
              amount: transaction.amount,
              description: `${transaction.description} (Recurring - ${occurrenceDate.toISOString().split('T')[0]})`,
              date: occurrenceDate,
              category: transaction.category,
              userId: transaction.userId,
              accountId: transaction.accountId,
              isRecurring: false, // These are NOT recurring transactions, just instances
              status: "COMPLETED",
            },
          });

          // Calculate cumulative balance change
          const amountValue = typeof transaction.amount === 'object' && 'toNumber' in transaction.amount
            ? transaction.amount.toNumber()
            : Number(transaction.amount);

          if (transaction.type === "EXPENSE") {
            totalBalanceChange -= amountValue;
          } else {
            totalBalanceChange += amountValue;
          }
        }

        // Update account balance with total change
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: totalBalanceChange } },
        });

        // Update ONLY the recurring transaction's metadata (keep the original transaction intact)
        const lastOccurrence = missedOccurrences[missedOccurrences.length - 1];
        const nextRecurringDate = transaction.recurringInterval 
          ? calculateNextRecurringDate(lastOccurrence, transaction.recurringInterval as RecurringInterval)
          : null;

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: nextRecurringDate,
            // DO NOT modify the original transaction's date, amount, description, etc.
            // Keep it as the template for future recurring transactions
          },
        });

        console.log(`✅ Created ${missedOccurrences.length} new transactions, updated balance by ${totalBalanceChange}, next due: ${nextRecurringDate?.toISOString().split('T')[0]}`);
        console.log(`✅ Original recurring transaction ${transaction.id} preserved as template`);
      });
    });
  }
);


// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    // First, let's check if we have ANY recurring transactions at all
    const totalRecurringCount = await step.run(
      "check-total-recurring",
      async () => {
        const count = await db.transaction.count({
          where: { isRecurring: true }
        });
        console.log(`Total recurring transactions in database: ${count}`);
        return count;
      }
    );

    if (totalRecurringCount === 0) {
      console.log("No recurring transactions found in database");
      return { triggered: 0, totalFound: 0, skippedInvalid: 0, note: "No recurring transactions in database" };
    }

    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        console.log("Fetching recurring transactions...");
        
        const query = {
          where: {
            isRecurring: true,
            OR: [
              { lastProcessed: null }, // Never been processed (catch-up needed)
              {
                AND: [
                  { nextRecurringDate: { not: null } }, // Has a next date set
                  { nextRecurringDate: { lte: new Date() } }, // Date has passed
                ]
              },
            ],
          },
          include: {
            account: true, // Include account info for better logging
          }
        };
        
        console.log("Query:", JSON.stringify(query, null, 2));
        
        const results = await db.transaction.findMany(query);
        console.log(`Query returned ${results.length} transactions`);
        
        // Log each transaction for debugging
        results.forEach(t => {
          const missedCount = calculateMissedOccurrences(t).length;
          console.log(`Transaction ${t.id}: lastProcessed=${t.lastProcessed}, nextRecurringDate=${t.nextRecurringDate}, status=${t.status}, missedOccurrences=${missedCount}`);
        });
        
        return results;
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      console.log(`Found ${recurringTransactions.length} recurring transactions to process`);
      
      const events = recurringTransactions
        .map((transaction) => {
          // Log transaction details for debugging
          console.log(`Processing transaction: ID=${transaction.id}, UserID=${transaction.userId}, Interval=${transaction.recurringInterval}`);
          
          // Validate required fields before creating event
          if (!transaction.id || !transaction.userId) {
            console.error(`Invalid transaction data: ID=${transaction.id}, UserID=${transaction.userId}`);
            return null;
          }
          
          const eventData = {
            name: "transaction.recurring.process" as const,
            data: {
              transactionId: transaction.id,
              userId: transaction.userId,
            },
          };
          
          // Log the event structure being created
          console.log("Creating event:", JSON.stringify(eventData, null, 2));
          
          return eventData;
        })
        .filter((event): event is NonNullable<typeof event> => event !== null); // Type-safe filter

      if (events.length > 0) {
        console.log(`Sending ${events.length} events to process`);
        console.log("First event structure:", JSON.stringify(events[0], null, 2));
        
        try {
          // Send all events in batch - more efficient
          await inngest.send(events);
          console.log(`✅ Successfully sent ${events.length} events`);
        } catch (error) {
          console.error(`❌ Failed to send events:`, error);
          throw error; // Re-throw to trigger Inngest retry
        }
      } else {
        console.warn("No valid events to send - all transactions had missing required data");
      }
      
      return { 
        triggered: events.length,
        totalFound: recurringTransactions.length,
        skippedInvalid: recurringTransactions.length - events.length
      };
    }

    return { triggered: 0, totalFound: 0, skippedInvalid: 0 };
  }
);


// 2. Monthly Report Generation
async function generateFinancialInsights(stats: MonthlyStats, month: string): Promise<string[]> {
  // Guard against missing API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount.toFixed(2)}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    // Use a more robust regex to clean up any unwanted markdown
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      // Ensure user has an email
      if (!user.email) {
        console.warn(`Skipping report for user ${user.id} due to missing email.`);
        continue;
      }

      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          } as EmailTemplateProps),
        });
      });
    }

    return { processed: users.length };
  }
);


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
      return budgetData as BudgetWithUser[];
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) {
        console.log(`No default account found for user ${budget.user.email}`);
        continue; // Skip if no default account
      }
      if (!budget.user.email) {
        console.warn(`Skipping budget check for user ${budget.user.name} due to missing email.`);
        continue;
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
        
        // Ensure lastAlertSent is a Date object or null
        const lastAlertSent = budget.lastAlertSent ? new Date(budget.lastAlertSent) : null;
        const isNewMonthCheck = !lastAlertSent || isNewMonth(lastAlertSent, new Date());
        
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
            } as EmailTemplateProps),
          });
          
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
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