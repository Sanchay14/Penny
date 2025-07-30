import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React, { CSSProperties } from "react";

// Type definitions
interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  byCategory: Record<string, number>;
}

interface MonthlyReportData {
  month?: string;
  stats?: MonthlyStats;
  insights?: string[];
}

interface BudgetAlertData {
  percentageUsed?: number;
  budgetAmount?: string | number;
  totalExpenses?: string | number;
  accountName?: string;
}

type EmailData = MonthlyReportData | BudgetAlertData;

interface EmailTemplateProps {
  userName?: string | null;
  type?: "monthly-report" | "budget-alert";
  data?: EmailData;
}

// Type guards
function isMonthlyReportData(data: EmailData, type: string): data is MonthlyReportData {
  return type === "monthly-report";
}

function isBudgetAlertData(data: EmailData, type: string): data is BudgetAlertData {
  return type === "budget-alert";
}

// Styles
const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#f8fafc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif',
    margin: 0,
    padding: "40px 20px",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    maxWidth: "600px",
  },
  title: {
    fontSize: "28px",
    lineHeight: "1.2",
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center" as const,
    margin: "0 0 32px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heading: {
    fontSize: "20px",
    lineHeight: "1.3",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 16px 0",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: "0 0 16px 0",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    margin: "24px 0",
    border: "1px solid #e5e7eb",
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  stat: {
    textAlign: "center" as const,
    minWidth: "150px",
    maxWidth: "180px",
    flex: "1",
    padding: "16px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    border: "1px solid #f3f4f6",
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0 0 8px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0",
  },
  section: {
    padding: "24px 0",
    borderTop: "1px solid #e5e7eb",
  },
  categorySection: {
    backgroundColor: "#f9fafb",
    padding: "24px",
    borderRadius: "12px",
    margin: "24px 0",
    border: "1px solid #e5e7eb",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  categoryName: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#374151",
  },
  categoryAmount: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  insightSection: {
    backgroundColor: "#fffbeb",
    padding: "24px",
    borderRadius: "12px",
    margin: "24px 0",
    border: "1px solid #fbbf24",
  },
  insight: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#92400e",
    margin: "0 0 12px 0",
    paddingLeft: "20px",
    position: "relative" as const,
  },
  alertContainer: {
    backgroundColor: "#fef2f2",
    padding: "24px",
    borderRadius: "12px",
    margin: "24px 0",
    border: "2px solid #fca5a5",
  },
  alertText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center" as const,
    margin: "0 0 16px 0",
  },
  footer: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#6b7280",
    textAlign: "center" as const,
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "2px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    padding: "24px",
    borderRadius: "8px",
  },
};

