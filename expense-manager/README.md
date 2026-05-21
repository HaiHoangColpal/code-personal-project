# Quản lý Chi tiêu Cá nhân

App quản lý chi tiêu cá nhân kiểu MISA, phát triển bằng React + TypeScript + Vite, deploy lên Google Apps Script, lưu dữ liệu vào Google Sheets.

## Tính năng

- **Tổng quan**: Dashboard với biểu đồ thu chi, số dư, giao dịch gần đây
- **Giao dịch**: Thêm/sửa/xóa giao dịch, lọc theo loại/danh mục, tìm kiếm
- **Danh mục**: Quản lý danh mục thu nhập/chi tiêu với màu sắc
- **Báo cáo**: Biểu đồ xu hướng 6 tháng, phân tích theo danh mục, top chi tiêu
- **Ngân sách**: Thiết lập hạn mức chi tiêu theo danh mục, theo dõi tiến độ

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Recharts + Lucide Icons
- **Bundling**: vite-plugin-singlefile (inline tất cả vào 1 file HTML)
- **Backend**: Google Apps Script
- **Database**: Google Sheets

## Phát triển

```bash
# Cài đặt dependencies
pnpm install

# Chạy dev server (dùng mock data)
pnpm dev

# Build production (single HTML file)
pnpm build

# Bundle cho Apps Script
node scripts/bundle.mjs
```

## Deploy lên Google Apps Script

1. Mở [Google Apps Script](https://script.google.com)
2. Tạo project mới
3. Copy nội dung `gas/Code.gs` vào file `Code.gs`
4. Tạo file `Index.html`, copy nội dung `gas/Index.html` (sau khi build) vào
5. Tạo Google Sheet mới, copy ID từ URL
6. Dán ID vào biến `SPREADSHEET_ID` trong `Code.gs`
7. Chạy hàm `initSheets()` 1 lần để tạo các sheet cần thiết
8. **Deploy** > **New deployment** > **Web app**
   - Execute as: Me
   - Who has access: Anyone
9. Copy URL web app để sử dụng

## Cấu trúc Google Sheet

| Sheet | Cột |
|-------|-----|
| Transactions | ID, Date, Amount, Category, Description, Type, CreatedAt |
| Categories | ID, Name, Type, Icon, Color |
| Budgets | ID, CategoryId, Amount, Month, Year |

## Cấu trúc dự án

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Root component
├── index.css                # TailwindCSS + theme variables
├── types/index.ts           # TypeScript types
├── lib/
│   ├── utils.ts             # Utility functions
│   └── gas.ts               # GAS communication + mock data
├── context/
│   └── AppContext.tsx        # Global state management
└── components/
    ├── Layout.tsx            # Main layout
    ├── Sidebar.tsx           # Navigation sidebar
    ├── Dashboard.tsx         # Dashboard page
    ├── TransactionList.tsx   # Transaction list page
    ├── TransactionForm.tsx   # Transaction add/edit form
    ├── CategoryManager.tsx   # Category management page
    ├── Reports.tsx           # Reports & charts page
    ├── BudgetView.tsx        # Budget management page
    └── ui/                   # Reusable UI components
        ├── badge.tsx
        ├── button.tsx
        ├── card.tsx
        ├── dialog.tsx
        ├── input.tsx
        └── select.tsx

gas/
├── Code.gs                  # Apps Script backend
├── appsscript.json          # Apps Script manifest
└── Index.html               # Built HTML (generated after build)
```
