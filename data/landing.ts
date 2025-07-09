import {
    BarChart3,
    Receipt,
    PieChart,
    CreditCard,
    Globe,
    Zap,
    Shield,
    Mail,
    Camera,
    TrendingUp,
    Bell,
    Lock,
  } from "lucide-react";
  
  interface FeatureData {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }
  
  interface HowItWorksData {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }
  
  interface UserBenefitData {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    benefit: string;
  }
  
  interface TechStackData {
    value: string;
    label: string;
  }
  
  // Replace fake stats with feature highlights
  
  // Keep your existing features but add the new ones
  export const featuresData: FeatureData[] = [
    {
      icon: CreditCard,
      title: "Multi-Account Analysis",
      description:
        "Analyze spending patterns across multiple accounts in one unified dashboard",
    },
    {
      icon: Camera,
      title: "AI Bill Photo Detection",
      description:
        "Snap photos of bills and receipts - our AI automatically extracts and records transaction details",
    },
    {
      icon: Bell,
      title: "Smart Budget Alerts",
      description: "Set budget limits and get email reminders when you're approaching your spending threshold",
    },
    {
      icon: Mail,
      title: "Monthly Tracking Reports",
      description: "Receive detailed monthly spending analysis reports directly in your inbox",
    },
    {
      icon: TrendingUp,
      title: "AI Enhanced Analytics",
      description: "Get intelligent insights on where and how much you spend with advanced AI analysis",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Protected by Clerk authentication, Arcjet security, and advanced bot protection",
    },
  ];
  
  // Keep existing how it works
  export const howItWorksData: HowItWorksData[] = [
    {
      icon: CreditCard,
      title: "1. Connect Your Accounts",
      description:
        "Securely link your bank accounts and credit cards with our encrypted system",
    },
    {
      icon: Camera,
      title: "2. Snap & Track",
      description:
        "Take photos of bills or let our system automatically track your transactions",
    },
    {
      icon: BarChart3,
      title: "3. Get Smart Insights",
      description:
        "Receive AI-powered insights, budget alerts, and monthly reports via email",
    },
  ];
  
  // Replace testimonials with "What Users Will Love" section
  export const userBenefitsData: UserBenefitData[] = [
    {
      icon: Zap,
      title: "Save Time",
      description: "No more manual receipt entry - just snap a photo and let AI handle the rest",
      benefit: "Hours saved every month",
    },
    {
      icon: Shield,
      title: "Stay Protected",
      description: "Enterprise-grade security with Clerk authentication and Arcjet protection",
      benefit: "Bank-level security",
    },
    {
      icon: Mail,
      title: "Never Miss Budget Limits",
      description: "Get timely email alerts when approaching your spending thresholds",
      benefit: "Better financial control",
    },
  ];
  
  // Technology stack for credibility
  export const techStackData: TechStackData[] = [
    {
      value: "Clerk",
      label: "Authentication",
    },
    {
      value: "Arcjet",
      label: "Security Layer",
    },
    {
      value: "AI/ML",
      label: "Photo Detection",
    },
    {
      value: "Email",
      label: "Smart Alerts",
    },
  ];