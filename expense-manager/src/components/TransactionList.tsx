import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionForm } from "./TransactionForm";
import { RecurringTemplates } from "./RecurringTemplates";
import { CategoryIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types";

export function TransactionList() {
  const { transactions, categories, deleteTransaction, setTransactionFormOpen, setEditingTransaction } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const catMap = useMemo(() => {
    const m: Record<string, { icon: string; color: string }> = {};
    categories.forEach((c) => { m[c.id] = { icon: c.icon, color: c.color }; });
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        !search ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.categoryName?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || tx.type === typeFilter;
      const matchCategory = categoryFilter === "all" || tx.category === categoryFilter;
      return matchSearch && matchType && matchCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const totalIncome = useMemo(
    () => filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTransactionFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;
    setDeleting(id);
    try {
      await deleteTransaction(id);
    } finally {
      setDeleting(null);
    }
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setTransactionFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Recurring Templates Quick-Add */}
      <RecurringTemplates />

      {/* Header: summary + add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-xs font-bold text-rose-500">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
        <Button onClick={handleAdd} size="sm" className="rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm giao dịch
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm giao dịch..."
                className="pl-9 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | "all")}
              >
                <option value="all">Tất cả loại</option>
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
              </select>
              <select
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Không tìm thấy giao dịch nào</p>
            <Button size="sm" className="mt-4 rounded-xl" onClick={handleAdd}>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm giao dịch mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((tx) => {
                const cat = catMap[tx.category];
                return (
                  <div key={tx.id} className="group flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: cat?.color || (tx.type === "income" ? "#10b981" : "#f43f5e") }}
                      >
                        {cat?.icon ? (
                          <CategoryIcon name={cat.icon} className="h-[18px] w-[18px]" />
                        ) : tx.type === "income" ? (
                          <ArrowUpRight className="h-[18px] w-[18px]" />
                        ) : (
                          <ArrowDownRight className="h-[18px] w-[18px]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.categoryName} &middot; {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold tabular-nums whitespace-nowrap ${
                          tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                      <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(tx)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(tx.id)}
                          disabled={deleting === tx.id}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
