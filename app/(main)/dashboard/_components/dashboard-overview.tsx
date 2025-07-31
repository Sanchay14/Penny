"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Types
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

interface Account {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
  _count: { transactions: number };
}

interface DashboardOverviewProps {
  transactions: SerializedTransaction[];
  accounts: Account[];
}

export function DashboardOverview({ transactions, accounts }: DashboardOverviewProps) {
  // Find default account or use first account
  const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccount?.id || "");

  // Filter transactions by selected account
  const filteredTransactions = useMemo(() => {
    if (!selectedAccountId) return [];
    return transactions.filter(t => t.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(0, 5);
  }, [filteredTransactions]);

  // Calculate monthly expenses by category for current month
  const monthlyExpenseData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === "EXPENSE" && 
             transactionDate >= startOfMonth && 
             transactionDate <= endOfMonth;
    });

    // Group by category
    const categoryMap = new Map<string, number>();
    monthlyExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    // Convert to chart data with colors
    const colors = [
      "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe",
      "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d084d0"
    ];

    return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " "),
      value: amount,
      color: colors[index % colors.length],
    }));
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              {accounts.length > 1 && (
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No transactions found for this account
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {transaction.description || "No description"}
                        </p>
                        <Badge variant={transaction.type === "INCOME" ? "default" : "destructive"}>
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatCategory(transaction.category)}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "INCOME" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Expense Pie Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyExpenseData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expenses this month
              </p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthlyExpenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {monthlyExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
