import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Transaction, TransactionType } from "@/types";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

export function TransactionForm({ open, onClose, editingTransaction }: TransactionFormProps) {
  const { categories, addTransaction, updateTransaction } = useApp();
  const [type, setType] = useState<TransactionType>("expense");
  const [displayAmount, setDisplayAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDisplayAmount(editingTransaction.amount.toLocaleString("en-US"));
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
    } else {
      setType("expense");
      setDisplayAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [editingTransaction, open]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Chỉ lấy số
    if (!val) {
      setDisplayAmount("");
    } else {
      setDisplayAmount(Number(val).toLocaleString("en-US"));
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(displayAmount.replace(/\D/g, ""));
    if (!numAmount || !category || !description || !date) return;

    // Close form immediately (optimistic), save in background
    onClose();

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        type,
        amount: numAmount,
        category,
        description,
        date,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        category,
        description,
        date,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader onClose={onClose}>
          <DialogTitle>
            {editingTransaction ? "Sửa giao dịch" : "Thêm giao dịch mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                type === "expense"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => { setType("expense"); setCategory(""); }}
            >
              Chi tiêu
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => { setType("income"); setCategory(""); }}
            >
              Thu nhập
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Số tiền (VND)</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={displayAmount}
              onChange={handleAmountChange}
              required
              className="rounded-xl text-lg font-bold"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Danh mục</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Chọn danh mục"
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Mô tả</label>
            <Input
              type="text"
              placeholder="VD: Sữa Meiji cho bé, Tiền điện T5..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Ngày</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1 rounded-xl">
              {editingTransaction ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
