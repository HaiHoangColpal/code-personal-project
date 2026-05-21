# 💡 Learning & Insights (Kiến thức học được & Lỗi gặp phải)

File này ghi lại các sự kiện, logic, chức năng phức tạp, hoặc các lỗi (bugs) gặp phải trong quá trình code để học hỏi, hệ thống hóa kiến thức và hiểu rõ hơn về luồng của dự án. Đây là "bộ não" kiến thức nội bộ của dự án này.

> **⚠️ QUY ĐỊNH GHI LOG DÀNH CHO AI:** 
> - Mỗi khi giải quyết xong một logic khó, một cấu trúc dữ liệu phức tạp, hoặc fix xong một bug đáng chú ý, AI **bắt buộc** phải ghi log vào đây.
> - **QUY TẮC GỘP NGÀY:** Tuyệt đối KHÔNG lặp lại thẻ ngày (ví dụ `## [17/05/2026]`) nhiều lần. Nếu trong một ngày có nhiều bài học, phải gom chung vào 1 thẻ ngày đó và đánh số từng bài học (VD: `### Lần 1: Lỗi A`, `### Lần 2: Logic B`).
> - Luôn thêm các ghi chú mới nhất lên **ĐẦU** danh sách.

---

## [21/05/2026]

### Lần 1 (Bài học kinh điển về Đóng gói): Hiểm họa khi cắt (split) file JS theo độ dài cứng
- **Vấn đề / Task:** React App chạy bình thường trên máy ảo local (Vite), build ra bundle một file thành công, lệnh `clasp push` báo thành công. Nhưng khi người dùng mở Web App trên Apps Script thì bị màn hình trắng (không báo lỗi lúc build).
- **Chi tiết & Logic:**
  - *Nguyên nhân:* Google Apps Script giới hạn dung lượng mỗi file (khoảng < 400KB), vì thế `bundle.mjs` có nhiệm vụ băm nhỏ chuỗi mã JS dài (khoảng 600KB) thành `JS_0.html`, `JS_1.html`...
  - *Lỗi tư duy cũ:* Đoạn code cũ chỉ cắt chuỗi cứng nhắc `js.substring(i, i + MAX_CHUNK)`. Ở lần deploy gần nhất, lưỡi dao cắt rơi đúng vào giữa chữ `apply` của đoạn code `n.push.apply()`. Một file kết thúc ở `n.push.app`, file kia bắt đầu là `ly()`. Khi Apps Script render template HTML (`<?!= include_("JS_0") ?>`), nó có thể chèn thêm các ký tự ẩn / xuống dòng giữa các include, khiến đoạn mã bị gãy (Syntax Error).
  - *Giải pháp:* Thay vì cắt cứng, tôi viết vòng lặp `while` lùi lại từ điểm `MAX_CHUNK` để tìm dấu kết thúc câu lệnh an toàn như `;` hoặc `}` hoặc `{`. Chỉ khi gặp các dấu này mới thực hiện cắt.
- **Cách giải quyết / Bài học rút ra:** Bất cứ khi nào bạn phải xây dựng một Bundler tự chế (DIY Bundler) phân mảnh mã nguồn, **tuyệt đối không được băm nhỏ chuỗi dựa trên số byte cứng nhắc**. Việc cắt giữa chừng từ khóa (keywords) hoặc chuỗi (strings) sẽ dẫn đến lỗi cú pháp không thể báo trước. Luôn tìm "Safe Boundaries" (ranh giới an toàn) để chia tách mã nguồn!

## [17/05/2026]

