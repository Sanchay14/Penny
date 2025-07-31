import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
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

interface SerializedTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  date: Date;
  accountId: string;
  category: string;
  isRecurring: boolean;
  recurringInterval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  notes: string | null;
  userId: string;
  nextRecurringDate: Date | null;
  lastProcessed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  searchParams: Promise<{ edit?: string }>;
}

export default async function AddTransactionPage({ searchParams }: Props): Promise<React.ReactElement> {
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams.edit;
  const editMode = Boolean(editId);

  const accountsResponse: AccountsResponse = await getUserAccounts();
  
  if (!accountsResponse.success) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Something went wrong</p>
      </div>
    );
  }

  // Get initial data if in edit mode
  let initialData: SerializedTransaction | null = null;
  if (editMode && editId) {
    try {
      const transactionResponse = await getTransaction(editId);
      if (transactionResponse.success) {
        initialData = transactionResponse.data;
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Transaction not found</p>
        </div>
      );
    }
  }

  // Filter and cast categories to match Category type
  const categories = defaultCategories.filter(
    (cat) => cat.type === "INCOME" || cat.type === "EXPENSE"
  ) as Category[];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[80vh] px-5">
      <div className="mb-8 w-full max-w-3xl">
        <h1 className="text-5xl gradient-title text-center">
          {editMode ? "Edit Transaction" : "Add Transaction"}
        </h1>
      </div>
      <div className="w-full max-w-3xl">
        <AddTransactionForm
          accounts={accountsResponse.data ?? []}
          categories={categories}
          editMode={editMode}
          initialData={initialData}
          editId={editId}
        />
      </div>
    </div>
  );
}