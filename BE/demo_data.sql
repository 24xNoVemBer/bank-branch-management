-- ==========================================
-- SCRIPT TẠO DỮ LIỆU MẪU (MOCK DATA)
-- Chạy đoạn script này trong Supabase SQL Editor
-- ==========================================

-- Lưu ý: Đề phòng trùng lặp do đã chạy trước đó, ta sẽ dùng cách xoá trắng bảng trước khi chèn 
-- (nếu không muốn xoá dữ liệu cũ, bạn có thể comment các dòng TRUNCATE)

TRUNCATE TABLE public.thanh_toan_tin_dung CASCADE;
TRUNCATE TABLE public.gd_gui_tien CASCADE;
TRUNCATE TABLE public.gd_tin_dung CASCADE;
TRUNCATE TABLE public.tk_gui_tien CASCADE;
TRUNCATE TABLE public.tk_tin_dung CASCADE;
TRUNCATE TABLE public.mo_tai_khoan CASCADE;
TRUNCATE TABLE public.tai_khoan CASCADE;
TRUNCATE TABLE public.khach_hang CASCADE;
TRUNCATE TABLE public.nhan_vien CASCADE;

-- 1. Thêm 10 Nhân Viên
INSERT INTO public.nhan_vien (ma_nv, cmt, ten, dob, dia_chi, vi_tri, bac_nghe, tham_nien) VALUES
(1, '001201099991', 'Trần Quản Lý', '1985-05-10', 'Hà Nội', 'Quan ly', 'Bậc 4', 10),
(2, '001201099992', 'Lê Kinh Doanh', '1990-07-20', 'Hà Nội', 'Kinh doanh', 'Bậc 2', 4),
(3, '001201099993', 'Phạm Giao Dịch', '1995-12-05', 'Đà Nẵng', 'Giao dịch viên', 'Bậc 1', 2),
(4, '001201099994', 'Nguyễn Quỳnh Anh', '1992-03-15', 'Hải Phòng', 'Kinh doanh', 'Bậc 3', 5),
(5, '001201099995', 'Vũ Đức Đam', '1988-11-20', 'TP.HCM', 'Quan ly', 'Bậc 4', 8),
(6, '001201099996', 'Hoàng Minh Tuấn', '1996-01-30', 'Hà Nội', 'Giao dịch viên', 'Bậc 1', 1),
(7, '001201099997', 'Đặng Thùy Trâm', '1994-09-12', 'Cần Thơ', 'Giao dịch viên', 'Bậc 2', 3),
(8, '001201099998', 'Bùi Văn Tiến', '1991-08-25', 'Nghệ An', 'Kinh doanh', 'Bậc 3', 6),
(9, '001201099999', 'Trịnh Xuân Thanh', '1987-02-14', 'Hà Nội', 'Quan ly', 'Bậc 5', 12),
(10, '001201099910', 'Hồ Quang Hiếu', '1998-04-10', 'TP.HCM', 'Giao dịch viên', 'Bậc 1', 1);

-- 2. Thêm 15 Khách Hàng
INSERT INTO public.khach_hang (ma_kh, cmt, ten, dob, dia_chi) VALUES
(1, '030099001111', 'Nguyễn Văn An', '1990-01-01', 'Hà Nội'),
(2, '030099002222', 'Trần Thị Bình', '1982-02-15', 'Hải Phòng'),
(3, '030099003333', 'Lê Hữu Đạt', '1995-04-20', 'TP.HCM'),
(4, '030099004444', 'Phạm Minh Châu', '1988-11-10', 'Hà Nội'),
(5, '030099005555', 'Vũ Tấn Tài', '1991-09-08', 'Đà Nẵng'),
(6, '030099006666', 'Hoàng Bảo Ngọc', '1998-05-14', 'Cần Thơ'),
(7, '030099007777', 'Đặng Kim Chi', '1985-12-25', 'Bình Dương'),
(8, '030099008888', 'Bùi Ngọc Huy', '1993-07-30', 'Đồng Nai'),
(9, '030099009999', 'Trịnh Quốc Toản', '1979-03-22', 'Huế'),
(10, '030099001122', 'Hồ Thị Thanh', '1992-06-18', 'Quảng Nam'),
(11, '030099003344', 'Ngô Kiến Huy', '1996-08-05', 'Hà Nội'),
(12, '030099005566', 'Đinh Tiến Đạt', '1980-02-28', 'TP.HCM'),
(13, '030099007788', 'Lý Hải', '1975-10-15', 'Nghệ An'),
(14, '030099009900', 'Đào Tuấn Anh', '1989-12-12', 'Thái Bình'),
(15, '030099001234', 'Châu Lệ Tuyết', '2000-01-20', 'Hà Nội');

