import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { JarsAnalysis } from "./JarsAnalysis";
import { FamilyAnalysis } from "./FamilyAnalysis";
import { GeminiAssistant } from "./GeminiAssistant";

const CHART_COLORS = {
  income: "#10b981",
  expense: "#f43f5e",
  balance: "#6366f1",
};

const currencyFormatter = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

export function Dashboard() {
  const { dashboardData, setCurrentPage } = useApp();

  if (!dashboardData) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Không có dữ liệu
      </div>
    );
  }

  const { totalIncome, totalExpense, balance, recentTransactions, expenseByCategory, dailyTrend } =
    dashboardData;

  const summaryCards = [
    {
      label: "Thu nhập",
      value: totalIncome,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
    },
    {
      label: "Chi tiêu",
      value: totalExpense,
      icon: TrendingDown,
      gradient: "from-rose-500 to-pink-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
    },
    {
      label: "Số dư",
      value: balance,
      icon: Wallet,
      gradient: balance >= 0 ? "from-indigo-500 to-blue-600" : "from-orange-500 to-red-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg sm:last:col-span-2 lg:last:col-span-1`}
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/[0.08]" />
            <div className="absolute -right-2 bottom-2 h-16 w-16 rounded-full bg-white/[0.05]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/75">{card.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-white">
                  {formatCurrency(card.value)}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân tích 6 JARS */}
      <JarsAnalysis />

      {/* Bóc tách chi phí gia đình / con cái */}
      <FamilyAnalysis />

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Daily trend chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Xu hướng thu chi trong tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={currencyFormatter}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} name="Thu nhập" />
                  <Bar dataKey="expense" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} name="Chi tiêu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense by category pie */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {expenseByCategory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Chưa có dữ liệu chi tiêu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "12px" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold">Giao dịch gần đây</CardTitle>
          <button
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={() => setCurrentPage("transactions")}
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có giao dịch nào
            </p>
          ) : (
            <div className="divide-y">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        tx.type === "income"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowUpRight className="h-[18px] w-[18px]" />
                      ) : (
                        <ArrowDownRight className="h-[18px] w-[18px]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.categoryName} &middot; {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${
                    tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trợ lý tài chính AI Gemini */}
      <GeminiAssistant />
    </div>
  );
}
