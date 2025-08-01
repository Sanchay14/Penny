// app/dashboard/page.tsx
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { getDashboardData } from "@/actions/dashboard";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budget-progress";
import { DashboardOverview } from "./_components/dashboard-overview";

// Completely disable all caching and force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// Create the async component for the dashboard content
async function DashboardContent() {
  console.log("Fetching dashboard data");
  
  try {
    // Fetch dashboard data (transactions and accounts)
    const dashboardResult = await getDashboardData();
    
    if (!dashboardResult.success) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Something went wrong</p>
        </div>
      );
    }

    const { transactions, accounts } = dashboardResult.data || { transactions: [], accounts: [] };
    const defaultAccount = accounts.find((acc) => acc.isDefault);
    
    let budgetData = null;
    if (defaultAccount) {
      const budgetResult = await getCurrentBudget(defaultAccount.id);
      if (budgetResult.success) {
        budgetData = budgetResult.data;
      } else {
        console.error("Failed to fetch budget:", budgetResult.error);
      }
    }

    return (
      <div className="space-y-6 pb-16">
        {/* Dashboard Overview Section */}
        {accounts.length > 0 && transactions.length > 0 && (
          <DashboardOverview 
            transactions={transactions}
            accounts={accounts}
          />
        )}

        {/* Budget Progress Section */}
        {defaultAccount && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
            <BudgetProgress 
              initialBudget={budgetData?.budget || null}
              currentExpenses={budgetData?.currentExpenses || 0}
            />
          </div>
        )}
        
        {/* Accounts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Accounts</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateAccountDrawer>
              <Card className="group hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer border-dashed hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:scale-105">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5 group-hover:text-blue-600">
                  <Plus className="h-10 w-10 mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 group-hover:text-blue-600" />
                  <p className="text-sm font-medium transition-all duration-300 group-hover:font-semibold group-hover:text-blue-700">Add New Account</p>
                </CardContent>
              </Card>
            </CreateAccountDrawer>
            {accounts.length > 0 &&
              accounts?.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
          </div>
        </div>
        
        {/* Temporary Chart Test */}
      </div>
    );
  } catch (error) {
    console.error("Dashboard page error:", error);
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Something went wrong</p>
      </div>
    );
  }
}

// Main dashboard page component
export default function DashboardPage() {
  return (
    <div>
      {/* This title will always be visible */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-6xl font-bold tracking-tight gradient-title">
          Dashboard
        </h1>
      </div>
      
      {/* Dashboard content wrapped in Suspense */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}