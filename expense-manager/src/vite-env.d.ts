/// <reference types="vite/client" />

interface GoogleScriptRun {
  withSuccessHandler<T>(callback: (result: T) => void): GoogleScriptRun;
  withFailureHandler(callback: (error: Error) => void): GoogleScriptRun;
  getTransactions(params?: { month?: number; year?: number }): void;
  addTransaction(data: Record<string, unknown>): void;
  updateTransaction(data: Record<string, unknown>): void;
  deleteTransaction(id: string): void;
  getCategories(): void;
  addCategory(data: Record<string, unknown>): void;
  updateCategory(data: Record<string, unknown>): void;
  deleteCategory(id: string): void;
  getDashboardData(params?: { month?: number; year?: number }): void;
  getReportData(params?: { month?: number; year?: number }): void;
  getBudgets(params?: { month?: number; year?: number }): void;
  saveBudget(data: Record<string, unknown>): void;
}

interface Google {
  script: {
    run: GoogleScriptRun;
  };
}

declare const google: Google | undefined;
