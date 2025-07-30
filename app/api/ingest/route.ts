import { checkBudgetAlerts } from "@/lib/ingest/functions";
import { serve } from "inngest/next";
import { inngest } from "@/lib/ingest/client";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    checkBudgetAlerts
  ],
});