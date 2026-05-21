import { useState } from "react";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryIcon, ICON_GROUPS } from "@/lib/icons";
import type { Category, TransactionType } from "@/types";

// Smart JARS Suggester (cùng logic với JarsAnalysis)
const JARS_META = [
  { id: "NEC",  name: "Thiết yếu (55%)",        emoji: "🏠" },
  { id: "FFA",  name: "Tự do Tài chính (10%)",  emoji: "📈" },
  { id: "LTSS", name: "Tiết kiệm Dài hạn (10%)", emoji: "🐷" },
  { id: "EDU",  name: "Giáo dục (10%)",         emoji: "📚" },
  { id: "PLAY", name: "Hưởng thụ (10%)",         emoji: "☕" },
  { id: "GIVE", name: "Cho đi (5%)",             emoji: "❤️" },
];
const predictJar = (categoryName: string): typeof JARS_META[0] | null => {
  const n = categoryName.toLowerCase();
  if (n.match(/(từ thiện|cho đi|quà|tặng|lì xì|biếu|hỗ trợ)/)) return JARS_META.find(j => j.id === "GIVE") ?? null;
  if (n.match(/(học|sách|khóa học|giáo dục|training|học phí)/))   return JARS_META.find(j => j.id === "EDU") ?? null;
  if (n.match(/(đầu tư|ổ phiếu|coin|crypto|kinh doanh|chứng khoán|etf)/)) return JARS_META.find(j => j.id === "FFA") ?? null;
  // Tiền gốc trả ngân hàng = xây dựng tài sản ⇒ LTSS
  if (n.match(/(tiết kiệm|bảo hiểm|dự phòng|quỹ|tiền gốc|trả gốc|gốc vay|gốc nhà|gốc xe)/)) return JARS_META.find(j => j.id === "LTSS") ?? null;
  if (n.match(/(giải trí|xem phim|game|du lịch|resort|spa|mua sắm|quần áo|thời trang|làm đẹp|chơi|nhậu)/)) return JARS_META.find(j => j.id === "PLAY") ?? null;
  if (n.length > 1) return JARS_META.find(j => j.id === "NEC") ?? null; // default khi có nhập
  return null;
};

const COLOR_OPTIONS = [
  "#f43f5e", "#f97316", "#eab308", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
  "#8b5cf6", "#64748b",
];

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState("UtensilsCrossed");
  const [saving, setSaving] = useState(false);
  const [viewType, setViewType] = useState<TransactionType | "all">("all");

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const displayCategories =
    viewType === "all"
      ? categories
      : categories.filter((c) => c.type === viewType);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setType("expense");
    setColor(COLOR_OPTIONS[0]);
    setIcon("UtensilsCrossed");
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIcon(cat.icon);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setFormOpen(false);
    try {
      if (editing) {
        await updateCategory({ ...editing, name, type, color, icon });
      } else {
        await addCategory({ name, type, color, icon });
      }
    } catch (e) {
      console.error("Failed to save category:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
    } catch (e) {
      console.error("Failed to delete category:", e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "expense", "income"] as const).map((t) => {
            const count = t === "all" ? categories.length : t === "expense" ? expenseCategories.length : incomeCategories.length;
            const label = t === "all" ? "Tất cả" : t === "expense" ? "Chi tiêu" : "Thu nhập";
            return (
              <button
                key={t}
                onClick={() => setViewType(t)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  viewType === t
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
        <Button size="sm" onClick={openAdd} className="rounded-xl">
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm
        </Button>
      </div>

      {/* Category grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayCategories.map((cat) => (
          <Card key={cat.id} className="group transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{cat.name}</p>
                  <p className={`text-[11px] font-medium ${cat.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                    {cat.type === "income" ? "Thu nhập" : "Chi tiêu"}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(cat.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayCategories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Plus className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Chưa có danh mục nào</p>
            <Button size="sm" className="mt-4 rounded-xl" onClick={openAdd}>
              Thêm danh mục đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader onClose={() => setFormOpen(false)}>
            <DialogTitle>{editing ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Type */}
            <div className="flex rounded-xl bg-muted p-1">
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  type === "expense" ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setType("expense")}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  type === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setType("income")}
              >
                Thu nhập
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Tên danh mục</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên danh mục"
                className="rounded-xl"
              />
              {/* Gợi ý chiếc lọ tương ứng */}
              {type === "expense" && (() => {
                const predicted = predictJar(name);
                if (!predicted) return null;
                return (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span>Danh mục này sẽ được xếp vào lọ <strong>{predicted.emoji} {predicted.name}</strong></span>
                  </div>
                );
              })()}
            </div>

            {/* Icon picker */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Biểu tượng</label>
              <div className="space-y-3 rounded-xl border p-3">
                {ICON_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.icons.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setIcon(iconName)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                            icon === iconName
                              ? "ring-2 ring-primary ring-offset-1 bg-primary/10 text-primary"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <CategoryIcon name={iconName} className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Màu sắc</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-9 w-9 rounded-full border-2 transition-all hover:scale-110 ${
                      color === c ? "border-foreground scale-110 shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ backgroundColor: color }}
              >
                <CategoryIcon name={icon} className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{name || "Tên danh mục"}</p>
                <p className={`text-xs font-medium ${type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                  {type === "income" ? "Thu nhập" : "Chi tiêu"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
