import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, CheckCircle2, TrendingUp, Info, Home, LineChart, PiggyBank, GraduationCap, Coffee, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

const JARS = [
  { id: "NEC", name: "Thiết yếu", pct: 0.55, color: "bg-blue-500", text: "text-blue-500", desc: "Ăn uống, nhà ở, hóa đơn...", icon: Home, info: "Quỹ Thiết yếu (55%): Phục vụ nhu cầu sinh hoạt hàng ngày (ăn uống, đi lại, điện nước). Nếu quỹ này thường xuyên vượt quá 80%, bạn cần phải đánh giá lại lối sống hoặc tìm cách tăng thu nhập." },
  { id: "FFA", name: "Tự do Tài chính", pct: 0.10, color: "bg-emerald-500", text: "text-emerald-500", desc: "Đầu tư, kinh doanh...", icon: LineChart, info: "Quỹ Tự do Tài chính (10%): Đây là 'ngỗng đẻ trứng vàng'. Tiền này chỉ dùng để đầu tư tạo ra thu nhập thụ động, tuyệt đối không được lấy ra tiêu xài." },
  { id: "LTSS", name: "Tiết kiệm Dài hạn", pct: 0.10, color: "bg-indigo-500", text: "text-indigo-500", desc: "Quỹ dự phòng, mua xe...", icon: PiggyBank, info: "Quỹ Tiết kiệm Dài hạn (10%): Dùng cho các mục tiêu lớn (mua nhà, mua xe) hoặc quỹ dự phòng khẩn cấp. Rất quan trọng để đảm bảo an toàn tài chính." },
  { id: "EDU", name: "Giáo dục", pct: 0.10, color: "bg-amber-500", text: "text-amber-500", desc: "Học tập, mua sách...", icon: GraduationCap, info: "Quỹ Giáo dục (10%): Đầu tư vào bản thân là khoản đầu tư sinh lời nhất. Dùng để mua sách, học khóa học mới, nâng cao kỹ năng." },
  { id: "PLAY", name: "Hưởng thụ", pct: 0.10, color: "bg-rose-500", text: "text-rose-500", desc: "Du lịch, mua sắm...", icon: Coffee, info: "Quỹ Hưởng thụ (10%): Bắt buộc phải tiêu hết quỹ này mỗi tháng để tự thưởng cho bản thân, giúp duy trì động lực kiếm tiền (du lịch, ăn nhà hàng sang, spa)." },
  { id: "GIVE", name: "Cho đi", pct: 0.05, color: "bg-teal-500", text: "text-teal-500", desc: "Từ thiện, quà tặng...", icon: Heart, info: "Quỹ Cho đi (5%): Giúp đỡ người thân, từ thiện, quà tặng. Cho đi để nhận lại nhiều hơn." },
];
// ============================================================
// JARS Smart Mapper — Chuẩn hóa theo T. Harv Eker
// Logic tài chính chính thống:
//   - NEC (55%): Chi phí sinh tồn, hóa đơn, bảo hiểm, trả góp nhà đang ở (gốc + lãi).
//   - FFA (10%): Đầu tư sinh lời, tạo thu nhập thụ động (không bao giờ tiêu gốc).
//   - LTSS (10%): Tích lũy cho các khoản chi tiêu lớn trong tương lai hoặc quỹ khẩn cấp.
// ============================================================
// ============================================================
// JARS Smart Mapper — Phiên bản Toàn diện & Chính xác nhất
// Chuẩn hóa theo hệ thống 6 chiếc lọ của T. Harv Eker
// ============================================================
// 1. Hàm chuẩn hóa: Bỏ dấu tiếng Việt, đưa về chữ thường
const normalizeText = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