-- 3. Thêm Tài Khoản Chung (20 tài khoản: 10 gửi tiền, 10 tín dụng)
INSERT INTO public.tai_khoan (stk, so_du, ma_kh) VALUES
('TKGT001', 50000000, 1),
('TKGT002', 120000000, 2),
('TKGT003', 4500000, 3),
('TKGT004', 800000000, 4),
('TKGT005', 15000000, 5),
('TKGT006', 75000000, 11),
('TKGT007', 300000000, 12),
('TKGT008', 21000000, 13),
('TKGT009', 0, 14),
('TKGT010', 500000, 15),
-- Tín dụng
('TKTD001', 0, 1),
('TKTD002', 0, 3),
('TKTD003', 0, 6),
('TKTD004', 0, 7),
('TKTD005', 0, 8),
('TKTD006', 0, 9),
('TKTD007', 0, 10),
('TKTD008', 0, 12),
('TKTD009', 0, 13),
('TKTD010', 0, 15);

-- 4. Phân loại Tài khoản Gửi Tiền
INSERT INTO public.tk_gui_tien (stk, so_du_toi_thieu, lai_suat_hang_thang) VALUES
('TKGT001', 50000, 5.5),
('TKGT002', 50000, 5.5),
('TKGT003', 50000, 5.5),
('TKGT004', 50000, 6.0),
('TKGT005', 50000, 5.5),
('TKGT006', 50000, 5.5),
('TKGT007', 50000, 6.0),
('TKGT008', 50000, 5.5),
('TKGT009', 50000, 5.5),
('TKGT010', 50000, 5.5);

-- 5. Phân loại Tài khoản Tín Dụng (Khởi tạo dư nợ = 0, các giao dịch sẽ tự cộng dồn)
INSERT INTO public.tk_tin_dung (stk, han_muc_tin_dung, du_no_hien_tai) VALUES
('TKTD001', 100000000, 0),
('TKTD002', 50000000, 0),
('TKTD003', 200000000, 0),
('TKTD004', 30000000, 0),
('TKTD005', 150000000, 0),
('TKTD006', 80000000, 0),
('TKTD007', 50000000, 0),
('TKTD008', 250000000, 0),
('TKTD009', 40000000, 0),
('TKTD010', 60000000, 0);

-- 6. Lịch sử Mở Tài Khoản
INSERT INTO public.mo_tai_khoan (ma_mo_tk, ngay_mo_tk, ma_kh, stk, ma_nv) VALUES
(1, CURRENT_TIMESTAMP - INTERVAL '10 days', 1, 'TKGT001', 2),
(2, CURRENT_TIMESTAMP - INTERVAL '9 days', 2, 'TKGT002', 2),
(3, CURRENT_TIMESTAMP - INTERVAL '8 days', 3, 'TKGT003', 4),
(4, CURRENT_TIMESTAMP - INTERVAL '7 days', 4, 'TKGT004', 8),
(5, CURRENT_TIMESTAMP - INTERVAL '6 days', 5, 'TKGT005', 4),
(6, CURRENT_TIMESTAMP - INTERVAL '5 days', 1, 'TKTD001', 2),
(7, CURRENT_TIMESTAMP - INTERVAL '4 days', 3, 'TKTD002', 4),
(8, CURRENT_TIMESTAMP - INTERVAL '3 days', 6, 'TKTD003', 8),
(9, CURRENT_TIMESTAMP - INTERVAL '2 days', 7, 'TKTD004', 2),
(10, CURRENT_TIMESTAMP - INTERVAL '1 days', 8, 'TKTD005', 4);

