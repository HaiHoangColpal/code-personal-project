import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Baby, PieChart as PieChartIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";

// Các từ khóa nhận diện chi phí cho con cái (Áp dụng cho cả Tên Danh mục và Mô tả giao dịch)
const KIDS_KEYWORDS = /(sữa|bỉm|con|trẻ|bé|đồ chơi|truyện|nhà trẻ|mẫu giáo|học phí|giáo khoa|tiểu học|trung học|học thêm)/i;

export function FamilyAnalysis() {
  const { dashboardData, transactions, currentMonth, currentYear } = useApp();

  const data = useMemo(() => {
    if (!dashboardData) return null;
    const { totalExpense, totalIncome } = dashboardData;

    let kidsSpent = 0;
    // Map items by unique descriptions or categories
    const kidsItemsMap: Record<string, number> = {};

    // Lọc qua toàn bộ giao dịch của tháng hiện tại
    transactions.forEach(tx => {
      // Chỉ lấy giao dịch chi tiêu trong tháng hiện tại
      if (tx.type === "expense" && 
          tx.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`)) {
        
        // Kiểm tra xem Danh mục HOẶC Mô tả có chứa từ khóa của con không
        const isKidExpense = tx.categoryName?.match(KIDS_KEYWORDS) || tx.description.match(KIDS_KEYWORDS);
        
        if (isKidExpense) {
          kidsSpent += tx.amount;
          
          // Gộp các mô tả giống nhau lại để hiển thị
          const itemName = tx.description || tx.categoryName || "Khác";
          if (kidsItemsMap[itemName]) {
            kidsItemsMap[itemName] += tx.amount;
          } else {
            kidsItemsMap[itemName] = tx.amount;
          }
        }
      }
    });

    const kidsItems = Object.entries(kidsItemsMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort từ cao xuống thấp

    const percentOfExpense = totalExpense > 0 ? (kidsSpent / totalExpense) * 100 : 0;
    const percentOfIncome = totalIncome > 0 ? (kidsSpent / totalIncome) * 100 : 0;

    return { kidsSpent, kidsItems, percentOfExpense, percentOfIncome };
  }, [dashboardData, transactions, currentMonth, currentYear]);

  if (!data) return null;

  return (
    <Card className="mt-6 border-pink-100 dark:border-pink-900 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-slate-900 dark:to-slate-900">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-pink-700 dark:text-pink-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/50">
            <Baby className="h-4 w-4" />
          </div>
          Bóc tách Chi phí cho Con cái
        </CardTitle>
        <CardDescription>
          Phân tích chuyên sâu (Quét trên cả Tên danh mục và Ghi chú giao dịch).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.kidsSpent === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4 bg-white/50 dark:bg-black/20 rounded-xl">
            Chưa phát hiện chi tiêu nào có từ khóa (sữa, bỉm, con, bé...) trong tháng này.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Thống kê % */}
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Tổng chi cho con tháng này</p>
                <p className="text-2xl font-bold text-pink-600">{formatCurrency(data.kidsSpent)}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><PieChartIcon className="h-3.5 w-3.5 text-muted-foreground"/> Chiếm trong Tổng Chi:</span>
                    <span className="font-semibold">{data.percentOfExpense.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><PieChartIcon className="h-3.5 w-3.5 text-muted-foreground"/> Chiếm trong Tổng Thu:</span>
                    <span className="font-semibold">{data.percentOfIncome.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết từng khoản */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold mb-3">Các khoản đã chi</p>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {data.kidsItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-pink-100 dark:border-pink-900/30 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-2 w-2 rounded-full bg-pink-400 shrink-0"></div>
                      <span className="truncate" title={item.name}>{item.name}</span>
                    </div>
                    <span className="font-medium shrink-0 ml-2">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
