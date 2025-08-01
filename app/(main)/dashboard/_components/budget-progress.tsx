"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Budget } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

// Props interface
interface BudgetProgressProps {
  initialBudget: (Omit<Budget, "amount"> & { amount: number }) | null;
  currentExpenses: number;
}

export function BudgetProgress({ initialBudget, currentExpenses }: BudgetProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");
  const [localBudget, setLocalBudget] = useState(initialBudget);
  const router = useRouter();

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = localBudget
    ? (currentExpenses / localBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn({ amount }); // FIX: match server action signature
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      // Update local state immediately for better UX
      if (updatedBudget.data) {
        setLocalBudget(updatedBudget.data);
      }
      toast.success("Budget updated successfully");
      // Force refresh to update the budget display
      router.refresh();
    }
  }, [updatedBudget, router]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : (error as Error)?.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Monthly Budget
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={!!isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={!!isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={!!isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription className="text-base text-blue-700 dark:text-blue-300">
                  {localBudget
                    ? ` ₹${currentExpenses.toFixed(2)} of ₹ ${localBudget.amount.toFixed(2)} spent`
                    : "No budget set - Click to add one"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {localBudget ? (
          <div className="space-y-3">
            <Progress
              value={percentUsed}
              className={`h-3 ${
                percentUsed >= 90
                  ? "[&>div]:bg-red-500"
                  : percentUsed >= 75
                  ? "[&>div]:bg-yellow-500"
                  : "[&>div]:bg-green-500"
              }`}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Remaining: ₹{(localBudget.amount - currentExpenses).toFixed(2)}
              </p>
              <p className="text-sm font-medium">
                {percentUsed.toFixed(1)}% used
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Set a monthly budget to track your spending
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
