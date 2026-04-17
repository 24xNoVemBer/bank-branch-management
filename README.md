# Hệ Thống Quản Lý Chi Nhánh Ngân Hàng (Bank Branch Management)

Đây là dự án hệ thống phần mềm quản lý chi nhánh ngân hàng toàn diện, bao gồm các chức năng: Quản lý khách hàng, quản lý nhân viên, cấp phát tài khoản ngân hàng (tín dụng, gửi tiền), quản lý giao dịch chi tiêu tín dụng và thanh toán dư nợ.

## 🛠 Công nghệ sử dụng
- **Frontend**: Next.js (React), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js, CORS.
- **Cơ sở dữ liệu**: PostgreSQL (Được lưu trữ trên Supabase).
- **Kiến trúc Database**: Cơ chế Trigger/View chuyên sâu trên PostgreSQL để xử lý logic toàn vẹn dữ liệu, các báo cáo tài chính phức tạp và chống thất thoát dữ liệu.

---

## 🚀 Hướng dẫn cài đặt và khởi chạy dự án

### 1. Chuẩn bị (Prerequisites)
- Đã cài đặt [Node.js](https://nodejs.org/) (khuyến nghị bản LTS mới nhất).
- Đã có tài khoản trên [Supabase](https://supabase.com/).

### 2. Thiết lập Cơ sở dữ liệu (Supabase)
1. Đăng nhập vào [Supabase](https://supabase.com/), tạo một Project mới.
2. Tại thanh điều hướng bên trái, vào mục **SQL Editor**.
3. Mở file `BE/code1.1.sql` bằng một trình soạn thảo văn bản.
4. Copy toàn bộ nội dung của file này, dán vào SQL Editor trên Supabase và bấm **Run**. Thao tác này sẽ tự động khởi tạo toàn bộ Table, Indexes, View, và Triggers cần thiết.

### 3. Thiết lập Backend (Server)
1. Mở Terminal, di chuyển vào thư mục BE:
   ```bash
   cd BE
   ```
2. Cài đặt các gói phụ thuộc (nếu có thư mục `node_modules` bị thiếu, cần tạo file package.json và cài đặt `express`, `cors`, `@supabase/supabase-js`, `dotenv`).
   ```bash
   npm install
   ```
3. Tạo một file `.env` tại thư mục gốc của Backend (`BE/.env`) và cấu hình kết nối Supabase (bạn lấy các thông số này ở phần **Project Settings > API** trên Supabase):
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   ```
4. Khởi chạy Server:
   ```bash
   node server.js
   ```
   > 📌 Server Backend sẽ chạy tại: `http://localhost:8080`

### 4. Thiết lập Frontend (Web)
1. Mở một cửa sổ Terminal khác, di chuyển vào thư mục FE:
   ```bash
   cd FE
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy dự án (hoặc sử dụng `cmd /c "npm run dev"` nếu PowerShell báo lỗi chặn script):
   ```bash
   npm run dev
   ```
   > 📌 Giao diện Web Frontend sẽ chạy tại: `http://localhost:3000`

---

## 💡 Các tính năng nổi bật
* **Bộ quy tắc tín dụng tự động (Triggers)**: Tự động từ chối nếu số tiền giao dịch vượt quá hạn mức tín dụng, tự động tăng / giảm số dư và dư nợ khi có biến động giao dịch.
* **Bộ đếm KPI & Lương**: Hệ thống View tự động tính thưởng nhân viên dựa trên các thẻ lập được trong tháng.
* **Quyền hạn tự thu thập**: Đảm bảo chỉ Nhân viên phòng kinh doanh mới có thể mở thẻ và đứng tên KPI phục vụ khách hàng.

## 👥 Đóng góp (Contributing)
Mọi Pull Request đều được chào đón. Đối với các thay đổi lớn, vui lòng mở issue trước để thảo luận về những gì bạn muốn thay đổi.

---
*Dự án nội bộ - Vui lòng không rò rỉ JWT Token của Supabase.*
