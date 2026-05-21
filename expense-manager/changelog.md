# 📝 Changelog (Lịch sử thay đổi)

File này ghi lại các thay đổi của dự án qua từng giai đoạn, giúp theo dõi tiến độ và biết được lý do của từng thay đổi thông qua prompt của người dùng. Nhờ file này, dù dự án có đi xa đến đâu, chúng ta vẫn có thể xem lại lịch sử phát triển.

> **⚠️ QUY ĐỊNH GHI LOG DÀNH CHO AI:** 
> - Mỗi khi hoàn thành một chức năng, sửa lỗi, hoặc theo yêu cầu của người dùng, AI **bắt buộc** phải ghi log vào đây.
> - **QUY TẮC GỘP NGÀY:** Tuyệt đối KHÔNG lặp lại thẻ ngày (ví dụ `## [17/05/2026]`) nhiều lần. Nếu trong một ngày có nhiều lần thay đổi, phải gom chung vào 1 thẻ ngày đó và đánh số từng lần sửa (VD: `### Lần 1: Thay đổi nhỏ`, `### Lần 2: Cập nhật quan trọng`).
> - Luôn thêm các bản cập nhật mới nhất lên **ĐẦU** danh sách (ngay dưới dòng phân cách này).

---

## [21/05/2026]

### Lần 1 (Sửa lỗi cực kỳ nghiêm trọng): Fix lỗi trắng trang khi deploy lên Apps Script
- **Prompt:** "Khi deploy trên Apps Script load bị lỗi không hiển thị. Có vấn đề gì đó với HTML hoặc xung đột gì đó."
- **Nguyên nhân cốt lõi:** Lỗi "White Screen of Death" trên Apps Script không xuất phát từ React hay Layout, mà nằm ở công cụ đóng gói `scripts/bundle.mjs`. Quá trình build chia nhỏ file JS thành nhiều file (ví dụ `JS_0.html` và `JS_1.html`) dựa trên giới hạn `380KB`. Thuật toán cũ dùng `js.substring(i, i + MAX_CHUNK)` để cắt đúng vào vị trí ký tự. Xui xẻo thay, đoạn cắt lại rơi vào đúng giữa một thuộc tính hoặc lời gọi hàm của JavaScript (ví dụ: `n.push.app` nằm ở file 1, `ly(n,r)` nằm ở file 2). Khi Apps Script ghép 2 file này lại bằng hàm `include_()`, khoảng trắng hoặc ký tự ngắt dòng vô tình xen vào, dẫn đến lỗi cú pháp (Syntax Error) nghiêm trọng, làm sập toàn bộ React và gây ra trắng trang.
- **Thay đổi chính:** 
  - Sửa thuật toán cắt chuỗi trong `scripts/bundle.mjs`. 
  - Thay vì cắt cứng tại vị trí `MAX_CHUNK`, script sẽ quét lùi lại để tìm một ranh giới an toàn (sau dấu chấm phẩy `;`, ngoặc nhọn `}` hoặc ngoặc nhọn `{`) trước khi cắt sang file mới. Điều này đảm bảo mỗi file JS con đều không bị đứt đoạn cú pháp ở giữa câu lệnh.
- **Lý do/Mục đích:** Sửa triệt để lỗi người dùng không mở được ứng dụng khi deploy lên Apps Script (không còn tình trạng báo load thành công nhưng màn hình trắng).

## [17/05/2026]

