# Chỉ thị Vận hành & Giới hạn Ngữ cảnh cho AI (AI Steering & Development Rules)

> **DÀNH CHO AI AGENT:** Đây là bộ quy tắc cốt lõi điều hướng hành vi, quản lý context window và kiểm soát rủi ro mã nguồn. AI bắt buộc phải đọc, thấu hiểu và tuân thủ nghiêm ngặt các thuật toán hành vi dưới đây trước khi phân tích hoặc sinh code.

---

## 1. Nguyên tắc Cô lập Module (Module & Feature Isolation)

- **Phạm vi tác động:** Khi nhận yêu cầu Sửa lỗi (Fix bug), Tối ưu (Refactor) hoặc Thêm tính năng (New Feature), AI **CHỈ ĐƯỢC PHÉP** đọc và sửa đổi các file nằm trong phạm vi Module/Feature được chỉ định trực tiếp bởi Người dùng.
- **Vùng cấm (Blacklist):** Tất cả các thư mục, module, hoặc tính năng khác nằm ngoài phạm vi yêu cầu mặc định là **VÙNG CẤM**. AI tuyệt đối không tự ý quét code, không đưa code của các vùng này vào đề xuất, và không tự ý thay đổi để tránh tạo ra tác dụng phụ (Side-effects).

---

## 2. Cơ chế "Hỏi Trước Khi Quét" (Prompt Gating Trigger)

- **ĐIỀU KIỆN (IF):** Người dùng đưa ra yêu cầu chung chung, mơ hồ hoặc thiếu dữ kiện kỹ thuật (Ví dụ: *"Lỗi không lưu được dữ liệu"*, *"Nút bấm bị đơ"*, *"Sửa lại logic đăng nhập"* mà không nói rõ ở trang nào hoặc module nào).
- **HÀNH ĐỘNG (THEN):** AI **NGHIÊM CẤM** việc tự suy đoán bừa bãi hoặc tự ý đọc toàn bộ mã nguồn dự án để tìm kiếm. AI **BẮT BUỘC** phải dừng lại và yêu cầu Người dùng cung cấp rõ 2 thông tin:
  1. *Lỗi/Tính năng này thuộc cụ thể Module hoặc thư mục nào?*
  2. *Tên file Page/Controller/Component/Hook cụ thể (nếu có) là gì?*

---

## 3. Quy tắc Kiểm soát Thành phần Dùng chung (Shared Assets & Risk Policy)

Khi một Module đang xử lý có liên kết, import hoặc kế thừa các thành phần dùng chung hệ thống (Ví dụ: Thư mục chứa Core Components, Utilities, Global Stores, API Clients...), AI phải tuân thủ:

1. **Quyền Đọc Công Khai (Read-Only):** AI được phép đọc các file dùng chung này để hiểu API Contract, kiểu dữ liệu (Types) hoặc cấu trúc tham số (Props). **TUYỆT ĐỐI KHÔNG SỬA ĐỔI** file gốc dùng chung để phục vụ riêng cho mục đích của một Module đơn lẻ.
2. **Mở rộng thay vì Sửa đổi (Extension over Modification):** Nếu thành phần dùng chung thiếu tính năng mà Module hiện tại đang cần, AI phải xử lý theo 2 hướng an toàn:
   - *Hướng 1:* Thêm các tham số tùy chọn (`Optional Props` / `Optional Parameters`) vào file gốc sao cho không làm ảnh hưởng/gãy code của các Module cũ đang gọi file này.
   - *Hướng 2:* Viết một hàm bọc (Wrapper), một Custom Hook hoặc một Class kế thừa ngay tại thư mục của Module đang làm việc để mở rộng tính năng cục bộ.
3. **Báo cáo Tác động (Impact Analysis):** Trong trường hợp bất khả kháng phải chỉnh sửa file dùng chung, AI bắt buộc phải chạy lệnh rà soát toàn dự án và liệt kê rõ ràng trong câu trả lời trước khi đưa code mới:
   > - **File dùng chung cần sửa:** [Đường dẫn file]
   > - **Danh sách các module khác bị ảnh hưởng:** [Liệt kê các bên đang import]
   > - **Breaking Changes:** [Có/Không - Nếu có, giải pháp đồng bộ cho các bên là gì?]