// 2. Định nghĩa bộ TỪ KHÓA GHI ĐÈ (Override Keywords)
// Dùng regex \b (Word boundary) để đảm bảo khớp chính xác nguyên 1 từ, không bắt chữ lộn xộn.
const OVERRIDE_RULES = [
  {
    jar: "EDU",
    // Bắt chính xác: hoc phi, sach, khoa hoc...
    regex: /\b(hoc phi|khoa hoc|tien hoc|mua sach|sach giao khoa|hoc them|dao tao)\b/
  },
  {
    jar: "FFA",
    // Bắt chính xác: chung khoan, crypto, vang mieng...
    regex: /\b(dau tu|co phieu|crypto|chung khoan|bat dong san|vang mieng|vang sjc|chi vang)\b/
  },
  {
    jar: "LTSS",
    // Quỹ khẩn cấp, bảo hiểm, sửa nhà, mua sắm tài sản lớn
    regex: /\b(nhan vang|kieng vang|tiet kiem|quy khan cap|mua xe|mua may tinh|mua laptop|dien thoai|bao hiem nhan tho|sua nha|kham benh|vien phi)\b/
  },
  {
    jar: "GIVE",
    // Chỉ từ thiện thực sự
    regex: /\b(tu thien|quyen gop|cho di|bieu xen|ung ho)\b/
  },
  {
    jar: "PLAY",
    // Đưa TẤT CẢ ăn chơi, hiếu hỉ, giao tế vào đây để bảo vệ quỹ NEC
    regex: /\b(nhau|an nhau|tiec|buffet|nha hang|bo nuong|banh kem|cafe|bar|pub|tra sua|giai tri|xem phim|du lich|spa|lam dep|vay|dam|skirt|my pham|hoi thao|the thao|gym|cuoi|dam cuoi|day thang|sinh nhat)\b/
  }
];

// 3. Logic chính xử lý
const mapToJar = (categoryName: string, description: string): string => {
  const normCategory = normalizeText(categoryName);
  const normDesc = normalizeText(description);

  // BƯỚC 1: ƯU TIÊN GHI CHÚ (DESCRIPTION OVERRIDE)
  // Nếu người dùng viết "Ăn nhậu" trong phần ghi chú, nó PHẢI LÀ PLAY, bất kể category là gì.
  for (const rule of OVERRIDE_RULES) {
    if (rule.regex.test(normDesc)) {
      return rule.jar;
    }
  }

  // BƯỚC 2: XÉT ĐẾN DANH MỤC LỚN (CATEGORY MAP)
  // Chỉ chạy khi Ghi chú không có từ khóa đặc biệt nào
  for (const rule of OVERRIDE_RULES) {
    if (rule.regex.test(normCategory)) {
      return rule.jar;
    }
  }

  // BƯỚC 3: MẶC ĐỊNH BẢO VỆ (SAFE FALLBACK)
  // Xử lý các category chung chung (Tiền ăn, tiền nhà, hóa đơn, bỉm sữa, xăng xe)
  const isNecCategory = /\b(an uong|di lai|nha o|hoa don|dien nuoc|internet|wifi|sieu thi|di cho|xang|gui xe|bim|sua|thit|ca|rau|ngan hang|tra no|tien lai)\b/;
  
  if (isNecCategory.test(normCategory) || isNecCategory.test(normDesc)) {
    return "NEC"; 
  }

  // Nếu không lọt vào bất kỳ đâu, trả về NEC (Thiết yếu) nhưng bạn nên làm 1 lọ "OTHER" 
  // trên UI để biết mà phân loại lại thủ công.
  return "NEC"; 
};

// const mapToJar = (categoryName: string, description: string): string => {
//   const text = `${categoryName} ${description}`.toLowerCase();
  
//   // --- ƯU TIÊN 1: CHO ĐI (GIVE) ---
//   // Thêm các khoản giao tế, hiếu hỉ đặc thù của Việt Nam
//   if (text.match(/(từ thiện|quyên góp|cho đi|lì xì|mừng tuổi|biếu|tặng quà|đám cưới|đám ma|phúng viếng|thăm ốm|đầy tháng|thăm đẻ)/)) {
//     return "GIVE";
//   }

//   // --- ƯU TIÊN 2: GIÁO DỤC (EDU) ---
//   // Thêm đồ dùng học tập, học thêm
//   if (text.match(/(học phí|khóa học|tiền học|mua sách|sách giáo khoa|vở|đồ dùng học tập|học thêm|ngoại khóa|đào tạo)/)) {
//     return "EDU";
//   }

//   // --- ƯU TIÊN 3: TỰ DO TÀI CHÍNH (FFA) ---
//   if (text.match(/(đầu tư|cổ phiếu|mua coin|crypto|chứng khoán|đầu tư đất|bất động sản|vàng miếng|vàng sjc|chỉ vàng)/)) {
//     return "FFA";
//   }

