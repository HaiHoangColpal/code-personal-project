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
  LineChart,
  Line,
} from "recharts";

const CHART_COLORS = {
  income: "#10b981",
  expense: "#f43f5e",
};

const currencyFormatter = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

export function Reports() {
  const { reportData } = useApp();

  if (!reportData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Đang tải báo cáo...
      </div>
    );
  }

  const { monthlyTrend, expenseByCategory, incomeByCategory, topExpenses } = reportData;

  return (
    <div className="space-y-6">
      {/* Monthly trend - Bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Thu chi 6 tháng gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={currencyFormatter} />
                <Tooltip formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Thu nhập" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Chi tiêu" />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly trend - Line chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Xu hướng thu chi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={currencyFormatter} />
                <Tooltip formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Thu nhập" />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Chi tiêu" />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Expense by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {expenseByCategory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {expenseByCategory.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Income by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Thu nhập theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {incomeByCategory.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={incomeByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {incomeByCategory.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top chi tiêu lớn nhất</CardTitle>
        </CardHeader>
        <CardContent>
          {topExpenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2">
              {topExpenses.map((tx, idx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.categoryName} &middot; {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-500">-{formatCurrency(tx.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
