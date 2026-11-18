# Section #800 DCS / SCADA Process Simulator (HDPE Plant Utilities)

Gói mã nguồn và câu lệnh khởi tạo ứng dụng mô phỏng vận hành **Cụm 800 (Hệ thống phụ trợ nhà máy HDPE)** sẵn sàng đưa lên **GitHub** và deploy lên **Vercel**.

## Cấu trúc thư mục
- `PROMPT.md`: Câu lệnh (Prompt) chi tiết đầy đủ thông số kỹ thuật, tag thiết bị, ngưỡng báo động (H/HH/L/LL), khóa liên động (Interlock) và các kịch bản sự cố để dùng với AI Coding Tools (Cursor, Bolt.new, Lovable, v0.dev).
- `package.json` & `vite.config.js` & `index.html`: Cấu hình dự án React + Vite + TailwindCSS chuẩn để chạy ngay và deploy Vercel.
- `src/App.jsx`: Giao diện DCS/SCADA tương tác trực tiếp (mô phỏng P&ID động, van điều khiển AUTO/MAN, bật/tắt bơm, tiêm sự cố và hướng dẫn khắc phục SOP).

## Hướng dẫn chạy & Deploy lên GitHub / Vercel

### Cách 1: Chạy trực tiếp từ code có sẵn trong gói này
1. Giải nén thư mục `section-800-dcs-simulator`.
2. Mở Terminal trong thư mục và chạy:
   ```bash
   npm install
   npm run dev
   ```
3. Đẩy lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Section 800 DCS Simulator"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
4. Truy cập [vercel.com](https://vercel.com) -> **Add New Project** -> Import repo từ GitHub -> Bấm **Deploy**.

### Cách 2: Dùng `PROMPT.md` để AI mở rộng thêm tính năng
Copy toàn bộ nội dung trong file `PROMPT.md` dán vào **Bolt.new**, **Lovable.dev**, hoặc **Cursor** để tùy biến sâu hơn.
