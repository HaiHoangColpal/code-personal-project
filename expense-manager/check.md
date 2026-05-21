# Web & App Development Best Practices Checklist

File này dùng để kiểm tra, đánh giá và cải tiến dự án web/app theo tiêu chuẩn của một developer chuyên nghiệp.

## 1. Architecture & Code Quality 🏗️
- [ ] **Clean Code:** Áp dụng nguyên tắc SOLID, DRY (Don't Repeat Yourself), KISS (Keep It Simple, Stupid).
- [ ] **Linter & Formatter:** Sử dụng ESLint, Prettier (hoặc các công cụ tương đương) và tích hợp vào pre-commit hooks (VD: Husky, lint-staged).
- [ ] **Folder Structure:** Cấu trúc thư mục dự án rõ ràng, theo module hoặc tính năng (feature-based).
- [ ] **State Management:** Lựa chọn giải pháp quản lý state phù hợp (Redux, Zustand, Context API, v.v.) và không lạm dụng global state.
- [ ] **Typing:** Sử dụng TypeScript một cách nghiêm ngặt (`strict: true`), hạn chế tối đa việc sử dụng kiểu `any`.
- [ ] **Testing:** Viết Unit Tests (Jest, Vitest), Integration Tests và E2E Tests (Cypress, Playwright). Đảm bảo độ bao phủ code (code coverage) hợp lý.
- [ ] **Code Review:** Mọi pull request đều phải được review kỹ lưỡng trước khi merge vào nhánh chính.

## 2. Performance (Hiệu Suất) 🚀
- [ ] **Image Optimization:** Nén hình ảnh, sử dụng định dạng WebP/AVIF, áp dụng Lazy Loading cho hình ảnh ngoài màn hình hiển thị.
- [ ] **Code Splitting & Lazy Loading:** Chia nhỏ bundle JS (Code Splitting) và lazy load các component/route không cần thiết lúc khởi tạo.
- [ ] **Caching:** Tận dụng HTTP Caching (Cache-Control, ETag), sử dụng Service Workers cho PWA để cache tài nguyên.
- [ ] **Minification & Compression:** Minify CSS, JS, HTML và bật nén Gzip/Brotli trên server.
- [ ] **Tree Shaking:** Đảm bảo bundle cuối cùng chỉ chứa các code thực sự được sử dụng.
- [ ] **Core Web Vitals:** Tối ưu hóa LCP (Largest Contentful Paint), FID/INP (Interaction to Next Paint), CLS (Cumulative Layout Shift) theo chuẩn của Google.
- [ ] **Database & API:** Tối ưu hóa query database, thiết lập phân trang (pagination), áp dụng caching ở tầng server (VD: Redis).

## 3. Security (Bảo Mật) 🔒
- [ ] **HTTPS:** Bắt buộc sử dụng HTTPS với SSL/TLS hợp lệ cho tất cả kết nối.
- [ ] **Authentication & Authorization:** Quản lý JWT an toàn (lưu trong HttpOnly cookies thay vì localStorage) hoặc dùng OAuth2. Phân quyền chặt chẽ.
- [ ] **XSS (Cross-Site Scripting):** Escape/Sanitize dữ liệu đầu vào và đầu ra, cấu hình Content Security Policy (CSP).
- [ ] **CSRF (Cross-Site Request Forgery):** Sử dụng Anti-CSRF tokens hoặc cấu hình thuộc tính `SameSite` cho cookies.
- [ ] **SQL/NoSQL Injection:** Sử dụng ORM/ODM hoặc parameterized queries, tuyệt đối không nối chuỗi trực tiếp vào query.
- [ ] **Rate Limiting & Throttling:** Chống spam và tấn công DDoS ở tầng API.
- [ ] **Dependencies:** Thường xuyên chạy `npm audit` hoặc sử dụng Dependabot/Snyk để quét lỗ hổng bảo mật từ thư viện bên thứ 3.
- [ ] **Sensitive Data:** Không lưu trữ hardcode secrets, API keys trong source code. Quản lý thông qua biến môi trường (`.env`) và không commit file `.env`.

## 4. Accessibility (Khả Năng Truy Cập - a11y) ♿
- [ ] **Semantic HTML:** Sử dụng đúng các thẻ HTML5 (`<header>`, `<nav>`, `<main>`, `<article>`, `<button>`, thay vì dùng `<div>` cho mọi thứ).
- [ ] **ARIA Attributes:** Bổ sung ARIA roles và attributes khi HTML thuần không đủ ngữ nghĩa cho screen readers.
- [ ] **Keyboard Navigation:** Đảm bảo toàn bộ trang web/app có thể điều hướng, sử dụng được bằng phím Tab và Enter.
- [ ] **Color Contrast:** Đảm bảo độ tương phản màu sắc đạt chuẩn WCAG (ít nhất là AA).
- [ ] **Alt Text:** Cung cấp thuộc tính `alt` mô tả đầy đủ cho mọi hình ảnh (để trống `alt=""` nếu là ảnh trang trí thuần túy).

## 5. SEO (Tối Ưu Hóa Công Cụ Tìm Kiếm) 🔍
- [ ] **Meta Tags:** Cấu hình Title, Description, Keywords, và Canonical URLs đầy đủ và duy nhất cho mỗi trang.
- [ ] **Open Graph & Twitter Cards:** Cấu hình thẻ meta (og:title, og:image...) để hiển thị đẹp khi người dùng chia sẻ link lên mạng xã hội.
- [ ] **Sitemap & robots.txt:** Tạo file `sitemap.xml` tự động cập nhật và file `robots.txt` hợp lệ để hướng dẫn bot tìm kiếm.
- [ ] **SSR/SSG:** Sử dụng Server-Side Rendering (Next.js, Nuxt) hoặc Static Site Generation cho các trang public cần SEO mạnh.
- [ ] **URL Structure:** Xây dựng URL thân thiện, dễ đọc (VD: `/danh-muc/dien-thoai` thay vì `/category?id=123`).

## 6. UX/UI & Design 🎨
- [ ] **Responsive Design:** Đảm bảo giao diện hiển thị tốt trên mọi kích thước màn hình (Khuyến khích Mobile First approach).
- [ ] **Feedback/States:** Luôn cung cấp phản hồi trực quan cho người dùng (Loading spinners, skeleton loaders, error messages, success toasts).
- [ ] **Error Boundaries:** Xử lý lỗi UI mượt mà, không làm sập (crash) toàn bộ ứng dụng trắng trang.
- [ ] **Micro-interactions:** Thêm các hiệu ứng hover, transition nhẹ nhàng để tăng cảm giác mượt mà và cao cấp.
- [ ] **Offline/Poor Network Mode:** Xử lý thân thiện (hiện thông báo) khi người dùng mất kết nối mạng, thay vì để lỗi mạng mặc định của trình duyệt.

## 7. DevOps, CI/CD & Monitoring ⚙️
- [ ] **Version Control:** Sử dụng Git chuẩn chỉ (Git Flow hoặc GitHub Flow), commit messages rõ ràng (VD: Conventional Commits).
- [ ] **CI/CD Pipeline:** Tự động hóa quá trình test, lint, build và deploy (Sử dụng GitHub Actions, GitLab CI, Jenkins...).
- [ ] **Environments:** Phân chia rõ ràng và riêng biệt các môi trường: Development, Staging (để test), Production (thực tế).
- [ ] **Error Tracking:** Tích hợp công cụ tracking lỗi (Sentry, LogRocket, Datadog...) để nhận thông báo realtime khi có lỗi xảy ra trên production.
- [ ] **Analytics & Logging:** Cài đặt Google Analytics/PostHog đo lường người dùng và ghi log chi tiết ở phía server (Winston, Morgan, ELK Stack).
