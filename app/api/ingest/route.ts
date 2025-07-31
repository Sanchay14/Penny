import { 
  checkBudgetAlerts, 
  generateMonthlyReports, 
  processRecurringTransaction, 
  triggerRecurringTransactions,
} from "@/lib/ingest/functions";
import { serve } from "inngest/next";
import { inngest } from "@/lib/ingest/client";

// Create an API that serves the functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports
  ],
});