### Lần 12 (Sửa lỗi quan trọng + Tính năng mới): JARS ghi vào Sheet + Fix Deploy Mobile
- **Prompt:** "Tôi thêm rồi vẫn chỉ hiển thị giao diện bên phần test, mở bằng điện thoại lại ko có phần thêm bên test. Tôi nhập thử chứng khoán nhưng dữ liệu ghi vào sheet vẫn chỉ có thu chi, chứ không kèm thêm các cột chia theo 6 chiếc lọ"
- **Thay đổi chính:**
  - **`Code.gs` — JARS ghi vào Google Sheet:**
    - Thêm function `mapToJar_()` (mirror logic từ `JarsAnalysis.tsx`) để phân loại giao dịch vào 6 chiếc lọ ngay tại backend.
    - Thêm cột `Jar` vào sheet Transactions: mỗi giao dịch chi tiêu tự động được gán NEC/FFA/LTSS/EDU/PLAY/GIVE.
    - Thêm function `autoUpdateJarsMonthly_()`: sau mỗi lần thêm/sửa/xóa giao dịch, sheet `JARS_Monthly` tự động cập nhật tổng hợp 6 lọ (Budget, Spent, %) cho tháng đó.
    - Thêm `migrateAddJarColumn_()`: chạy 1 lần khi `doGet()` để back-fill cột Jar cho dữ liệu cũ.
  - **`Layout.tsx` — Fix hamburger menu mobile:**
    - Thêm nút `☰ Menu` vào header trên mobile (`lg:hidden`) để mở Sidebar. Trước đó header không có nút menu, người dùng mobile chỉ dựa vào BottomNav.
  - **`types/index.ts`:** Thêm field `jar?: string` vào interface Transaction.
  - **`ARCHITECTURE.md`:** Cập nhật schema Transactions (thêm Jar), thêm schema JARS_Monthly, cập nhật số sheet từ 3 → 5.
- **Lý do/Mục đích:**
  - Giải quyết pain-point: người dùng mở Google Sheet chỉ thấy "thu/chi" trống trải, không biết khoản nào thuộc lọ nào. Giờ cột Jar cho phép lọc/filter ngay trên Sheet.
  - Fix lỗi deploy: người dùng cần build lại + copy `gas/Code.gs` + `gas/Index.html` lên GAS + tạo **New deployment** (không chỉ save).
  - Hamburger menu giúp mobile user truy cập Sidebar/Ngân sách/Danh mục dễ dàng hơn.

### Lần 11 (Tính năng mới quan trọng): Khoản Cố Định Hàng Tháng (Recurring Templates)
- **Prompt:** "Cần tạo danh mục thường xuyên để hàng tháng click chọn khỏi phải nhập lại... số tiền lãi có thể chỉnh sửa nếu khác?"
- **Thay đổi chính:**
  - Tạo mới `RecurringTemplates.tsx`: Component quản lý danh sách các khoản cố định (lưu `localStorage`, không cần backend).
  - Tích hợp vào đầu trang `TransactionList.tsx` như một Card Accordion có thể thu gọn.
  - **Quick Add Sheet**: Bấm vào 1 khoản → pop-up nhỏ hiện ra với số tiền mặc định, chọn ngày và bấm Xác nhận là xong. Toàn bộ < 3 giây.
  - **Checkbox "Cố định số tiền"**: Bỏ tick → số tiền có thể sửa trước khi xác nhận (phù hợp cho tiền lãi thay đổi mỗi tháng).
  - Khi thêm thành công → card chuyển màu xanh + check icon 2.5 giây để feedback trực quan.
- **Lý do/Mục đích:** Giải quyết pain point lớn nhất: không cần nhập lại tay 3 khoản cố định mỗi tháng (gốc nhà 4.2tr, bảo hiểm, tiền lãi). Tăng tốc độ nhập liệu từ ~2 phút xuống còn ~10 giây/tháng.

