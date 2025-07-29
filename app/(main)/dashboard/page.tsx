// app/dashboard/page.tsx
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { getUserAccounts } from "@/actions/dashboard";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budget-progress";
// Create the async component for the accounts
async function AccountsGrid() {
  console.log("Fetching accounts");
  
  try {
    const result = await getUserAccounts();
    
    if (!result.success) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Something went wrong</p>
        </div>
      );
    }

    const accounts = result.data || [];
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
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                  <Plus className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium">Add New Account</p>
                </CardContent>
              </Card>
            </CreateAccountDrawer>
            {accounts.length > 0 &&
              accounts?.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
          </div>
        </div>
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
      
      {/* Only the accounts grid is wrapped in Suspense */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountsGrid />
      </Suspense>
    </div>
  );
}