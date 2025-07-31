import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

// Test function to calculate missed occurrences (same as in functions.ts)
function calculateNextRecurringDate(date: Date, interval: string): Date {
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

function calculateMissedOccurrences(transaction: any): Date[] {
  const occurrences: Date[] = [];
  
  if (!transaction.recurringInterval) {
    return occurrences;
  }
  
  const today = new Date();
  let currentDate: Date;
  
  if (!transaction.lastProcessed) {
    // For new recurring transactions, start from the NEXT occurrence after the original date
    // Don't include the original date since that transaction already exists
    currentDate = calculateNextRecurringDate(new Date(transaction.date), transaction.recurringInterval);
  } else {
    // If already processed, start from the next occurrence after last processed
    currentDate = calculateNextRecurringDate(new Date(transaction.lastProcessed), transaction.recurringInterval);
  }
  
  // Generate all missed occurrences up to today
  while (currentDate <= today) {
    occurrences.push(new Date(currentDate));
    currentDate = calculateNextRecurringDate(currentDate, transaction.recurringInterval);
  }
  
  return occurrences;
}

export async function POST(request: NextRequest) {
  try {
    console.log("Testing catch-up functionality for recurring transactions");
    
    // Get all recurring transactions
    const recurringTransactions = await db.transaction.findMany({
      where: {
        isRecurring: true,
      },
      include: {
        account: true,
      }
    });
    
    console.log(`Found ${recurringTransactions.length} recurring transactions`);
    
    const results = recurringTransactions.map(transaction => {
      const missedOccurrences = calculateMissedOccurrences(transaction);
      
      return {
        id: transaction.id,
        description: transaction.description,
        recurringInterval: transaction.recurringInterval,
        originalDate: transaction.date,
        lastProcessed: transaction.lastProcessed,
        nextRecurringDate: transaction.nextRecurringDate,
        missedOccurrences: {
          count: missedOccurrences.length,
          dates: missedOccurrences.map(d => d.toISOString().split('T')[0]).slice(0, 5), // Show first 5 dates
          totalDates: missedOccurrences.length > 5 ? `... and ${missedOccurrences.length - 5} more` : ''
        },
        accountName: transaction.account.name,
        amount: transaction.amount.toString()
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      totalRecurring: recurringTransactions.length,
      transactions: results,
      summary: {
        totalMissedTransactions: results.reduce((sum, t) => sum + t.missedOccurrences.count, 0),
        transactionsNeedingCatchup: results.filter(t => t.missedOccurrences.count > 0).length
      }
    });
  } catch (error) {
    console.error("Error testing catch-up functionality:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
