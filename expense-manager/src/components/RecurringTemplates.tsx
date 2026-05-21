import { useState, useEffect } from "react";
import { Plus, Zap, Pencil, Trash2, ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import type { TransactionType } from "@/types";

interface RecurringTemplate {
  id: string;
  name: string;         // Tên giao dịch hiển thị, ví dụ: "Tiền gốc nhà"
  type: TransactionType;
  categoryId: string;
  description: string;
  defaultAmount: number; // Số tiền mặc định (có thể sửa khi dùng)
  fixedAmount: boolean;  // true = không cho sửa, false = cho phép sửa trước khi lưu
}

const STORAGE_KEY = "fintrack_recurring_templates";

function loadTemplates(): RecurringTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTemplates(templates: RecurringTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

interface QuickAddSheetProps {
  template: RecurringTemplate;
  categoryName: string;
  onDone: () => void;
  onCancel: () => void;
}

function QuickAddSheet({ template, categoryName, onDone, onCancel }: QuickAddSheetProps) {
  const { addTransaction } = useApp();
  const [displayAmount, setDisplayAmount] = useState(
    template.defaultAmount.toLocaleString("en-US")
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setDisplayAmount(val ? Number(val).toLocaleString("en-US") : "");
  };

  const handleSubmit = async () => {
    const amount = Number(displayAmount.replace(/\D/g, ""));
    if (!amount) return;
    setSubmitting(true);
    await addTransaction({
      type: template.type,
      amount,
      category: template.categoryId,
      description: template.description,
      date,
    });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full sm:max-w-sm bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 pb-20 sm:pb-6 space-y-4 border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">Thêm nhanh: {template.name}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
          <p><span className="font-medium text-foreground">Danh mục:</span> {categoryName}</p>
          <p><span className="font-medium text-foreground">Ghi chú:</span> {template.description}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">
            Số tiền (VND)
            {!template.fixedAmount && (
              <span className="ml-2 text-xs font-normal text-amber-500">✏️ Có thể chỉnh sửa</span>
            )}
          </label>
          <Input
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={handleAmountChange}
            readOnly={template.fixedAmount}
            className={`rounded-xl text-lg font-bold ${template.fixedAmount ? "bg-muted opacity-80" : ""}`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Ngày</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Hủy</Button>
          <Button className="flex-1 rounded-xl gap-2" onClick={handleSubmit} disabled={submitting}>
            <Check className="h-4 w-4" />
            {submitting ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EditTemplateFormProps {
  initial?: RecurringTemplate;
  onSave: (t: RecurringTemplate) => void;
  onCancel: () => void;
}

function EditTemplateForm({ initial, onSave, onCancel }: EditTemplateFormProps) {
  const { categories } = useApp();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [displayAmount, setDisplayAmount] = useState(
    initial ? initial.defaultAmount.toLocaleString("en-US") : ""
  );
  const [fixedAmount, setFixedAmount] = useState(initial?.fixedAmount ?? true);

  const filteredCats = categories.filter((c) => c.type === type);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setDisplayAmount(val ? Number(val).toLocaleString("en-US") : "");
  };

  const handleSave = () => {
    const amount = Number(displayAmount.replace(/\D/g, ""));
    if (!name.trim() || !categoryId || !amount) return;
    onSave({
      id: initial?.id ?? `rt_${Date.now()}`,
      name: name.trim(),
      type,
      categoryId,
      description: description.trim() || name.trim(),
      defaultAmount: amount,
      fixedAmount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full sm:max-w-sm bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 pb-20 sm:pb-6 space-y-4 border max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">{initial ? "Sửa khoản cố định" : "Tạo khoản cố định mới"}</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Loại */}
        <div className="flex rounded-xl bg-muted p-1">
          {(["expense", "income"] as TransactionType[]).map((t) => (
            <button key={t} type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                type === t ? (t === "expense" ? "bg-rose-500 text-white shadow-sm" : "bg-emerald-500 text-white shadow-sm")
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => { setType(t); setCategoryId(""); }}
            >
              {t === "expense" ? "Chi tiêu" : "Thu nhập"}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Tên giao dịch cố định</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Tiền gốc nhà, Lãi vay..." className="rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="">Chọn danh mục</option>
            {filteredCats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Ghi chú giao dịch (để JARS tự nhận diện đúng lọ)</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Tiền gốc nhà tháng này..." className="rounded-xl" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Số tiền mặc định (VND)</label>
          <Input type="text" inputMode="numeric" value={displayAmount} onChange={handleAmountChange}
            className="rounded-xl text-lg font-bold" />
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
          <input type="checkbox" id="fixedAmt" checked={fixedAmount} onChange={(e) => setFixedAmount(e.target.checked)}
            className="h-4 w-4 rounded accent-primary" />
          <label htmlFor="fixedAmt" className="text-sm cursor-pointer">
            <span className="font-semibold">Cố định số tiền</span>
            <p className="text-xs text-muted-foreground">Bỏ chọn để cho phép sửa số tiền khi thêm (ví dụ: tiền lãi thay đổi mỗi tháng)</p>
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Hủy</Button>
          <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={!name.trim() || !categoryId || !displayAmount}>
            {initial ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecurringTemplates() {
  const { categories } = useApp();
  const [templates, setTemplates] = useState<RecurringTemplate[]>(loadTemplates);
  const [collapsed, setCollapsed] = useState(false);
  const [quickAdd, setQuickAdd] = useState<RecurringTemplate | null>(null);
  const [editing, setEditing] = useState<RecurringTemplate | null | "new">(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const catMap: Record<string, string> = {};
  categories.forEach((c) => { catMap[c.id] = c.name; });

  const saveAndUpdate = (updated: RecurringTemplate[]) => {
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleSaveTemplate = (t: RecurringTemplate) => {
    const existing = templates.findIndex((x) => x.id === t.id);
    if (existing >= 0) {
      const copy = [...templates];
      copy[existing] = t;
      saveAndUpdate(copy);
    } else {
      saveAndUpdate([...templates, t]);
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa khoản cố định này?")) return;
    saveAndUpdate(templates.filter((t) => t.id !== id));
  };

  const handleQuickAddDone = (id: string) => {
    setQuickAdd(null);
    setJustAdded(id);
    setTimeout(() => setJustAdded(null), 2500);
  };

  // Sắp xếp: chi tiêu trước, thu nhập sau
  const sorted = [...templates].sort((a, b) => (a.type === b.type ? 0 : a.type === "expense" ? -1 : 1));

  return (
    <>
      <Card className="border-amber-100 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-slate-900 dark:to-slate-900">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Zap className="h-3.5 w-3.5" />
              </div>
              Khoản Cố Định Hàng Tháng
              {templates.length > 0 && (
                <span className="rounded-full bg-amber-200 dark:bg-amber-900 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {templates.length}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline"
                className="h-7 rounded-lg border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs gap-1 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                onClick={() => setEditing("new")}
              >
                <Plus className="h-3 w-3" /> Thêm
              </Button>
              <button onClick={() => setCollapsed(!collapsed)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              >
                {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardHeader>

        {!collapsed && (
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <p>Chưa có khoản nào. Thêm các khoản cố định hàng tháng</p>
                <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">Ví dụ: Tiền gốc nhà, Tiền lãi vay, Bảo hiểm...</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((t) => (
                  <div key={t.id}
                    className={`relative flex items-center gap-3 rounded-xl border bg-card p-3 transition-all ${
                      justAdded === t.id ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "hover:border-amber-200 hover:shadow-sm"
                    }`}
                  >
                    {/* Badge loại */}
                    <span className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-bold ${
                      t.type === "expense" ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    }`}>
                      {t.type === "expense" ? "Chi" : "Thu"}
                    </span>

                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setQuickAdd(t)}>
                      <p className="text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(t.defaultAmount)}
                        {!t.fixedAmount && <span className="ml-1 text-amber-500">✏️</span>}
                      </p>
                    </div>

                    {justAdded === t.id ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="flex shrink-0 gap-0.5">
                        <button onClick={() => setEditing(t)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {templates.length > 0 && (
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                💡 Bấm vào khoản bất kỳ để thêm nhanh vào tháng này
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Quick Add Bottom Sheet */}
      {quickAdd && (
        <QuickAddSheet
          template={quickAdd}
          categoryName={catMap[quickAdd.categoryId] ?? "Không rõ"}
          onDone={() => handleQuickAddDone(quickAdd.id)}
          onCancel={() => setQuickAdd(null)}
        />
      )}

      {/* Edit / Create Template */}
      {editing !== null && (
        <EditTemplateForm
          initial={editing === "new" ? undefined : editing}
          onSave={handleSaveTemplate}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}
