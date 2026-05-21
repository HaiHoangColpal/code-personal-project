# ARCHITECTURE - Quản lý Chi tiêu Cá nhân

> File này mô tả cấu trúc & logic cốt lõi của dự án (Database Schema, Data Flow, Scripts).
> **⚠️ LƯU Ý QUAN TRỌNG:** Khi AI hoặc dev có bất kỳ thay đổi code nào liên quan đến các thành phần trên, **BẮT BUỘC phải cập nhật lại file này ngay lập tức** để đảm bảo tài liệu luôn đồng bộ với code thực tế, tuyệt đối tránh tình trạng "out of date" (tài liệu cũ, code mới).

---

## 1. Tổng quan

| Mục | Chi tiết |
|-----|----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Charts | Recharts (Bar, Pie, Line) |
| Icons | Lucide React |
| Bundling | vite-plugin-singlefile → 1 file HTML |
| Backend | Google Apps Script (Code.gs) |
| Database | Google Sheets (5 sheets: Transactions, Categories, Budgets, Recurring, JARS_Monthly) |
| Locale | Tiếng Việt, VND currency |

## 2. Cấu trúc thư mục

```
project-root/
├── index.html                    # HTML entry point (Vite)
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite + singlefile plugin + path alias
├── tailwind.config.js            # TailwindCSS theme (colors, fonts)
├── tsconfig.json / tsconfig.app.json
├── ARCHITECTURE.md               # << FILE NÀY
├── README.md
│
├── src/
│   ├── main.tsx                  # ReactDOM.createRoot entry
│   ├── App.tsx                   # Root: ErrorBoundary → AppProvider → Layout
│   ├── index.css                 # Tailwind directives + CSS variables
│   │
│   ├── types/index.ts            # TypeScript interfaces
│   │   - Transaction, Category, Budget
│   │   - DashboardData, ReportData
│   │   - TransactionType ("income" | "expense")
│   │   - Page (union of page names)
│   │
│   ├── lib/
│   │   ├── utils.ts              # cn(), formatCurrency(), formatDate(), generateId(), getMonthYearLabel()
│   │   └── gas.ts                # GAS communication wrapper
│   │       - isGAS detection (google.script.run exists?)
│   │       - gasCall<T>() → Promise wrapper cho google.script.run
│   │       - mockCall<T>() → mock data fallback cho dev
│   │       - api object: getTransactions, addTransaction, updateTransaction,
│   │         deleteTransaction, getCategories, addCategory, updateCategory,
│   │         deleteCategory, getDashboardData, getReportData, getBudgets, saveBudget
│   │
│   ├── context/
│   │   └── AppContext.tsx         # Global state (React Context)
│   │       - State: currentPage, month/year, transactions, categories,
│   │         dashboardData, budgets, loading, sidebarOpen
│   │       - Actions: refresh*, add/update/delete Transaction/Category, saveBudget
│   │       - Pattern: Optimistic close form → background refresh
│   │       - useApp() hook for consuming
│   │
│   └── components/
│       ├── ErrorBoundary.tsx      # Catches React crashes → shows error UI, NOT white page
│       ├── Layout.tsx             # Sidebar + header + page router (switch currentPage)
│       ├── Sidebar.tsx            # Navigation + month selector (ChevronLeft/Right)
│       ├── Dashboard.tsx          # Summary cards + BarChart + PieChart + recent transactions
│       ├── TransactionList.tsx    # Filterable list + search + CRUD buttons
│       ├── TransactionForm.tsx    # Dialog form for add/edit transaction
│       ├── CategoryManager.tsx    # Grid of categories + add/edit dialog
│       ├── Reports.tsx            # 6-month trend charts + category pies + top expenses
│       ├── BudgetView.tsx         # Budget progress bars + add dialog
│       └── ui/                    # Reusable primitives
│           ├── button.tsx         # CVA variants: default, destructive, outline, secondary, ghost, link, success
│           ├── card.tsx           # Card, CardHeader, CardTitle, CardDescription, CardContent
│           ├── input.tsx          # Styled input
│           ├── select.tsx         # Native select with ChevronDown icon
│           ├── badge.tsx          # CVA variants: default, income, expense, success, warning
│           └── dialog.tsx         # Modal overlay: Dialog, DialogContent, DialogHeader, DialogTitle
│
├── gas/
│   ├── Code.gs                   # Apps Script backend
│   │   - doGet() → serve Index.html
│   │   - initSheets() → auto-create Transactions/Categories/Budgets sheets
│   │   - CRUD: getTransactions, addTransaction, updateTransaction, deleteTransaction
│   │   - CRUD: getCategories, addCategory, updateCategory, deleteCategory
│   │   - getDashboardData → tổng hợp thu/chi, daily trend, category pie
│   │   - getReportData → 6-month trend, category aggregation, top expenses
│   │   - getBudgets, saveBudget
│   │   - Helper: formatDate_(), getSpreadsheet(), sheetToObjects(), getAllTransactionsRaw_()
│   │   - JARS: mapToJar_(), autoUpdateJarsMonthly_(), migrateAddJarColumn_()
│   │
│   ├── appsscript.json           # Manifest (timezone, runtime V8)
│   └── Index.html                # Generated (build output, do NOT edit manually)
│
└── scripts/
    └── bundle.mjs                # Build + copy to gas/Index.html
```