### Lần 9 (Kiến trúc Backend): Đồng bộ Logic Phân loại JARS giữa Frontend & Backend
- **Vấn đề / Task:** Người dùng than phiền "Nhập chứng khoán nhưng Google Sheet chỉ ghi thu/chi, không có thông tin 6 chiếc lọ". Frontend hiển thị JARS rất đẹp nhưng Sheet trống trơn.
- **Chi tiết & Logic:**
  - *Lỗi tư duy:* Ban đầu logic `mapToJar()` chỉ tồn tại ở frontend (`JarsAnalysis.tsx`). Google Sheet hoàn toàn không biết giao dịch thuộc lọ nào. Đây là lỗi "Frontend-Only Feature" — tính năng chỉ sống trên giao diện, không persist xuống database.
  - *Giải pháp:* Mirror toàn bộ hàm `mapToJar_()` sang `Code.gs` (backend). Khi `addTransaction()` hoặc `updateTransaction()` được gọi, backend tự phân loại và ghi vào cột `Jar` mới. Đồng thời, hàm `autoUpdateJarsMonthly_()` tự động cập nhật sheet `JARS_Monthly` với tổng hợp 6 lọ.
  - *Migration:* Thêm `migrateAddJarColumn_()` chạy 1 lần khi `doGet()` để back-fill cột Jar cho tất cả giao dịch cũ. Backward compatible — nếu cột Jar đã tồn tại thì skip.
- **Cách giải quyết / Bài học rút ra:** Khi một tính năng phân tích dữ liệu cần được người dùng xem trực tiếp trên Google Sheet (không chỉ trên App), thì logic phân loại **BẮT BUỘC** phải tồn tại ở cả Frontend lẫn Backend. Quy tắc: "Nếu user muốn thấy data trên Sheet → logic phải sống ở Code.gs".

### Lần 8 (Bài học UX/UI): Thiết kế Tooltip cho Mobile & Drill-down Data
- **Vấn đề / Task:** Người dùng than phiền icon "i" không hiện giải thích (vì trên điện thoại không có thao tác Hover). Đồng thời muốn xem sâu (drill-down) vào từng chiếc lọ xem đã tiêu gì trong đó.
- **Chi tiết & Logic:**
  - *Lỗi tư duy:* Dùng thuộc tính `title` mặc định của HTML. Nó hoạt động tốt trên máy tính (Hover) nhưng gần như vô dụng trên điện thoại màn hình cảm ứng.
  - *Giải pháp Tooltip:* Đổi sang cấu trúc "Click to Reveal". Gắn state `infoJar`. Khi user chạm (click) vào chữ "i", thẻ `div` chứa text giải thích sẽ mở trượt ra ngay bên dưới. Đây là chuẩn Mobile-First.
  - *Giải pháp Drill-down Data:* Thay vì chỉ tính tổng tiền của JARS, tôi lưu nguyên một cây dữ liệu con (Child nodes). Khi bấm "Xem top chi tiêu", nó sẽ lấy dữ liệu con đó, `.sort()` từ cao xuống thấp, và dùng công thức `(item / tổng của lọ) * 100` để tính "Tác động" (% Impact).
- **Cách giải quyết / Bài học rút ra:** Trên Mobile, đừng bao giờ xài `title` hoặc Hover-tooltip. Mọi thứ ẩn giấu đều phải có nút bấm mở ra rõ ràng (Accordion / Expandable Card). Khi làm App tài chính, User luôn tò mò "Tại sao con số này lại to thế?", nên tính năng Drill-down (bóc tách dữ liệu) là bắt buộc phải có để thỏa mãn tâm lý người dùng.

### Lần 7 (Xử lý lỗi): Sửa lỗi Build TypeScript khi gán thuộc tính `title` trực tiếp vào Lucide Icon
- **Vấn đề / Task:** Khi chạy `npm run build`, TypeScript báo lỗi `TS2322: Type '{ className: string; title: string; }' is not assignable to type...` tại thẻ `<Info title="..." />`.
- **Chi tiết & Logic:**
  - *Nguyên nhân:* Thư viện `lucide-react` trong phiên bản hiện tại định nghĩa kiểu (type) của Component Icon khá chặt chẽ, không cho phép gán trực tiếp thuộc tính `title` (vốn là một thuộc tính HTML/SVG chuẩn) vào trong Component.
  - *Giải pháp:* Không gán `title` trực tiếp vào Icon. Thay vào đó, bọc Icon bên trong một thẻ `<span>` (hoặc `<div>`) và gán `title` cho thẻ `<span>` đó.