// Dummy data for preview
const PREVIEW_DATA = {
  monthlyReport: {
    userName: "John Doe",
    type: "monthly-report" as const,
    data: {
      month: "December",
      stats: {
        totalIncome: 5000,
        totalExpenses: 3500,
        byCategory: {
          housing: 1500,
          groceries: 600,
          transportation: 400,
          entertainment: 300,
          utilities: 700,
        },
      },
      insights: [
        "Your housing expenses are 43% of your total spending - consider reviewing your housing costs.",
        "Great job keeping entertainment expenses under control this month!",
        "Setting up automatic savings could help you save 20% more of your income.",
      ],
    },
  },
  budgetAlert: {
    userName: "John Doe",
    type: "budget-alert" as const,
    data: {
      percentageUsed: 85,
      budgetAmount: 4000,
      totalExpenses: 3400,
    },
  },
};

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data = {},
}: EmailTemplateProps): React.ReactElement {
  if (type === "monthly-report") {
    const monthlyData = isMonthlyReportData(data, type) ? data : null;
    
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>📊 Monthly Financial Report</Heading>

            <Text style={styles.text}>Hello {userName || "there"}! 👋</Text>
            <Text style={styles.text}>
              Here's your comprehensive financial summary for {monthlyData?.month || "this month"}:
            </Text>

            {/* Main Stats */}
            {monthlyData?.stats && (
              <Section style={styles.statsContainer}>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>Total Income</Text>
                  <Text style={styles.statValue}>₹{monthlyData.stats.totalIncome.toLocaleString()}</Text>
                </div>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                  <Text style={styles.statValue}>₹{monthlyData.stats.totalExpenses.toLocaleString()}</Text>
                </div>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>Net Savings</Text>
                  <Text style={styles.statValue}>
                    ₹{(monthlyData.stats.totalIncome - monthlyData.stats.totalExpenses).toLocaleString()}
                  </Text>
                </div>
              </Section>
            )}

            {/* Category Breakdown */}
            {monthlyData?.stats?.byCategory && (
              <Section style={styles.categorySection}>
                <Heading style={styles.heading}>💳 Expenses by Category</Heading>
                {Object.entries(monthlyData.stats.byCategory).map(
                  ([category, amount]) => (
                    <div key={category} style={styles.row}>
                      <Text style={styles.categoryName}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                      <Text style={styles.categoryAmount}>₹{Number(amount).toLocaleString()}</Text>
                    </div>
                  )
                )}
              </Section>
            )}

            {/* AI Insights */}
            {monthlyData?.insights && monthlyData.insights.length > 0 && (
              <Section style={styles.insightSection}>
                <Heading style={styles.heading}>💡 Smart Insights</Heading>
                {monthlyData.insights.map((insight, index) => (
                  <Text key={index} style={styles.insight}>
                    {insight}
                  </Text>
                ))}
              </Section>
            )}

            <Text style={styles.footer}>
              🚀 Thank you for using Penyy! Keep tracking your finances for better financial health.
              <br />
              <strong>Stay financially smart! 💰</strong>
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    const budgetData = isBudgetAlertData(data, type) ? data : null;
    
    return (
      <Html>
        <Head />
        <Preview>🚨 Budget Alert - Immediate Attention Required</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>🚨 Budget Alert</Heading>
            
            <div style={styles.alertContainer}>
              <Text style={styles.alertText}>
                ⚠️ Budget Warning: {budgetData?.percentageUsed?.toFixed(1) || "0"}% Used
              </Text>
              <Text style={styles.text}>Hello {userName || "there"}! 👋</Text>
              <Text style={styles.text}>
                You've used <strong>{budgetData?.percentageUsed?.toFixed(1) || "0"}%</strong> of your
                monthly budget for <strong>{budgetData?.accountName || "your account"}</strong>.
              </Text>
            </div>

            {budgetData && (
              <Section style={styles.statsContainer}>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>💰 Budget Amount</Text>
                  <Text style={styles.statValue}>₹{Number(budgetData.budgetAmount).toLocaleString()}</Text>
                </div>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>💸 Spent So Far</Text>
                  <Text style={styles.statValue}>₹{Number(budgetData.totalExpenses).toLocaleString()}</Text>
                </div>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>💵 Remaining</Text>
                  <Text style={styles.statValue}>
                    ₹{(Number(budgetData.budgetAmount) - Number(budgetData.totalExpenses)).toLocaleString()}
                  </Text>
                </div>
              </Section>
            )}

            <Section style={styles.insightSection}>
              <Heading style={styles.heading}>💡 Quick Tips</Heading>
              <Text style={styles.insight}>
                📊 Review your recent transactions to identify areas where you can cut back
              </Text>
              <Text style={styles.insight}>
                🎯 Consider setting up spending alerts for individual categories
              </Text>
              <Text style={styles.insight}>
                📱 Use the Penyy app to track your daily expenses in real-time
              </Text>
            </Section>
            
            <Text style={styles.footer}>
              🎯 Stay on track with your budget goals! 
              <br />
              <strong>Smart spending leads to financial freedom! 🚀</strong>
              <br />
              <em>- Your friends at Penyy 💰</em>
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  // Fallback return
  return (
    <Html>
      <Head />
      <Preview>Penyy - Email Template</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.title}>❌ Error</Heading>
          <Text style={styles.alertText}>Invalid email type specified.</Text>
          <Text style={styles.footer}>
            Please contact support if you continue to see this message.
            <br />
            <em>- Penyy Support Team 💰</em>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}