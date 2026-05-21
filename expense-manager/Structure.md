# 📚 Dự án: Expense Manager (Quản lý chi tiêu cá nhân)

> **⚠️ LƯU Ý QUAN TRỌNG DÀNH CHO AI:**
> BẤT CỨ KHI NÀO AI BẮT ĐẦU PHIÊN LÀM VIỆC HOẶC CHỈNH SỬA CODE, AI **BẮT BUỘC** PHẢI ĐỌC FILE NÀY TRƯỚC ĐỂ NẮM RÕ CẤU TRÚC DỰ ÁN. SAU KHI CHỈNH SỬA, AI PHẢI CẬP NHẬT LẠI FILE NÀY (NẾU CÓ THAY ĐỔI VỀ CẤU TRÚC/LOGIC), ĐỒNG THỜI GHI LOG VÀO `changelog.md` VÀ `learning.md`.

## 1. ⚙️ Quy trình làm việc (Workflow)
- Phân tích kỹ yêu cầu từ người dùng.
- Tham khảo `Structure.md` (file này) và `ARCHITECTURE.md` để hiểu kiến trúc hiện tại, các chuẩn mực code và không phá vỡ cấu trúc có sẵn.
- Áp dụng thay đổi trên code. Đảm bảo UI/UX đẹp mắt, chuyên nghiệp (sử dụng TailwindCSS, Lucide-react).
- Sau khi code xong:
  - Ghi chú các thay đổi vào **`changelog.md`** (kèm theo prompt hoặc yêu cầu của người dùng để lưu vết).
  - Ghi chú các bài học, luồng logic khó, chức năng quan trọng, lỗi đã gặp và cách fix vào **`learning.md`**.
  - **QUY TẮC GHI LOG:** TUYỆT ĐỐI không tạo nhiều thẻ tiêu đề cùng một ngày (ví dụ nhiều thẻ `## [17/05/2026]`). Mọi thay đổi trong cùng ngày phải gộp chung vào 1 thẻ ngày, và đánh số từng lần cập nhật (VD: `### Lần 1 (Thay đổi nhỏ)`, `### Lần 2 (Tính năng quan trọng)`).
  - Cập nhật lại **`Structure.md`** ngay lập tức nếu có thêm thư viện mới, hoặc thay đổi về luồng logic cốt lõi.
  - **ĐẶC BIỆT QUAN TRỌNG:** Nếu có bất kỳ sự thay đổi nào liên quan đến Database Schema (Google Sheets), Data Flow, cấu trúc Backend/Frontend, hoặc thêm mới các Core Components, AI **bắt buộc phải cập nhật file `ARCHITECTURE.md`** để đảm bảo tài liệu kỹ thuật luôn đồng bộ với code thực tế (không bị out of date).

## 2. 📦 Thư viện & Công nghệ
- **Ngôn ngữ chính:** TypeScript, HTML, CSS.
- **Framework/Thư viện Core:** React 18, Vite.
- **Styling UI:** Tailwind CSS (kết hợp với các thư viện hỗ trợ như `clsx`, `tailwind-merge`, `class-variance-authority`).
- **Icons:** `lucide-react`.
- **Biểu đồ dữ liệu:** `recharts`.
- **Xử lý thời gian:** `date-fns`.
- **Tích hợp Backend/Database:** Google Apps Script (GAS). Sử dụng `vite-plugin-singlefile` và folder `gas` để đóng gói và triển khai.

## 3. 🛠️ Cài đặt & Khởi chạy (Scripts)
- `npm run dev`: Chạy server phát triển cục bộ (Vite).
- `npm run build`: Biên dịch TypeScript và build dự án ra file tĩnh.
- `npm run preview`: Xem trước bản build trên local.
- `npm run bundle`: Bundle dự án (chạy script `scripts/bundle.mjs` để xử lý code GAS).

## 4. 🧠 Cấu trúc & Logic cốt lõi
- **Kiến trúc tổng thể:** Tham khảo thêm chi tiết trong `ARCHITECTURE.md`.
- **Quản lý trạng thái:** (Cần cập nhật khi đi sâu vào code - ví dụ: Context API, Redux, hay State local).
- **Cấu trúc thư mục:**
  - `src/`: Chứa mã nguồn React (Components, Hooks, Utils...).
  - `gas/`: Chứa mã nguồn Google Apps Script để làm backend.
  - `dist/`: Nơi chứa file sau khi build.
  - `scripts/`: Chứa các kịch bản node.js hỗ trợ (như bundle code).

## 5. 📌 Các lưu ý quan trọng khác
- Không viết code rác (spaghetti code), luôn format code gọn gàng, chia nhỏ components để dễ quản lý và tái sử dụng.
- Thiết kế UI cần hướng đến sự chuyên nghiệp, lấy cảm hứng từ các phần mềm quản lý tài chính uy tín (như Misa). Sử dụng màu sắc hài hòa, typography hiện đại, layout rõ ràng.
- **Tuyệt đối không** tự ý xóa bỏ các đoạn comment quan trọng hoặc thay đổi cấu trúc nền tảng trừ khi người dùng yêu cầu rõ ràng.

---
*File này sẽ liên tục được AI và người dùng cập nhật trong quá trình phát triển để duy trì tính nhất quán của dự án.*
