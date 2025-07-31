"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction, scanReceipt } from "@/actions/transaction";

// Types
interface Account {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

interface ReceiptScanResult {
  amount: number;
  date: Date;
  description: string;
  category: string;
  merchantName: string;
}

interface TransactionResponse {
  success: boolean;
  data: {
    accountId: string;
  };
}

interface AddTransactionFormProps {
  accounts: Account[];
  categories: Category[];
  editMode?: boolean;
  initialData?: SerializedTransaction | null;
  editId?: string;
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
}

// Validation Schema
const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.number().min(0.01, "Amount is required"),
    description: z.string().nullable(),
    date: z.date(), // removed { required_error: ... }
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean(),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
    notes: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });

type TransactionFormData = z.infer<typeof transactionSchema>;

export function AddTransactionForm({ 
  accounts, 
  categories, 
  editMode = false, 
  initialData = null, 
  editId 
}: AddTransactionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAccountId = accounts.find((ac) => ac.isDefault)?.id || (accounts[0]?.id ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editMode && initialData ? {
      type: initialData.type,
      amount: initialData.amount,
      description: initialData.description,
      date: new Date(initialData.date),
      isRecurring: initialData.isRecurring,
      notes: initialData.notes,
      accountId: initialData.accountId,
      category: initialData.category,
      recurringInterval: initialData.recurringInterval || undefined,
    } : {
      type: "EXPENSE",
      amount: 0.01,
      description: null,
      date: new Date(),
      isRecurring: false,
      notes: null,
      accountId: defaultAccountId,
      category: "",
      recurringInterval: undefined,
    },
  });

  const {
    loading: createTransactionLoading,
    fn: createTransactionFn,
    data: newTransaction,
  } = useFetch<TransactionResponse, [TransactionFormData]>(createTransaction);

  const {
    loading: updateTransactionLoading,
    fn: updateTransactionFn,
    data: updatedTransaction,
  } = useFetch<TransactionResponse, [string, TransactionFormData]>(updateTransaction);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch<ReceiptScanResult, [File]>(scanReceipt);

  const onSubmit = async (data: TransactionFormData): Promise<void> => {
    if (editMode && editId) {
      await updateTransactionFn(editId, data);
    } else {
      await createTransactionFn(data);
    }
  };

  const handleReceiptScan = async (file: File): Promise<void> => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      // Auto-fill form with scanned data
      setValue("amount", scannedData.amount);
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData, setValue]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  useEffect(() => {
    const transactionResult = editMode ? updatedTransaction : newTransaction;
    const isLoading = editMode ? updateTransactionLoading : createTransactionLoading;
    
    if (transactionResult && transactionResult.success && !isLoading) {
      const successMessage = editMode ? "Transaction updated successfully" : "Transaction created successfully";
      toast.success(successMessage);
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [newTransaction, updatedTransaction, createTransactionLoading, updateTransactionLoading, editMode, router]);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Scanner - Only show in create mode */}
      {!editMode && (
        <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) handleReceiptScan(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!scanReceiptLoading}
          >
            {scanReceiptLoading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                <span>Scanning Receipt...</span>
              </>
            ) : (
              <>
                <Camera className="mr-2" />
                <span>Scan Receipt with AI</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value: "INCOME" | "EXPENSE") => setValue("type", value)}
          value={watch("type")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={watch("amount")}
            onChange={e => setValue("amount", parseFloat(e.target.value) || 0)}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            value={watch("accountId")}
            onValueChange={(value: string) => setValue("accountId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ( ₹ {parseFloat(account.balance.toString()).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select 
          onValueChange={(value: string) => setValue("category", value)}
          value={watch("category")}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={scannedData?.category || "Select category"}
            />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date: Date | undefined) => date && setValue("date", date)}
              disabled={(date: Date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked: boolean) => setValue("isRecurring", checked)}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY") =>
              setValue("recurringInterval", value)
            }
            value={watch("recurringInterval") || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Add any additional notes"
          className="resize-none"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 mt-6">
        <Button
          type="submit"
          className="w-48"
          disabled={!!(editMode ? updateTransactionLoading : createTransactionLoading)}
        >
          {(editMode ? updateTransactionLoading : createTransactionLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            editMode ? "Update Transaction" : "Create Transaction"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="mt-2"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}