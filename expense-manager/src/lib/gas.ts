// Google Apps Script communication layer
// In dev mode (outside Apps Script), uses mock data
// In production (served from Apps Script), uses google.script.run

import type {
  Transaction,
  Category,
  DashboardData,
  ReportData,
  Budget,
} from "@/types";
import { generateId } from "./utils";

const isGAS = typeof google !== "undefined" && google?.script?.run;

// ── Mock data for local development ──────────────────────────────────────────

const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "Ăn uống", type: "expense", icon: "UtensilsCrossed", color: "#ef4444" },
  { id: "c2", name: "Di chuyển", type: "expense", icon: "Car", color: "#f97316" },
  { id: "c3", name: "Mua sắm", type: "expense", icon: "ShoppingBag", color: "#a855f7" },
  { id: "c4", name: "Hóa đơn", type: "expense", icon: "Receipt", color: "#eab308" },
  { id: "c5", name: "Giải trí", type: "expense", icon: "Gamepad2", color: "#ec4899" },
  { id: "c6", name: "Sức khỏe", type: "expense", icon: "Heart", color: "#14b8a6" },
  { id: "c7", name: "Giáo dục", type: "expense", icon: "GraduationCap", color: "#6366f1" },
  { id: "c8", name: "Khác", type: "expense", icon: "MoreHorizontal", color: "#64748b" },
  { id: "c9", name: "Lương", type: "income", icon: "Banknote", color: "#22c55e" },
  { id: "c10", name: "Thưởng", type: "income", icon: "Gift", color: "#06b6d4" },
  { id: "c11", name: "Đầu tư", type: "income", icon: "TrendingUp", color: "#8b5cf6" },
  { id: "c12", name: "Thu nhập khác", type: "income", icon: "Plus", color: "#78716c" },
];

function generateMockTransactions(): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];
  const expenseCats = MOCK_CATEGORIES.filter((c) => c.type === "expense");
  const incomeCats = MOCK_CATEGORIES.filter((c) => c.type === "income");
  const descriptions: Record<string, string[]> = {
    c1: ["Cơm trưa", "Cà phê sáng", "Bún bò", "Trà sữa", "Phở bò"],
    c2: ["Grab đi làm", "Xăng xe", "Gửi xe", "Grab về nhà"],
    c3: ["Quần áo", "Đồ gia dụng", "Phụ kiện điện thoại"],
    c4: ["Tiền điện", "Tiền nước", "Internet", "Điện thoại"],
    c5: ["Xem phim", "Netflix", "Game", "Cafe bạn bè"],
    c6: ["Thuốc", "Khám bệnh", "Gym"],
    c7: ["Sách", "Khóa học online"],
    c8: ["Chi phí khác"],
    c9: ["Lương tháng"],
    c10: ["Thưởng KPI", "Thưởng dự án"],
    c11: ["Cổ tức", "Lãi tiết kiệm"],
    c12: ["Freelance", "Bán đồ cũ"],
  };

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const isIncome = Math.random() < 0.25;
    const cat = isIncome
      ? incomeCats[Math.floor(Math.random() * incomeCats.length)]
      : expenseCats[Math.floor(Math.random() * expenseCats.length)];
    const descs = descriptions[cat.id] || ["Giao dịch"];
    const desc = descs[Math.floor(Math.random() * descs.length)];
    const amount = isIncome
      ? Math.round((Math.random() * 15000000 + 5000000) / 1000) * 1000
      : Math.round((Math.random() * 500000 + 20000) / 1000) * 1000;

    transactions.push({
      id: generateId() + i,
      date: date.toISOString().split("T")[0],
      amount,
      category: cat.id,
      categoryName: cat.name,
      description: desc,
      type: isIncome ? "income" : "expense",
      createdAt: date.toISOString(),
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

let mockTransactions = generateMockTransactions();
let mockCategories = [...MOCK_CATEGORIES];
let mockBudgets: Budget[] = [
  { id: "b1", categoryId: "c1", categoryName: "Ăn uống", amount: 3000000, spent: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: "b2", categoryId: "c2", categoryName: "Di chuyển", amount: 1500000, spent: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: "b3", categoryId: "c3", categoryName: "Mua sắm", amount: 2000000, spent: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { id: "b4", categoryId: "c5", categoryName: "Giải trí", amount: 1000000, spent: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
];

// ── GAS wrapper ──────────────────────────────────────────────────────────────

function gasCall<T>(method: string, ...args: unknown[]): Promise<T> {
  if (isGAS) {
    return new Promise((resolve, reject) => {
      let runner = google!.script.run
        .withSuccessHandler((result: T) => resolve(result))
        .withFailureHandler((err: Error) => reject(err));
      (runner as unknown as Record<string, (...a: unknown[]) => void>)[method](...args);
    });
  }
  return mockCall<T>(method, args);
}

function mockCall<T>(method: string, args: unknown[]): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = mockHandler(method, args);
      resolve(result as T);
    }, 300);
  });
}

