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
    <Card className="group hover:shadow-xl transition-all duration-300 ease-in-out relative hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300">
      <div className="absolute top-3 right-3 z-10">
        <Switch
          checked={isDefault}
          onCheckedChange={handleDefaultToggle}
          disabled={isLoading}
          className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-400 h-5 w-9 border-gray-300 transition-all duration-300 group-hover:scale-110"
          title={isDefault ? "Default Account" : "Set as Default Account"}
        />
      </div>
      <Link href={`/account/${id}`} className="block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pr-12">
          <CardTitle className="text-sm font-medium transition-all duration-300 group-hover:text-blue-700 group-hover:font-semibold">{name}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold transition-all duration-300 group-hover:text-blue-800 group-hover:scale-105">
            ₹{parseFloat(balance.toString()).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground transition-all duration-300 group-hover:text-blue-600">
            {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()} Account
            {isDefault && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 transition-all duration-300 group-hover:bg-green-200 group-hover:scale-105">
                Default
              </span>
            )}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center transition-all duration-300 group-hover:text-green-600">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500 transition-all duration-300 group-hover:scale-110 group-hover:text-green-600" />
            Income
          </div>
          <div className="flex items-center transition-all duration-300 group-hover:text-red-600">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