-- 7. Lịch sử Giao Dịch Gửi Tiền (Mô phỏng Nạp rút)
INSERT INTO public.gd_gui_tien (ma_gd, loai_gd, so_tien, noi_dung, thoi_gian, so_du_sau_gd, stk, ma_nv) VALUES (1, 'Nạp tiền mặt', 50000000, 'Nạp lương', '2024-04-10 09:00:00', 50000000, 'TKGT001', 3);
INSERT INTO public.gd_gui_tien (ma_gd, loai_gd, so_tien, noi_dung, thoi_gian, so_du_sau_gd, stk, ma_nv) VALUES (2, 'Rút tiền mặt', 10000000, 'Rút tiêu dùng', '2024-04-12 10:30:00', 40000000, 'TKGT001', 3);
INSERT INTO public.gd_gui_tien (ma_gd, loai_gd, so_tien, noi_dung, thoi_gian, so_du_sau_gd, stk, ma_nv) VALUES (3, 'Chuyển khoản đến', 120000000, 'Nhận tiền bán đất', '2024-04-14 14:15:00', 120000000, 'TKGT002', 6);
INSERT INTO public.gd_gui_tien (ma_gd, loai_gd, so_tien, noi_dung, thoi_gian, so_du_sau_gd, stk, ma_nv) VALUES (4, 'Nạp tiền mặt', 4500000, 'Sinh hoạt phí', '2024-04-15 08:45:00', 4500000, 'TKGT003', 7);
INSERT INTO public.gd_gui_tien (ma_gd, loai_gd, so_tien, noi_dung, thoi_gian, so_du_sau_gd, stk, ma_nv) VALUES (5, 'Nạp tiền mặt', 800000000, 'Tiền đầu tư', '2024-04-16 11:20:00', 800000000, 'TKGT004', 10);

-- 8. Lịch sử Giao Dịch Tín Dụng (Chi tiêu)
-- Do Postgres trigger AFTER chay o cuoi statement, ta can tach roi cac INSERT cho cung 1 tai khoan de tinh dung SO_DU_SAU_GD ban dau.
INSERT INTO public.gd_tin_dung (ma_gd, loai_gd, stk, so_tien, noi_dung, thoi_gian, du_no_sau_gd, ma_nv) VALUES (1, 'Thanh toán POS', 'TKTD001', 5000000, 'Mua hàng siêu thị', '2024-04-10 18:30:00', 5000000, 3);
INSERT INTO public.gd_tin_dung (ma_gd, loai_gd, stk, so_tien, noi_dung, thoi_gian, du_no_sau_gd, ma_nv) VALUES (2, 'Thanh toán Online', 'TKTD001', 10000000, 'Mua vé máy bay', '2024-04-11 20:15:00', 15000000, 3);
INSERT INTO public.gd_tin_dung (ma_gd, loai_gd, stk, so_tien, noi_dung, thoi_gian, du_no_sau_gd, ma_nv) VALUES (3, 'Thanh toán POS', 'TKTD002', 45000000, 'Mua điện thoại', '2024-04-12 14:00:00', 45000000, 6);
INSERT INTO public.gd_tin_dung (ma_gd, loai_gd, stk, so_tien, noi_dung, thoi_gian, du_no_sau_gd, ma_nv) VALUES (4, 'Thanh toán Online', 'TKTD004', 12000000, 'Thanh toán quảng cáo', '2024-04-13 16:45:00', 12000000, 7);
INSERT INTO public.gd_tin_dung (ma_gd, loai_gd, stk, so_tien, noi_dung, thoi_gian, du_no_sau_gd, ma_nv) VALUES (5, 'Thanh toán POS', 'TKTD005', 75000000, 'Sắm tivi, tủ lạnh', '2024-04-14 10:20:00', 75000000, 10);

-- 9. Lịch sử Thanh Toán Tín Dụng (KH lấy số dư trả nợ)
INSERT INTO public.thanh_toan_tin_dung (ma_tt, thoi_gian, so_tien, ma_nv, stk_tin_dung, stk_gui_tien) VALUES
(1, '2024-04-15 09:00:00', 5000000, 3, 'TKTD001', 'TKGT001');

-- (Vì giao dịch Thanh_toan_tin_dung giả định có Trigger sẽ update số dư tài khoản tự động, do script này chèn trực tiếp nên ta không cần chạy trừ tiền lại, bảng tai_khoan đã được set số cuối cùng. Nếu trigger của bạn ngăn chặn việc chèn hoặc yêu cầu logic rườm rà, Supabase có thể báo lỗi Trigger. Bạn có thể vô hiệu hóa Trigger nếu cần thiết.)