### Lần 10 (Sửa Logic cốt lõi): JARS Smart Mapper V3 — Phân loại chính xác Tiền Gốc vs Tiền Lãi
- **Prompt:** "Tại sao tiền lãi ngân hàng, tiền gốc ngân hàng đều bị tính vào thiết yếu? Logic gom lọ chưa đúng?"
- **Lý do về Tài chính (rất quan trọng):**
  - **Tiền LÃI vay** (mortgage interest) = Chi phí thực sự, bạn trả và không nhận lại gì → đúng là NEC ✅
  - **Tiền GỐC vay** (mortgage principal) = Bạn đang "tích lũy tài sản" (building equity), giảm nợ = tăng tài sản → nên là LTSS ✅
  - Quy tắc ngón tay cái: Nếu tiền đó "đi đi và không trở lại" → NEC. Nếu tiền đó "đi nhưng tài sản tăng" → LTSS.
- **Thay đổi chính:**
  - `JarsAnalysis.tsx` và `CategoryManager.tsx`: Thêm từ khóa `tiền gốc|trả gốc|gốc vay|gốc ngân hàng|trả nợ gốc|gốc nhà|gốc xe` vào nhóm LTSS.
  - Mở rộng toàn bộ từ khóa cho 5 lọ: thêm `crypto`, `etf`, `resort`, `spa`, `thời trang`, `học phí`, `hỗ trợ`... cho hệ thống nhận diện tự nhiên hơn.
  - Thêm comment giải thích logic tài chính trong code để AI tiếp theo không làm sai lại.

### Lần 9 (Nâng cấp UX): JARS Suggester + Thêm Danh mục vào BottomNav
- **Prompt:** "Tôi muốn thêm danh mục khác nhưng không thấy? Khi thêm danh mục mới có gợi ý thuộc lọ chi tiêu nào không?"
- **Thay đổi chính:**
  - `BottomNav.tsx`: Thay nút "Menu" vô nghĩa bằng nút **"Danh mục"** (`Tags` icon) dẫn thẳng đến trang `CategoryManager`. Người dùng điện thoại nay vào thêm/sửa danh mục trực tiếp từ bottom bar.
  - `CategoryManager.tsx`: Thêm function `predictJar()` dùng Regex giống hệt JARS engine. Khi người dùng gõ tên danh mục Chi tiêu, hệ thống sẽ hiện ngay **chip gợi ý** (VD: `✨ Danh mục này sẽ được xếp vào lọ 📚 Giáo dục (10%)`). Gợi ý cập nhật real-time theo từng ký tự gõ.
- **Lý do/Mục đích:** Giải quyết vấn đề UX quan trọng: người dùng không biết "Chiếc lọ" sẽ nhận danh mục mình tạo ra. Gợi ý tức thì giúp người dùng nắm ngay được logic phân loại mà không cần đọc hướng dẫn.

### Lần 8 (Nâng cấp Tính năng): Xem chi tiết Top chi tiêu & Tooltip Tương tác cho JARS
- **Prompt:** "theo mỗi chiếc lọ đó khi click vào biết tháng này chi tiêu cho thiết yếu là những cái nào? Sắp xếp theo cái lớn xuống nhỏ... chỗ icon khi click vào vẫn không có gợi ý"
- **Thay đổi chính:**
  - Viết lại thuật toán tính toán `JarsAnalysis.tsx`. Thay vì chỉ cộng dồn tổng tiền, hệ thống giờ đây lưu mảng chi tiết các giao dịch thuộc từng chiếc lọ (nhóm theo tên/ghi chú giao dịch).
  - Thêm nút "Xem top chi tiêu" (kèm hiệu ứng mở rộng Accordion). Khi bấm vào, nó liệt kê tối đa 5 khoản chi lớn nhất trong lọ đó, sắp xếp giảm dần, và tính toán "% Impact" (khoản này chiếm bao nhiêu % trong tổng tiền đã tiêu của lọ).
  - Đổi cơ chế `title` (vốn chỉ hoạt động khi hover trên máy tính) thành một nút bấm thực sự. Khi người dùng click vào Icon `(i)`, một hộp thoại inline (Inline Tooltip) sẽ trượt xuống để giải thích chi tiết ý nghĩa tài chính của chiếc lọ đó.
