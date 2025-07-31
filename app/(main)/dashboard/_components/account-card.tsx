"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { setDefaultAccount } from "@/actions/dashboard";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the expected shape of the 'account' prop
interface Account {
  id: string;
  name: string;
  type: string;
  balance: number | string;
  isDefault: boolean;
  _count: Record<string, number>; // Adjust this if _count has a more specific structure
}

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const { name, type, balance, id, isDefault } = account;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDefaultToggle = async (checked: boolean) => {
    if (!checked || isDefault) return; // Only allow setting as default, not unsetting
    
    setIsLoading(true);
    try {
      const result = await setDefaultAccount(id);
      if (result.success) {
        toast.success("Default account updated successfully",{duration:2000});
        // Force refresh the page to update budget progress
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update default account");
      }
    } catch (error) {
      console.error("Failed to update default account:", error);
      toast.error("Failed to update default account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <div className="absolute top-3 right-3 z-10">
        <Switch
          checked={isDefault}
          onCheckedChange={handleDefaultToggle}
          disabled={isLoading}
          className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-400 h-5 w-9 border-gray-300"
          title={isDefault ? "Default Account" : "Set as Default Account"}
        />
      </div>
      <Link href={`/account/${id}`} className="block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pr-12">
          <CardTitle className="text-sm font-medium">{name}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{parseFloat(balance.toString()).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account
            {isDefault && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Default
              </span>
            )}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
