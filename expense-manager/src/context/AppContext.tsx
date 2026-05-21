import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Transaction, Category, DashboardData, ReportData, Budget, Page } from "@/types";
import { api } from "@/lib/gas";

interface AppState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentMonth: number;
  currentYear: number;
  setMonth: (month: number, year: number) => void;
  transactions: Transaction[];
  categories: Category[];
  dashboardData: DashboardData | null;
  reportData: ReportData | null;
  budgets: Budget[];
  loading: boolean;
  refreshAll: () => void;
  addTransaction: (data: Omit<Transaction, "id" | "createdAt" | "categoryName">) => Promise<void>;
  updateTransaction: (data: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, "id">) => Promise<void>;
  updateCategory: (data: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveBudget: (data: Omit<Budget, "id" | "spent" | "categoryName">) => Promise<void>;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  transactionFormOpen: boolean;
  setTransactionFormOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const initDone = useRef(false);

  const setMonth = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Background refresh — fires API calls, updates state when done, never throws
  const refreshAllData = useCallback(async (month: number, year: number) => {
    const promises = [
      api.getCategories().then(setCategories).catch((e: unknown) => console.error("cats:", e)),
      api.getTransactions({ month, year }).then(setTransactions).catch((e: unknown) => console.error("txs:", e)),
      api.getDashboardData({ month, year }).then(setDashboardData).catch((e: unknown) => console.error("dash:", e)),
      api.getBudgets({ month, year }).then(setBudgets).catch((e: unknown) => console.error("budgets:", e)),
      api.getReportData({ month, year }).then(setReportData).catch((e: unknown) => console.error("report:", e)),
    ];
    await Promise.all(promises);
  }, []);

  const refreshAll = useCallback(() => {
    refreshAllData(currentMonth, currentYear);
  }, [refreshAllData, currentMonth, currentYear]);

  // Initial load
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const init = async () => {
      setLoading(true);
      await refreshAllData(currentMonth, currentYear);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when month/year changes (but not on initial mount)
  const prevMonth = useRef(currentMonth);
  const prevYear = useRef(currentYear);
  useEffect(() => {
    if (prevMonth.current === currentMonth && prevYear.current === currentYear) return;
    prevMonth.current = currentMonth;
    prevYear.current = currentYear;
    refreshAllData(currentMonth, currentYear);
  }, [currentMonth, currentYear, refreshAllData]);

  // ── Mutation actions: fire-and-forget save, then background refresh ──

  const addTransaction = useCallback(
    async (data: Omit<Transaction, "id" | "createdAt" | "categoryName">) => {
      try { await api.addTransaction(data); } catch (e) { console.error("addTx:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const updateTransaction = useCallback(
    async (data: Transaction) => {
      try { await api.updateTransaction(data); } catch (e) { console.error("updateTx:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      try { await api.deleteTransaction(id); } catch (e) { console.error("deleteTx:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const addCategory = useCallback(
    async (data: Omit<Category, "id">) => {
      try { await api.addCategory(data); } catch (e) { console.error("addCat:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const updateCategory = useCallback(
    async (data: Category) => {
      try { await api.updateCategory(data); } catch (e) { console.error("updateCat:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try { await api.deleteCategory(id); } catch (e) { console.error("deleteCat:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const saveBudget = useCallback(
    async (data: Omit<Budget, "id" | "spent" | "categoryName">) => {
      try { await api.saveBudget(data); } catch (e) { console.error("saveBudget:", e); }
      refreshAllData(currentMonth, currentYear);
    },
    [refreshAllData, currentMonth, currentYear]
  );

  const value = useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      currentMonth,
      currentYear,
      setMonth,
      transactions,
      categories,
      dashboardData,
      reportData,
      budgets,
      loading,
      refreshAll,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      saveBudget,
      sidebarOpen,
      setSidebarOpen,
      transactionFormOpen,
      setTransactionFormOpen,
      editingTransaction,
      setEditingTransaction,
    }),
    [
      currentPage,
      currentMonth,
      currentYear,
      setMonth,
      transactions,
      categories,
      dashboardData,
      reportData,
      budgets,
      loading,
      refreshAll,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      saveBudget,
      sidebarOpen,
      transactionFormOpen,
      editingTransaction,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
