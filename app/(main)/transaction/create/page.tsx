import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";

// Types
interface Account {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
}

interface AccountsResponse {
  success: boolean;
  data?: Account[];
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export default async function AddTransactionPage(): Promise<React.ReactElement> {
  const accountsResponse: AccountsResponse = await getUserAccounts();
  
  if (!accountsResponse.success) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Something went wrong</p>
      </div>
    );
  }

  // Filter and cast categories to match Category type
  const categories = defaultCategories.filter(
    (cat) => cat.type === "INCOME" || cat.type === "EXPENSE"
  ) as Category[];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[80vh] px-5">
      <div className="mb-8 w-full max-w-3xl">
        <h1 className="text-5xl gradient-title text-center">Add Transaction</h1>
      </div>
      <div className="w-full max-w-3xl">
        <AddTransactionForm
          accounts={accountsResponse.data ?? []}
          categories={categories}
        />
      </div>
    </div>
  );
}