- **Cách giải quyết / Bài học rút ra:** Khi làm việc với React và TypeScript, nếu các Component bên thứ ba (đặc biệt là icon SVG) không nhận thuộc tính HTML tiêu chuẩn, cách "sạch" nhất và an toàn nhất là bọc nó vào một thẻ HTML gốc (`span/div`) để vượt qua Type-checking.

### Lần 6 (Bài học thực tế): Cạm bẫy khi tìm kiếm dữ liệu trên "Mảng đã gộp" (Aggregated Data)
- **Vấn đề / Task:** Tính năng quét từ khóa chi phí Nuôi Con bị lỗi. Người dùng nhập giao dịch có chữ "con" ở phần ghi chú nhưng biểu đồ vẫn báo "Chưa có chi tiêu nào".
- **Chi tiết & Logic:**
  - *Lỗi tư duy:* Ở phiên bản trước, tôi duyệt mảng `expenseByCategory` (là mảng ĐÃ BỊ GỘP từ backend). Mảng này chỉ chứa thuộc tính `{name, value}` (Tên danh mục và Tổng tiền). Phần mô tả (Description) của giao dịch gốc đã bị làm mất đi trong quá trình gộp. Do đó, regex không có chữ để mà bắt.
  - *Giải pháp:* Quay trở lại dùng mảng mộc (Raw data) là `transactions`. Quét qua toàn bộ giao dịch trong tháng, kết hợp hàm `tx.categoryName?.match() || tx.description.match()` để không bỏ lót bất kỳ hạt sạn nào.
- **Cách giải quyết / Bài học rút ra:** Khi viết các tính năng Filter / Regex Search (Đặc biệt là các tính năng Smart Analysis), KHÔNG BAO GIỜ được dùng Aggregated Data (dữ liệu đã bị nhóm lại). Phải luôn dùng Raw Data (dữ liệu thô) để không bị mất các trường thông tin phụ (như description/note).

### Lần 5 (Bài học quan trọng): Trải nghiệm người dùng (UX) với LLM Context Injection
- **Vấn đề / Task:** Người dùng muốn hỏi Gemini về tình hình tài chính của họ. Làm sao để việc này diễn ra trơn tru nhất mà không cần tốn tiền tích hợp API trực tiếp?
- **Chi tiết & Logic:**
  - *Lỗi tư duy thông thường:* Chỉ đặt một cái link trỏ sang trang chủ Gemini. Nếu làm vậy, người dùng sang đó sẽ phải tự gõ lại từ đầu. Trải nghiệm này rất "lười biếng" và tốn thời gian.
  - *Giải pháp (Context Injection qua Clipboard):* Dùng JavaScript lấy toàn bộ dữ liệu thật của User đang có trên App, tự động "lắp ráp" thành một câu Prompt chuẩn kỹ sư prompt. Copy ngầm nó vào Clipboard (`navigator.clipboard.writeText`), sau đó mới mở trang Gemini.
- **Cách giải quyết / Bài học rút ra:** Không nhất thiết phải tích hợp API LLM đắt đỏ vào trong App. Đôi khi, chỉ cần làm tốt khâu "Chuẩn bị Context" (Prompt Builder) và để người dùng dùng chính giao diện web của LLM là đã mang lại giá trị to lớn và UX cực kỳ ấn tượng.

### Lần 4 (Bài học cốt lõi): Tư duy Thiết kế Sản phẩm: Cá nhân (Personal) vs Gia đình (Family)
- **Vấn đề / Task:** Làm sao để đáp ứng nhu cầu quản lý chi phí cho Con cái của các gia đình mà không phá vỡ quy tắc 6 chiếc lọ (JARS) kinh điển?
- **Chi tiết & Logic:**
  - *Lỗi tư duy:* Tạo thêm 1 chiếc lọ thứ 7 tên là "Con cái". Điều này sai về mặt học thuật vì JARS phân loại theo "Mục đích dòng tiền", không phân theo "Đối tượng tiêu thụ".
  - *Giải pháp thông minh:* Giữ nguyên 6 JARS để đảm bảo sức khỏe tài chính tổng thể. Đồng thời thiết kế thêm một module "Bóc tách" (Radar) chạy ngầm song song. Nó dùng Regex scan mọi giao dịch có từ khóa liên quan đến trẻ em để tính ra một con số tổng độc lập.