//   // --- ƯU TIÊN 4: TIẾT KIỆM DÀI HẠN & QUỸ KHẨN CẤP (LTSS) ---
//   // Thay đổi "vàng" thành các cụm từ cụ thể để tránh lỗi "váy màu vàng"
//   // Thêm bảo hiểm nhân thọ, sửa chữa lớn
//   if (text.match(/(nhẫn vàng|kiềng vàng|vàng nhẫn|tiết kiệm|quỹ khẩn cấp|mua xe|mua máy tính|mua laptop|mua điện thoại|bảo hiểm nhân thọ|sửa nhà)/)) {
//     return "LTSS";
//   }

//   // --- ƯU TIÊN 5: HƯỞNG THỤ (PLAY) ---
//   // Phân biệt thời trang dạo phố (PLAY) với quần áo thiết yếu đi làm (có thể là NEC tùy quan điểm)
//   if (text.match(/(giải trí|xem phim|chơi game|đồ chơi|du lịch|spa|làm đẹp|váy|đầm|skirt|mỹ phẩm|quần áo|thời trang|café|nhậu|tiệc|bar|pub|trà sữa|buffet|ăn ngoài|nhà hàng)/)) {
//     return "PLAY";
//   }

//   // --- ƯU TIÊN 6: BỘ LỌC THIẾT YẾU CỐ ĐỊNH & SINH HOẠT (NEC) ---
//   // Thêm Y tế, Bỉm sữa, Xăng xe, Đi chợ (bắt từ khóa rõ ràng để an toàn trước khi rơi vào Mặc định)
//   if (text.match(/(trả góp|trả nợ|tiền gốc|tiền lãi|ngân hàng|vay mua|bảo hiểm y tế|bảo hiểm xe|hóa đơn|tiền điện|tiền nước|internet|wifi|chung cư|tiền mạng|đi chợ|siêu thị|thịt|cá|rau|gạo|xăng|gửi xe|thuốc|khám bệnh|viện phí|bỉm|sữa)/)) {
//     return "NEC";
//   }

//   // --- MẶC ĐỊNH CUỐI CÙNG: THIẾT YẾU (NEC) ---
//   // Mọi thứ không khớp ở trên sẽ vào đây. Bạn nên có cơ chế log lại các giao dịch rơi vào dòng này 
//   // để định kỳ (mỗi tháng) xem lại và cập nhật thêm Regex cho các quỹ trên.
//   return "NEC";
// };

