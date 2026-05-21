import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Tags,
  Plus,
  Menu,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import type { Page } from "@/types";

export function BottomNav() {
  const {
    currentPage,
    setCurrentPage,
    setTransactionFormOpen,
    setEditingTransaction,
    setSidebarOpen,
  } = useApp();

  const navItems: { page: Page | "menu"; label: string; icon: React.ReactNode }[] = [
    { page: "dashboard", label: "Tổng quan", icon: <LayoutDashboard className="h-5 w-5" /> },
    { page: "transactions", label: "Giao dịch", icon: <ArrowLeftRight className="h-5 w-5" /> },
    { page: "menu", label: "Thêm", icon: <div className="h-5 w-5" /> }, // Placeholder for FAB
    { page: "reports", label: "Báo cáo", icon: <BarChart3 className="h-5 w-5" /> },
    { page: "menu", label: "Thêm nữa", icon: <Menu className="h-5 w-5" /> },
  ];

  const handleNav = (page: Page | "menu") => {
    if (page === "menu") {
      setSidebarOpen(true);
    } else {
      setCurrentPage(page as Page);
    }
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setTransactionFormOpen(true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card px-2 pb-safe lg:hidden">
      {/* 1. Dashboard */}
      <button
        onClick={() => handleNav("dashboard")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 w-16 transition-colors",
          currentPage === "dashboard" ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[10px] font-medium">Tổng quan</span>
      </button>

      {/* 2. Transactions */}
      <button
        onClick={() => handleNav("transactions")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 w-16 transition-colors",
          currentPage === "transactions" ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ArrowLeftRight className="h-5 w-5" />
        <span className="text-[10px] font-medium">Giao dịch</span>
      </button>

      {/* 3. Floating Action Button (FAB) */}
      <div className="relative -top-5 flex flex-col items-center justify-center w-16">
        <button
          onClick={handleAdd}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* 4. Reports */}
      <button
        onClick={() => handleNav("reports")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 w-16 transition-colors",
          currentPage === "reports" ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <BarChart3 className="h-5 w-5" />
        <span className="text-[10px] font-medium">Báo cáo</span>
      </button>

      {/* 5. Danh mục */}
      <button
        onClick={() => handleNav("categories")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 w-16 transition-colors",
          currentPage === "categories" ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Tags className="h-5 w-5" />
        <span className="text-[10px] font-medium">Danh mục</span>
      </button>

      {/* Nút Menu (chỉ hiện khi cần vào Sidebar) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex flex-col items-center justify-center gap-1 p-2 w-12 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
