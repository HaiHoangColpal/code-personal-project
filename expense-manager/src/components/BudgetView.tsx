import { useState } from "react";
import { Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export function BudgetView() {
  const { budgets, categories, currentMonth, currentYear, saveBudget } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const handleSave = async () => {
    if (!selectedCategory || !budgetAmount) return;
    setSaving(true);
    try {
      await saveBudget({
        categoryId: selectedCategory,
        amount: Number(budgetAmount),
        month: currentMonth,
        year: currentYear,
      });
      setFormOpen(false);
      setSelectedCategory("");
      setBudgetAmount("");
    } catch (e) {
      console.error("Failed to save budget:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall summary */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng ngân sách tháng</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Đã chi: <span className={totalSpent > totalBudget ? "text-red-500 font-medium" : "text-foreground font-medium"}>
                  {formatCurrency(totalSpent)}
                </span>{" "}
                ({overallPercent}%)
              </p>
            </div>
            <Button size="sm" onClick={() => setFormOpen(true)} className="rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm ngân sách
            </Button>
          </div>
          {/* Overall progress bar */}
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 100
                  ? "bg-red-500"
                  : overallPercent > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget items */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <p className="text-sm text-muted-foreground">Chưa có ngân sách nào được thiết lập</p>
            <Button size="sm" className="mt-3 rounded-xl" onClick={() => setFormOpen(true)}>
              Thiết lập ngân sách đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {budgets.map((budget) => {
            const percent = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
            const isOver = percent > 100;
            const isWarning = percent > 80 && !isOver;
            const remaining = budget.amount - budget.spent;

            return (
              <Card key={budget.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{budget.categoryName}</span>
                      {isOver && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      {!isOver && percent <= 80 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{percent}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                    <span className={remaining < 0 ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}>
                      {remaining >= 0 ? `Còn ${formatCurrency(remaining)}` : `Vượt ${formatCurrency(Math.abs(remaining))}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add budget dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogContent>
          <DialogHeader onClose={() => setFormOpen(false)}>
            <DialogTitle>Thêm ngân sách</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Danh mục</label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="Chọn danh mục chi tiêu"
                options={expenseCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Hạn mức (VND)</label>
              <Input
                type="number"
                placeholder="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                min="0"
                step="100000"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleSave}
                disabled={saving || !selectedCategory || !budgetAmount}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