export function JarsAnalysis() {
  const { dashboardData, transactions, currentMonth, currentYear } = useApp();
  const [expandedJar, setExpandedJar] = useState<string | null>(null);
  const [infoJar, setInfoJar] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!dashboardData) return null;
    const { totalIncome } = dashboardData;

    // Tính toán số tiền thực tế chi cho từng Jar và gom nhóm chi tiết
    const jarSpent: Record<string, number> = { NEC: 0, FFA: 0, LTSS: 0, EDU: 0, PLAY: 0, GIVE: 0 };
    const jarItems: Record<string, Record<string, number>> = { NEC: {}, FFA: {}, LTSS: {}, EDU: {}, PLAY: {}, GIVE: {} };
    
    // Duyệt qua transactions thay vì expenseByCategory để lấy thông tin chi tiết
    transactions.forEach(tx => {
      if (tx.type === "expense" && tx.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`)) {
        const jarId = mapToJar(tx.categoryName || "", tx.description || "");
        if (jarSpent[jarId] !== undefined) {
          jarSpent[jarId] += tx.amount;
          
          const itemName = tx.description || tx.categoryName || "Khác";
          if (jarItems[jarId][itemName]) {
            jarItems[jarId][itemName] += tx.amount;
          } else {
            jarItems[jarId][itemName] = tx.amount;
          }
        }
      }
    });

    // Tạo mảng kết quả
    return JARS.map(jar => {
      const budget = totalIncome * jar.pct;
      const spent = jarSpent[jar.id];
      const ratio = budget === 0 ? 0 : spent / budget;
      const percentValue = ratio * 100;
      // Format 1 chữ số thập phân, vd: 50.1%
      const percentDisplay = percentValue.toFixed(1).replace(/\.0$/, ""); 
      
      let status: "good" | "warning" | "danger" = "good";
      let advice = "";
      let statusIcon = CheckCircle2;

      if (totalIncome === 0) {
         status = "warning";
         advice = "Chưa có thu nhập để phân bổ.";
         statusIcon = Info;
      } else if (ratio > 1) {
        status = "danger";
        advice = `Vượt ngân sách ${formatCurrency(spent - budget)}. Cần cắt giảm ở tháng sau!`;
        statusIcon = AlertCircle;
      } else if (ratio >= 0.8) {
        status = "warning";
        advice = `Sắp chạm ngưỡng (${percentDisplay}%). Hãy cẩn thận khi chi tiêu thêm.`;
        statusIcon = TrendingUp;
      } else if (jar.id !== "NEC" && ratio < 0.2) {
        status = "good";
        advice = `Mới dùng ${percentDisplay}%. Bạn có thể trích thêm vào quỹ này nếu muốn.`;
        statusIcon = Info;
      } else {
        status = "good";
        advice = `Trong tầm kiểm soát tốt. Còn dư ${formatCurrency(budget - spent)}.`;
      }

      // Xếp hạng Top chi tiêu trong quỹ này
      const topExpenses = Object.entries(jarItems[jar.id])
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      return { ...jar, budget, spent, percentDisplay, percentValue, status, advice, statusIcon, topExpenses };
    });
  }, [dashboardData, transactions, currentMonth, currentYear]);

  if (!analysis) return null;

  return (
    <Card className="mt-6 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-900">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <TrendingUp className="h-4 w-4" />
          </div>
          Phân tích theo quy tắc 6 Chiếc Lọ (JARS)
        </CardTitle>
        <CardDescription>
          Hệ thống tự động phân loại chi tiêu của bạn dựa trên tổng thu nhập trong tháng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analysis.map((jar) => (
            <div key={jar.id} className="rounded-xl border bg-card p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:border-blue-200">
              <div className={`absolute top-0 left-0 w-1 h-full ${jar.color}`} />
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ${jar.text}`}>
                    <jar.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-1">
                      {jar.name} ({(jar.pct * 100).toFixed(1).replace(/\.0$/, "")}%)
                      <button 
                        onClick={() => setInfoJar(infoJar === jar.id ? null : jar.id)}
                        className="flex items-center cursor-pointer p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Bấm để xem giải thích"
                      >
                        <Info className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </h4>
                    <p className="text-[10px] text-muted-foreground">{jar.desc}</p>
                  </div>
                </div>
                <div className={`flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 ${
                  jar.status === 'danger' ? 'text-rose-500' :
                  jar.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  <jar.statusIcon className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Hộp thoại thông tin giải thích (Chỉ hiện khi click) */}
              {infoJar === jar.id && (
                <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg text-[11px] leading-relaxed mt-2 mb-3 border border-slate-200 dark:border-slate-700">
                  {jar.info}
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ngân sách:</span>
                  <span className="font-medium">{formatCurrency(jar.budget)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Đã chi:</span>
                  <span className={`font-bold ${jar.status === 'danger' ? 'text-rose-500' : ''}`}>
                    {formatCurrency(jar.spent)} <span className="text-muted-foreground font-normal text-[10px]">({jar.percentDisplay}%)</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1" title={`${jar.percentDisplay}%`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      jar.status === 'danger' ? 'bg-rose-500' : 
                      jar.status === 'warning' ? 'bg-amber-500' : jar.color
                    }`}
                    style={{ width: `${Math.min(jar.percentValue, 100)}%` }}
                  />
                </div>

                {/* AI Advice */}
                <div className={`mt-3 rounded-lg p-2 text-[11px] leading-snug ${
                  jar.status === 'danger' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                  jar.status === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}>
                  <span className="font-semibold mr-1">Gợi ý:</span>
                  {jar.advice}
                </div>

                {/* Nút Xem chi tiết */}
                {jar.spent > 0 && (
                  <button 
                    onClick={() => setExpandedJar(expandedJar === jar.id ? null : jar.id)}
                    className="w-full mt-2 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pt-2"
                  >
                    {expandedJar === jar.id ? "Thu gọn chi tiết" : "Xem top chi tiêu"}
                    {expandedJar === jar.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                )}

                {/* Chi tiết Top chi tiêu */}
                {expandedJar === jar.id && (
                  <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 animate-in slide-in-from-top-2 duration-200">
                    {jar.topExpenses.slice(0, 5).map((item, idx) => {
                      const pctOfSpent = (item.value / jar.spent) * 100;
                      return (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="truncate pr-2 flex-1" title={item.name}>{item.name}</span>
                          <span className="font-medium shrink-0 flex items-center gap-1">
                            {formatCurrency(item.value)} 
                            <span className="text-muted-foreground w-8 text-right">({pctOfSpent.toFixed(0)}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