- **Lý do/Mục đích:** Khắc phục nhược điểm của giao diện Mobile (không có chuột để hover). Đồng thời tăng chiều sâu phân tích: Không chỉ báo "Bạn đã tiêu 10 triệu cho thiết yếu", mà còn chỉ thẳng ra "Khoản đi siêu thị chiếm 40% trong số 10 triệu đó", giúp người dùng biết cần cắt giảm cái gì.

### Lần 6 (Tinh chỉnh UI/UX & Logic): Nâng cấp hiển thị và sửa lỗi Regex
- **Prompt:** "khi nhập số tiền nên có dấu , phân cách... Chỗ thiết yếu lấy 1 số sau thập phân... thêm Icon và giải thích chữ i... mục phân tích tiền chi phí con cái không hiển thị dù ghi chú có chữ con"
- **Thay đổi chính:**
  - `TransactionForm.tsx`: Đổi Input số tiền từ `type="number"` sang `type="text"` với `inputMode="numeric"`, thêm logic tự động format dấu phẩy `,` (ví dụ 23000 -> 23,000) ngay khi đang gõ.
  - `JarsAnalysis.tsx`: Thêm thư viện icon cho 6 chiếc lọ (Home, LineChart, PiggyBank...). Gắn thêm icon `Info` kèm thuộc tính `title` để hiển thị giải thích chi tiết khi người dùng hover/click. Format lại % ngân sách đã chi thành 1 số thập phân (VD: `50.1%`).
  - `FamilyAnalysis.tsx`: Thay đổi logic cốt lõi. Chuyển từ việc quét từ khóa trên mảng gộp `expenseByCategory` sang quét trực tiếp trên toàn bộ `transactions` của tháng. Nhờ vậy Regex mới có thể bắt được chữ "con" nằm trong phần mô tả (description) thay vì chỉ bắt tên danh mục.
- **Lý do/Mục đích:** Khắc phục lỗi "bỏ lọt" dữ liệu của Regex khi người dùng ghi chú chi tiết. Nâng tầm UI cho JARS bằng icon trực quan và số liệu chuẩn xác hơn. Trải nghiệm nhập số tiền thân thiện hơn.

### Lần 5 (Thay đổi quan trọng): Tích hợp Trợ lý AI (Gemini) phân tích tài chính
- **Prompt:** "Tôi muốn thêm phần hỏi đáp liên quan, người dùng click vào tự động mở gemini bản thinking lên để hỏi về tài chính và quản lý chi tiêu?"
- **Thay đổi chính:**
  - Thiết kế Component `GeminiAssistant.tsx` nằm ở cuối trang Dashboard.
  - Viết logic tự động tổng hợp toàn bộ dữ liệu tài chính trong tháng (Tổng thu, tổng chi, số dư, chi tiết từng khoản chi) thành một đoạn Prompt chuyên nghiệp.
  - Tự động Copy đoạn Prompt đó vào Clipboard (bộ nhớ tạm) của người dùng bằng `navigator.clipboard.writeText`.
  - Mở trang `https://gemini.google.com/app` ở một tab mới để người dùng dễ dàng Dán (Ctrl+V) và nhận lời khuyên từ siêu trí tuệ AI.
- **Lý do/Mục đích:** Tạo ra trải nghiệm kết nối mượt mà giữa ứng dụng cá nhân và công cụ AI mạnh nhất thế giới. 

### Lần 4 (Thay đổi quan trọng): Bóc tách "Chi phí Nuôi Con" từ bức tranh tài chính gia đình
- **Prompt:** "Ứng dụng này tôi và vợ tôi nhập chung... chi tiêu cho con cái như sữa, học tập... thì vẫn tính chung 6 lọ hay có thêm phân tích khác không?"
- **Thay đổi chính:**
  - Viết thêm Component `FamilyAnalysis.tsx` chuyên biệt để "soi" và bóc tách các chi phí liên quan đến trẻ nhỏ.
  - Vẫn giữ nguyên luồng của 6 JARS để đảm bảo chuẩn mực quản lý tài chính quốc tế.
  - Sử dụng chung kỹ thuật Regex Keywords `/(sữa|bỉm|con|bé|nhà trẻ|đồ chơi...)/` để lọc riêng một bản phân tích.
