export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  categoryName?: string;
  description: string;
  type: TransactionType;
  createdAt: string;
  jar?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: Transaction[];
  expenseByCategory: { name: string; value: number; color: string }[];
  dailyTrend: { date: string; income: number; expense: number }[];
}

export interface ReportData {
  monthlyTrend: { month: string; income: number; expense: number }[];
  expenseByCategory: { name: string; value: number; color: string }[];
  incomeByCategory: { name: string; value: number; color: string }[];
  topExpenses: Transaction[];
}

export type Page =
  | "dashboard"
  | "transactions"
  | "categories"
  | "reports"
  | "budgets";