---

## 4. Quy tắc Tiết kiệm Token & Định dạng Code (Token Conservation)

- **Không viết lại file lớn:** Nếu một file code dài trên 50 dòng và AI chỉ cần thay đổi/sửa đổi một vài dòng trong đó, **NGHIÊM CẤM** việc xuất lại toàn bộ nội dung file.
- **Định dạng tối giản:** AI chỉ được trả về đoạn code thực sự thay đổi (Dạng Git Diff) hoặc trích xuất chính xác block code/hàm cần sửa đổi, kèm theo comment đánh dấu vị trí trước và sau block code đó.
- **Bảo toàn Cấu trúc (Signatures Contract):** Khi refactor hoặc fix lỗi logic, tuyệt đối giữ nguyên cấu trúc đầu ra/đầu vào (Return Signatures, API Contracts, Data Models) để tránh làm sụp đổ các thành phần phụ thuộc bên ngoài.

---

## 5. Quy trình Tự động cập nhật Nhật ký (Zero-Overhead Documentation)

> **QUY ĐỊNH CHO AI:** Không để Người dùng phải tự tay viết tài liệu. Sau khi kết thúc việc viết hoặc sửa code, AI **BẮT BUỘC** phải tự động tạo ra các đoạn văn bản (Block) có định dạng chuẩn dưới đây ở cuối câu trả lời để Người dùng chỉ cần Copy-Paste vào các file tương ứng.

### 5.1 Cấu trúc chuẩn cho `changelog.md`
Mỗi khi kết thúc một task (Fix lỗi/Thêm tính năng), sinh ra block theo cấu trúc bảng:
```markdown
| Thời gian | Tính năng/Module | Loại thay đổi | Mô tả chi tiết & Lý do | Người thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| [DD/MM/YYYY] | `[Tên_Module_Hoặc_Thư_Mục]` | [Fix Bug / New Feature / Refactor] | [Mô tả ngắn gọn lỗi hoặc tính năng + Tại sao lại sửa/thêm như vậy] | AI & Developer |


5.2 Cấu trúc chuẩn cho learning.md
Chỉ sinh block này khi giải quyết được các lỗi logic phức tạp, thuật toán tối ưu, hoặc kinh nghiệm kỹ thuật xương máu đáng lưu ý:

Markdown
### 💡 [Tiêu đề bài học ngắn gọn] ([DD/MM/YYYY])
- **Vấn đề gặp phải:** [Mô tả logic bị lỗi hoặc bài toán khó cần giải quyết]
- **Giải pháp tối ưu:** [Giải pháp đã áp dụng kèm giải thích ngắn gọn tại sao nó tối ưu]
- **Lưu ý cốt lõi:** [1 dòng cảnh báo cốt lõi cho lập trình viên sau này tránh lặp lại sai lầm]
6. Quy tắc Ngôn ngữ & Đặt tên chuẩn hóa (Naming & Language Symmetry)
Để đảm bảo mã nguồn sạch, dễ đọc và nhất quán, AI phải phân tách ngôn ngữ theo bộ lọc sau:

6.1 Quy tắc Ngôn ngữ (Language Division)
Tiếng Anh 100%: Dành cho việc đặt tên biến, tên hàm, tên file, tên class, tên bảng dữ liệu, và viết code comment giải thích logic kỹ thuật sâu bên trong hệ thống.

Ngôn ngữ Bản địa (Dành cho UI/UX): Dành riêng cho giao diện hiển thị người dùng (Labels, nút bấm, thông báo Alert/Toast, thông báo lỗi Client hiển thị).

Quy tắc Database: Giữ nguyên 100% cấu trúc đặt tên hiện tại của Database (Cho dù là Tiếng Anh hay Tiếng Việt, camelCase hay snake_case). AI tuyệt đối không tự ý dịch tên cột dữ liệu khi chưa có chỉ thị.

6.2 Quy tắc Đặt tên (Naming Conventions)
Tuân thủ quy chuẩn chung của ngôn ngữ lập trình hiện hành của dự án (Ví dụ: camelCase cho JavaScript/TypeScript/Java; snake_case cho Python/PHP; PascalCase cho các Class/Component). Không viết code lai căng giữa các quy chuẩn.