- **Lý do/Mục đích:** Giải quyết điểm đau (Pain-point) lớn nhất của các cặp vợ chồng Việt Nam khi gộp quỹ chung là không thể kiểm soát và định lượng được "chi phí ẩn" khổng lồ từ việc nuôi con nhỏ.

### Lần 3 (Thay đổi quan trọng): Phân tích JARS (6 Chiếc Lọ) trên Dashboard
- **Prompt:** "Tôi muốn trang tổng quan có 2 phần... phần 2 là chia thu nhập theo 6 mục... xem cái nào đạt chi tiêu, cái nào chưa đạt cần thêm... đưa ra thông tin gợi ý cho người dùng."
- **Thay đổi chính:**
  - Viết Component mới `JarsAnalysis.tsx` thực hiện chức năng quy tắc 6 chiếc lọ.
  - Sử dụng Regex để "Smart Mapping" tự động nhận diện danh mục chi tiêu của người dùng (từ `expenseByCategory`) ném vào 6 quỹ tương ứng.
  - Tính toán toán học: Lấy `totalIncome` * `% Jars` để ra Budget (Ngân sách) cho từng lọ.
  - Xây dựng giao diện Progress Bar cho mỗi chiếc lọ kèm theo "AI Advice".
  - Tích hợp vào `Dashboard.tsx` ngay bên dưới các thẻ tổng quan.
- **Lý do/Mục đích:** Tăng cường khả năng "Quản lý" (Management) thay vì chỉ "Theo dõi" (Tracking) chi tiêu.

### Lần 2 (Thay đổi quan trọng): Nâng cấp UI Mobile-First (Thêm Navigation Bar & FAB)
- **Prompt:** "Tôi sài thử app rồi... Bạn có thể điều chỉnh giúp tôi. Ví dụ các nút thêm giao dịch có thể ở trên cùng để nhấn thêm, hoặc dưới cùng... thiết kế, ưu tiên điện thoại..."
- **Thay đổi chính:**
  - Chuyển logic quản lý Form Giao dịch (`TransactionForm`) sang biến Global trong `AppContext.tsx`.
  - Tạo Component `BottomNav.tsx` dành riêng cho màn hình Mobile, bao gồm nút thêm giao dịch nổi (FAB - Floating Action Button) to ở giữa.
  - Tích hợp `BottomNav` vào `Layout.tsx`, chỉ hiển thị trên mobile (`lg:hidden`).
  - Thêm nút "Thêm giao dịch" trên thanh Header dành riêng cho Desktop (`hidden lg:flex`).
- **Lý do/Mục đích:** Tối ưu hóa trải nghiệm người dùng (UX) trên điện thoại, giúp thao tác thêm mới giao dịch nhanh chóng hơn như các app Misa, Money Lover.

### Lần 1 (Thay đổi nhỏ): Khởi tạo hệ thống tài liệu quản lý dự án
- **Prompt:** "Tạo giúp tôi file Structure.md viết lại Workflow code, thư viện, cài đặt... tạo 2 file, 1 file là changelog.md... 1 file là learning.md..."
- **Thay đổi chính:**
  - Tạo file `Structure.md` để quy định luật lệ làm việc cho AI, tổng hợp công nghệ, cấu trúc thư mục.
  - Tạo file `changelog.md` để ghi nhận các bước phát triển.
  - Tạo file `learning.md` để lưu lại kiến thức, lỗi và logic code.
- **Lý do/Mục đích:** Để AI làm việc có hệ thống hơn, tránh làm hỏng cấu trúc dự án.