- **Cách giải quyết / Bài học rút ra:** Khi đối mặt với nhu cầu rất thực tế nhưng có nguy cơ phá vỡ cấu trúc Core (JARS), giải pháp tốt nhất là **không sửa Core**, mà hãy tạo thêm một **View (Góc nhìn / Bóc tách)** mới từ cùng một tệp dữ liệu. Đây là triết lý thiết kế Data Analysis chuẩn mực.

### Lần 3 (Bài học logic): Kỹ thuật Smart Mapping (Phân loại tự động) bằng Regex
- **Vấn đề / Task:** Tích hợp quy tắc 6 Chiếc Lọ (JARS) vào hệ thống mà không bắt buộc người dùng phải tự tạo danh mục chuẩn JARS ngay từ đầu.
- **Chi tiết & Logic:**
  - *Giải pháp:* Thay vì bắt người dùng gán thẻ (tag) từng giao dịch vào đúng 6 lọ, tôi dùng kỹ thuật **Smart Mapping** bằng Regex: `name.match(/(học|sách|khóa học)/)`. Nó sẽ bắt các từ khóa thông dụng trong tên danh mục để tự ép vào Lọ tương ứng.
  - *Logic Tính Ngân sách:* Thay vì tự set ngân sách tĩnh, ngân sách của JARS được tính tự động (Dynamic Budget) bằng công thức: `Tổng thu nhập (Total Income) * Tỷ lệ % (0.55 cho NEC...)`.
- **Cách giải quyết / Bài học rút ra:** Trong phát triển sản phẩm cá nhân hóa, tự động hóa phân loại dữ liệu mang lại trải nghiệm WOW cho người dùng (Zero config).

### Lần 2 (Xử lý lỗi): Xử lý lỗi đăng nhập Clasp sai trình duyệt mặc định
- **Vấn đề / Task:** Khi chạy `npx @google/clasp login`, hệ thống tự động mở trình duyệt mặc định (VD: Chrome dùng tài khoản công ty), khiến không thể đăng nhập vào tài khoản cá nhân.
- **Chi tiết & Logic:**
  - Theo mặc định, công cụ CLI của Clasp sử dụng API của hệ điều hành để tự động mở trình duyệt mặc định nhằm thực hiện luồng OAuth.
- **Cách giải quyết / Bài học rút ra:**
  - Sử dụng cờ `--no-localhost`: Chạy lệnh `npx @google/clasp login --no-localhost`. Lệnh này in ra URL để người dùng copy và dán vào trình duyệt mong muốn (như Edge).
  - *Bài học xương máu:* Khi dùng CLI yêu cầu xác thực OAuth2, nếu bị kẹt trình duyệt, hãy luôn tìm kiếm cờ `--no-localhost` hoặc `--headless`.

### Lần 1 (Kiến trúc Component): Nâng tầm Global State & Mobile-First Design
- **Vấn đề / Task:** Cần đưa nút "Thêm giao dịch" ra ngoài thành nút Global (FAB) có thể bấm ở bất kỳ đâu trên cả Mobile và Desktop.
- **Chi tiết & Logic:**
  - *Lỗi tư duy cũ:* Component `TransactionForm` bị gắn chặt vào `TransactionList`.
  - *Giải pháp:* "Lift state up" - Nâng state quản lý form (`transactionFormOpen`, `editingTransaction`) lên cấp cao nhất là `AppContext.tsx`.
  - *Responsive Design:* Sử dụng triệt để các class của TailwindCSS (`lg:hidden` cho Mobile, `hidden lg:flex` cho Desktop).
- **Cách giải quyết / Bài học rút ra:** Khi thiết kế các tính năng "Core", luôn phải nghĩ đến việc biến nó thành Global State ngay từ đầu để tăng UX.