## 3. Data Flow

```
[Google Sheet] ←→ [Code.gs functions] ←→ [google.script.run] ←→ [gas.ts wrapper] ←→ [AppContext] ←→ [Components]
```

### 3.1 Khi chạy trên GAS (production)
- `gas.ts` detect `google.script.run` → gọi trực tiếp backend functions
- `gasCall()` wrap thành Promise với `withSuccessHandler` / `withFailureHandler`

### 3.2 Khi chạy local (dev)
- `gas.ts` detect không có `google.script.run` → dùng mock data
- `mockCall()` simulate delay 300ms + trả mock data

### 3.3 Optimistic Update Pattern
1. User submit form → **đóng form ngay lập tức**
2. Background: gọi API save
3. Background: refresh data (transactions, dashboard, budgets)
4. Nếu lỗi → log console, data sẽ sync lại lần load sau

## 4. Google Sheets Schema

### Transactions
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ID | string | UUID 12 chars |
| Date | string | YYYY-MM-DD |
| Amount | number | VND |
| Category | string | Category ID |
| Description | string | Mô tả giao dịch |
| Type | string | "income" \| "expense" |
| CreatedAt | string | ISO datetime |
| Jar | string | JARS classification: NEC/FFA/LTSS/EDU/PLAY/GIVE (auto-computed for expense) |

### Categories
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ID | string | UUID or c1, c2... |
| Name | string | Tên danh mục |
| Type | string | "income" \| "expense" |
| Icon | string | Lucide icon name |
| Color | string | Hex color |

### Budgets
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| ID | string | UUID |
| CategoryId | string | Category ID |
| Amount | number | Hạn mức VND |
| Month | number | 1-12 |
| Year | number | YYYY |

### JARS_Monthly
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Month | number | 1-12 |
| Year | number | YYYY |
| TotalIncome | number | Tổng thu nhập tháng |
| TotalExpense | number | Tổng chi tiêu tháng |
| NEC_Budget/Spent/Pct | number | Thiết yếu (55%) |
| FFA_Budget/Spent/Pct | number | Tự do Tài chính (10%) |
| LTSS_Budget/Spent/Pct | number | Tiết kiệm Dài hạn (10%) |
| EDU_Budget/Spent/Pct | number | Giáo dục (10%) |
| PLAY_Budget/Spent/Pct | number | Hưởng thụ (10%) |
| GIVE_Budget/Spent/Pct | number | Cho đi (5%) |
| SavedAt | string | ISO datetime |

> **Lưu ý:** JARS_Monthly được tự động cập nhật mỗi khi thêm/sửa/xóa giao dịch (`autoUpdateJarsMonthly_`).
> Cột `Jar` trong Transactions được auto-fill bởi `mapToJar_()` khi thêm/cập nhật.
> Migration function `migrateAddJarColumn_()` chạy 1 lần khi `doGet()` để back-fill cột Jar cho dữ liệu cũ.

## 5. Quy tắc quan trọng

### 5.1 Date handling trong Code.gs
- Google Sheets lưu Date dạng Date object
- **LUÔN convert sang string** `YYYY-MM-DD` trước khi trả về frontend
- Dùng helper `formatDate_(val)` để convert

### 5.2 Performance trong Code.gs
- **KHÔNG gọi `getSpreadsheet()` nhiều lần** trong 1 function
- Đọc data 1 lần, xử lý in-memory
- `getReportData` và `getDashboardData` đọc ALL transactions 1 lần, filter in-memory
- Dùng `_cache` object để cache data trong cùng 1 execution context

### 5.3 Frontend state management
- Tất cả state global nằm trong `AppContext`
- Components KHÔNG gọi `api.*` trực tiếp (trừ trường hợp đặc biệt)
- Reports dùng `reportData` từ context, KHÔNG tự fetch riêng

### 5.4 Error handling
- `ErrorBoundary` wrap toàn bộ app → không bao giờ trắng trang
- Mỗi `gasCall` có try-catch trong context
- Form có loading state riêng, đóng form trước khi refresh

### 5.5 Build & Deploy
```bash
npm run build          # Vite build → dist/index.html (single file)
node scripts/bundle.mjs  # Copy sang gas/Index.html
```
- Deploy: copy Code.gs + Index.html lên Google Apps Script
- Đặt SPREADSHEET_ID trong Code.gs
- Chạy initSheets() 1 lần

## 6. Theme & Style
- Font: Plus Jakarta Sans (Google Fonts)
- Primary: Blue (#2563eb)
- Success/Income: Green (#22c55e)
- Destructive/Expense: Red (#ef4444)
- Warning: Amber (#eab308)
- Radius: 0.5rem default
- CSS variables defined in index.css (:root)