function mockHandler(method: string, args: unknown[]): unknown {
  const now = new Date();

  switch (method) {
    case "getTransactions": {
      const params = (args[0] as { month?: number; year?: number }) || {};
      const month = params.month || now.getMonth() + 1;
      const year = params.year || now.getFullYear();
      return mockTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
    }

    case "addTransaction": {
      const data = args[0] as Transaction;
      const cat = mockCategories.find((c) => c.id === data.category);
      const newTx: Transaction = {
        ...data,
        id: generateId(),
        categoryName: cat?.name || "",
        createdAt: new Date().toISOString(),
      };
      mockTransactions.unshift(newTx);
      return newTx;
    }

    case "updateTransaction": {
      const data = args[0] as Transaction;
      const cat = mockCategories.find((c) => c.id === data.category);
      const idx = mockTransactions.findIndex((t) => t.id === data.id);
      if (idx >= 0) {
        mockTransactions[idx] = { ...mockTransactions[idx], ...data, categoryName: cat?.name || "" };
      }
      return mockTransactions[idx];
    }

    case "deleteTransaction": {
      const id = args[0] as string;
      mockTransactions = mockTransactions.filter((t) => t.id !== id);
      return { success: true };
    }

    case "getCategories":
      return mockCategories;

    case "addCategory": {
      const data = args[0] as Category;
      const newCat = { ...data, id: generateId() };
      mockCategories.push(newCat);
      return newCat;
    }

    case "updateCategory": {
      const data = args[0] as Category;
      const idx = mockCategories.findIndex((c) => c.id === data.id);
      if (idx >= 0) mockCategories[idx] = { ...mockCategories[idx], ...data };
      return mockCategories[idx];
    }

    case "deleteCategory": {
      const id = args[0] as string;
      mockCategories = mockCategories.filter((c) => c.id !== id);
      return { success: true };
    }

    case "getDashboardData": {
      const params = (args[0] as { month?: number; year?: number }) || {};
      const month = params.month || now.getMonth() + 1;
      const year = params.year || now.getFullYear();
      const monthTx = mockTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
      const totalIncome = monthTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const totalExpense = monthTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      const catMap = new Map<string, { name: string; value: number; color: string }>();
      monthTx
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          const cat = mockCategories.find((c) => c.id === t.category);
          const key = t.category;
          const existing = catMap.get(key);
          if (existing) {
            existing.value += t.amount;
          } else {
            catMap.set(key, {
              name: cat?.name || "Khác",
              value: t.amount,
              color: cat?.color || "#64748b",
            });
          }
        });

      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyTrend: { date: string; income: number; expense: number }[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayTx = monthTx.filter((t) => t.date === dateStr);
        dailyTrend.push({
          date: String(d).padStart(2, "0"),
          income: dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        });
      }

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        recentTransactions: monthTx.slice(0, 5),
        expenseByCategory: Array.from(catMap.values()),
        dailyTrend,
      } as DashboardData;
    }

    case "getReportData": {
      const monthlyTrend: { month: string; income: number; expense: number }[] = [];
      for (let m = 0; m < 6; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const mo = d.getMonth() + 1;
        const yr = d.getFullYear();
        const mTx = mockTransactions.filter((t) => {
          const td = new Date(t.date);
          return td.getMonth() + 1 === mo && td.getFullYear() === yr;
        });
        monthlyTrend.unshift({
          month: `T${mo}`,
          income: mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        });
      }

      const allExpense = mockTransactions.filter((t) => t.type === "expense");
      const catMap2 = new Map<string, { name: string; value: number; color: string }>();
      allExpense.forEach((t) => {
        const cat = mockCategories.find((c) => c.id === t.category);
        const existing = catMap2.get(t.category);
        if (existing) existing.value += t.amount;
        else catMap2.set(t.category, { name: cat?.name || "Khác", value: t.amount, color: cat?.color || "#64748b" });
      });

      const allIncome = mockTransactions.filter((t) => t.type === "income");
      const incMap = new Map<string, { name: string; value: number; color: string }>();
      allIncome.forEach((t) => {
        const cat = mockCategories.find((c) => c.id === t.category);
        const existing = incMap.get(t.category);
        if (existing) existing.value += t.amount;
        else incMap.set(t.category, { name: cat?.name || "Khác", value: t.amount, color: cat?.color || "#64748b" });
      });

      return {
        monthlyTrend,
        expenseByCategory: Array.from(catMap2.values()),
        incomeByCategory: Array.from(incMap.values()),
        topExpenses: allExpense
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10),
      } as ReportData;
    }

    case "getBudgets": {
      const params = (args[0] as { month?: number; year?: number }) || {};
      const month = params.month || now.getMonth() + 1;
      const year = params.year || now.getFullYear();
      const monthTx = mockTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year && t.type === "expense";
      });
      return mockBudgets
        .filter((b) => b.month === month && b.year === year)
        .map((b) => ({
          ...b,
          spent: monthTx.filter((t) => t.category === b.categoryId).reduce((s, t) => s + t.amount, 0),
        }));
    }

    case "saveBudget": {
      const data = args[0] as Budget;
      const idx = mockBudgets.findIndex(
        (b) => b.categoryId === data.categoryId && b.month === data.month && b.year === data.year
      );
      if (idx >= 0) {
        mockBudgets[idx] = { ...mockBudgets[idx], amount: data.amount };
      } else {
        const cat = mockCategories.find((c) => c.id === data.categoryId);
        mockBudgets.push({ ...data, id: generateId(), categoryName: cat?.name || "" });
      }
      return { success: true };
    }

    default:
      return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  getTransactions: (params?: { month?: number; year?: number }) =>
    gasCall<Transaction[]>("getTransactions", params),

  addTransaction: (data: Omit<Transaction, "id" | "createdAt" | "categoryName">) =>
    gasCall<Transaction>("addTransaction", data),

  updateTransaction: (data: Transaction) =>
    gasCall<Transaction>("updateTransaction", data),

  deleteTransaction: (id: string) =>
    gasCall<{ success: boolean }>("deleteTransaction", id),

  getCategories: () => gasCall<Category[]>("getCategories"),

  addCategory: (data: Omit<Category, "id">) =>
    gasCall<Category>("addCategory", data),

  updateCategory: (data: Category) =>
    gasCall<Category>("updateCategory", data),

  deleteCategory: (id: string) =>
    gasCall<{ success: boolean }>("deleteCategory", id),

  getDashboardData: (params?: { month?: number; year?: number }) =>
    gasCall<DashboardData>("getDashboardData", params),

  getReportData: (params?: { month?: number; year?: number }) =>
    gasCall<ReportData>("getReportData", params),

  getBudgets: (params?: { month?: number; year?: number }) =>
    gasCall<Budget[]>("getBudgets", params),

  saveBudget: (data: Omit<Budget, "id" | "spent" | "categoryName">) =>
    gasCall<{ success: boolean }>("saveBudget", data),
};
