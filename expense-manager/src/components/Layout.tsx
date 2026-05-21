import { Menu, RefreshCw, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { TransactionList } from "./TransactionList";
import { CategoryManager } from "./CategoryManager";
import { Reports } from "./Reports";
import { BudgetView } from "./BudgetView";
import { BottomNav } from "./BottomNav";
import { TransactionForm } from "./TransactionForm";
import { Button } from "./ui/button";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Tổng quan",
  transactions: "Giao dịch",
  categories: "Danh mục",
  reports: "Báo cáo",
  budgets: "Ngân sách",
};

const PAGE_SUBTITLES: Record<string, string> = {
  dashboard: "Tổng hợp tài chính của bạn",
  transactions: "Quản lý thu chi hàng ngày",
  categories: "Phân loại giao dịch",
  reports: "Phân tích chi tiết",
  budgets: "Kiểm soát chi tiêu",
};

export function Layout() {
  const {
    currentPage,
    setSidebarOpen,
    loading,
    refreshAll,
    transactionFormOpen,
    setTransactionFormOpen,
    editingTransaction,
    setEditingTransaction,
  } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <TransactionList />;
      case "categories":
        return <CategoryManager />;
      case "reports":
        return <Reports />;
      case "budgets":
        return <BudgetView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-[60px] shrink-0 items-center justify-between bg-card/80 backdrop-blur-sm px-4 lg:px-6 border-b">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold">{PAGE_TITLES[currentPage]}</h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">{PAGE_SUBTITLES[currentPage]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="hidden lg:flex h-8 rounded-lg"
              size="sm"
              onClick={() => {
                setEditingTransaction(null);
                setTransactionFormOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm giao dịch
            </Button>
            <button
              onClick={refreshAll}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 pb-24 lg:p-6 lg:pb-6 relative z-0">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            renderPage()
          )}
        </div>
      </main>

      <BottomNav />
      <TransactionForm
        open={transactionFormOpen}
        onClose={() => {
          setTransactionFormOpen(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
