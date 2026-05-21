import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  BarChart3,
  PiggyBank,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { getMonthYearLabel } from "@/lib/utils";
import type { Page } from "@/types";

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: "dashboard", label: "Tổng quan", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { page: "transactions", label: "Giao dịch", icon: <ArrowLeftRight className="h-[18px] w-[18px]" /> },
  { page: "categories", label: "Danh mục", icon: <Tags className="h-[18px] w-[18px]" /> },
  { page: "reports", label: "Báo cáo", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
  { page: "budgets", label: "Ngân sách", icon: <PiggyBank className="h-[18px] w-[18px]" /> },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, currentMonth, currentYear, setMonth, sidebarOpen, setSidebarOpen } = useApp();

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setMonth(12, currentYear - 1);
    } else {
      setMonth(currentMonth - 1, currentYear);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setMonth(1, currentYear + 1);
    } else {
      setMonth(currentMonth + 1, currentYear);
    }
  };

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(217 33% 17%) 100%)" }}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Wallet className="h-[18px] w-[18px] text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-white">FinTrack</span>
              <p className="text-[10px] font-medium text-blue-300/60">Quản lý chi tiêu</p>
            </div>
          </div>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Month selector */}
        <div className="mx-4 mt-2 mb-2">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.07] px-3 py-2.5">
            <button
              onClick={goToPrevMonth}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-sm font-semibold capitalize text-white/90">
                {getMonthYearLabel(currentMonth, currentYear)}
              </span>
            </div>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                currentPage === item.page
                  ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              )}
            >
              <span className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                currentPage === item.page
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-500"
              )}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mx-4 mb-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-3">
          <p className="text-[11px] font-medium text-slate-400">FinTrack v1.0</p>
          <p className="text-[10px] text-slate-500">© 2025 Personal Finance</p>
        </div>
      </aside>
    </>
  );
}
