const express = require("express");
const cors = require("cors");
const supabase = require("./supabase"); // Kết nối tới file supabase.js của bạn

const app = express();
const PORT = 8080; // ĐÃ KHAI BÁO CỔNG TẠI ĐÂY ĐỂ FIX LỖI

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Ngân hàng đang chạy mượt mà!");
});

// ==========================================
// NHÓM 1: QUẢN LÝ KHÁCH HÀNG (CRUD)
// ==========================================
app.get("/khachhang", async (req, res) => {
  const { data, error } = await supabase.from("khach_hang").select('*').order('ma_kh', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/khachhang", async (req, res) => {
  const { ma_kh, cmt, ten, dob, dia_chi } = req.body;
  const { data, error } = await supabase.from("khach_hang").insert([{ ma_kh: Number(ma_kh), cmt, ten, dob, dia_chi }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Thêm thành công!", data });
});

app.put("/khachhang/:id", async (req, res) => {
  const { data, error } = await supabase.from("khach_hang").update(req.body).eq("ma_kh", Number(req.params.id)).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Cập nhật thành công!", data });
});

app.delete("/khachhang/:id", async (req, res) => {
  const { error } = await supabase.from("khach_hang").delete().eq("ma_kh", Number(req.params.id));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Xóa thành công!" });
});

// ==========================================
// NHÓM 2: QUẢN LÝ NHÂN VIÊN (CRUD)
// ==========================================
app.get("/nhanvien", async (req, res) => {
  const { data, error } = await supabase.from("nhan_vien").select('*').order('ma_nv', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/nhanvien", async (req, res) => {
  const payload = { ...req.body, ma_nv: req.body.ma_nv ? Number(req.body.ma_nv) : undefined };
  const { data, error } = await supabase.from("nhan_vien").insert([payload]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: "Thêm thành công!", data });
});

app.put("/nhanvien/:id", async (req, res) => {
  const { data, error } = await supabase.from("nhan_vien").update(req.body).eq("ma_nv", Number(req.params.id)).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Cập nhật thành công!", data });
});

app.delete("/nhanvien/:id", async (req, res) => {
  const { error } = await supabase.from("nhan_vien").delete().eq("ma_nv", Number(req.params.id));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Xóa thành công!" });
});

// ======================================================================
// NHÓM 3: NGHIỆP VỤ MỞ TÀI KHOẢN MỚI (ĐÃ TÍCH HỢP FULL RÀNG BUỘC)
// ======================================================================
app.post("/taotaikhoan", async (req, res) => {
  const { ma_kh, ma_nv, loai_tk, so_tien, lai_suat, so_du_toi_thieu } = req.body;

  try {
    // ---------------------------------------------------------
    // RÀNG BUỘC 1: CHỈ NHÂN VIÊN KINH DOANH MỚI ĐƯỢC MỞ THẺ
    // ---------------------------------------------------------
    const { data: nvData, error: nvError } = await supabase
      .from('nhan_vien')
      .select('vi_tri')
      .eq('ma_nv', Number(ma_nv))
      .single();

    if (nvError || !nvData) throw new Error("Không tìm thấy mã nhân viên hỗ trợ!");
    
    // Loại bỏ dấu cách thừa và chuyển chữ thường để so sánh
    const viTri = (nvData.vi_tri || '').toLowerCase().trim();
    if (!viTri.includes('kinh doanh') && !viTri.includes('quản lý') && !viTri.includes('quan ly')) {
       throw new Error("Từ chối: Chỉ Nhân viên kinh doanh hoặc Quản lý mới có quyền duyệt hồ sơ mở tài khoản!");
    }

    // ---------------------------------------------------------
    // RÀNG BUỘC 2: TỐI ĐA 3 TÀI KHOẢN GỬI TIỀN, 2 TÀI KHOẢN TÍN DỤNG
    // ---------------------------------------------------------
    const { data: tkData } = await supabase.from('tai_khoan').select('stk').eq('ma_kh', Number(ma_kh));
    const stks = tkData && tkData.length > 0 ? tkData.map(t => t.stk) : [];

    let countGuiTien = 0; 
    let countTinDung = 0;

    if (stks.length > 0) {
      const { data: gtData } = await supabase.from('tk_gui_tien').select('stk').in('stk', stks);
      countGuiTien = gtData ? gtData.length : 0;
      
      const { data: tdData } = await supabase.from('tk_tin_dung').select('stk').in('stk', stks);
      countTinDung = tdData ? tdData.length : 0;
    }

    if (loai_tk === 'savings' && countGuiTien >= 3) {
       throw new Error("Từ chối: Khách hàng này đã mở tối đa 3 tài khoản gửi tiền.");
    }
    if (loai_tk !== 'savings' && countTinDung >= 2) {
       throw new Error("Từ chối: Khách hàng này đã mở tối đa 2 tài khoản tín dụng.");
    }

    // ---------------------------------------------------------
    // THỰC THI TẠO TÀI KHOẢN SAU KHI QUA CÁC BƯỚC KIỂM TRA
    // ---------------------------------------------------------
    const prefix = loai_tk === 'savings' ? '1000' : 'TD00';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const stk = prefix + randomNum;

    // 1. Thêm vào bảng TAI_KHOAN gốc
    const { error: err1 } = await supabase.from('tai_khoan').insert([{ 
      stk: stk, 
      so_du: loai_tk === 'savings' ? so_tien : 0, 
      ma_kh: Number(ma_kh) 
    }]);
    if (err1) throw err1;

    // 2. Thêm vào bảng chi tiết
    if (loai_tk === 'savings') {
      const { error: err2 } = await supabase.from('tk_gui_tien').insert([{ 
        stk: stk, 
        so_du_toi_thieu: so_du_toi_thieu || 50000, 
        lai_suat_hang_thang: lai_suat || 0 
      }]);
      if (err2) throw err2;
    } else {
      const { error: err3 } = await supabase.from('tk_tin_dung').insert([{ 
        stk: stk, 
        han_muc_tin_dung: so_tien, 
        du_no_hien_tai: 0 
      }]);
      if (err3) throw err3;
    }

    // 3. Ghi vào bảng MO_TAI_KHOAN (Lịch sử)
    const { data: mtks } = await supabase.from('mo_tai_khoan').select('ma_mo_tk').order('ma_mo_tk', { ascending: false }).limit(1);
    const nextMaMoTk = mtks && mtks.length > 0 ? mtks[0].ma_mo_tk + 1 : 1;

    const { error: err4 } = await supabase.from('mo_tai_khoan').insert([{ 
      ma_mo_tk: nextMaMoTk,
      ngay_mo_tk: new Date().toISOString(), 
      ma_kh: Number(ma_kh), 
      stk: stk, 
      ma_nv: Number(ma_nv) 
    }]);
    if (err4) throw err4;

    res.json({ message: "Tạo tài khoản thành công!", stk: stk });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// NHÓM 4: CÁC NGHIỆP VỤ NÂNG CAO (VIEWS & RPC)
// ==========================================

// Báo cáo 1: Tính lương nhân viên kinh doanh
app.get("/api/baocao/tinhluong", async (req, res) => {
  const { data, error } = await supabase.from('view_tinh_luong_thang_nay').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Báo cáo 1b: Tải CSV Tính lương nhân viên kinh doanh
app.get("/api/baocao/tinhluong/csv", async (req, res) => {
  const { data, error } = await supabase.from('view_tinh_luong_thang_nay').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Không có dữ liệu" });
  }

  const headers = ["Mã NV", "Tên Nhân Viên", "Thưởng Tín Dụng (VND)", "Thưởng Gửi Tiền (VND)", "Tổng Thưởng (VND)"];
  let csvContent = headers.join(",") + "\n";

  data.forEach(item => {
    const ma_nv = `NV${String(item.ma_nv || item.MA_NV).padStart(3, '0')}`;
    const ten = `"${item.ten_nhan_vien || item.ten || item.TEN_NHAN_VIEN}"`;
    const thuong_td = item.thuong_tin_dung || item.THUONG_TIN_DUNG || 0;
    const thuong_gt = item.thuong_gui_tien || item.THUONG_GUI_TIEN || 0;
    const tong_thuong = item.tong_thuong_thang || item.TONG_THUONG_THANG || 0;
    
    csvContent += `${ma_nv},${ten},${thuong_td},${thuong_gt},${tong_thuong}\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=Bang_Luong_Nhan_Vien.csv');
  res.send('\uFEFF' + csvContent);
});

// Báo cáo 2: Liệt kê giao dịch tín dụng
app.get("/api/baocao/giaodich-tindung", async (req, res) => {
  const { tu_ngay, den_ngay } = req.query;
  let query = supabase.from('view_lich_su_tin_dung').select('*').order('thoi_gian', { ascending: false });
  if (tu_ngay) query = query.gte('thoi_gian', tu_ngay);
  if (den_ngay) query = query.lte('thoi_gian', den_ngay);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Báo cáo 3: Danh sách nợ tín dụng tồn đọng
app.get("/api/baocao/no-tin-dung", async (req, res) => {
  const { data, error } = await supabase.from('view_no_tin_dung').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Báo cáo 4: Top 10 khách hàng gửi tiền nhiều nhất
app.get("/api/baocao/top-khach-hang", async (req, res) => {
  const { data, error } = await supabase.from('view_top_10_khach_hang').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Nghiệp vụ 5: Giao dịch thanh toán nợ thẻ tín dụng
// FIX CONFLICT 2: Thay RPC không tồn tại bằng insert trực tiếp vào THANH_TOAN_TIN_DUNG
// Triggers bi_thanh_toan_tin_dung_check và ai_thanh_toan_tin_dung_update sẽ tự xử lý
app.post("/api/giaodich/thanhtoan-the", async (req, res) => {
  const { stk_gui, stk_tin_dung, so_tien, ma_nv } = req.body;
  
  if (!stk_gui || !stk_tin_dung || !so_tien) {
    return res.status(400).json({ error: "Thiếu thông tin: stk_gui, stk_tin_dung và so_tien là bắt buộc!" });
  }

  try {
    // Lấy MA_TT mới nhất
    const { data: ttRows } = await supabase
      .from('thanh_toan_tin_dung')
      .select('ma_tt')
      .order('ma_tt', { ascending: false })
      .limit(1);
    const nextMaTT = ttRows && ttRows.length > 0 ? ttRows[0].ma_tt + 1 : 1;

    // Insert vào THANH_TOAN_TIN_DUNG
    // Trigger bi_thanh_toan_tin_dung_check sẽ kiểm tra hợp lệ
    // Trigger ai_thanh_toan_tin_dung_update sẽ cập nhật SO_DU và DU_NO_HIEN_TAI
    const { error } = await supabase.from('thanh_toan_tin_dung').insert([{
      ma_tt: nextMaTT,
      thoi_gian: new Date().toISOString(),
      so_tien: so_tien,
      ma_nv: ma_nv ? Number(ma_nv) : null,
      stk_tin_dung: stk_tin_dung,
      stk_gui_tien: stk_gui
    }]);

    if (error) throw error;
    res.json({ message: "Thanh toán nợ tín dụng thành công!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// ==========================================
// NHÓM 5: API DÀNH RIÊNG CHO TRANG GIAO DỊCH
// ==========================================

// 5.1 API: Lấy danh sách tài khoản theo Mã Khách Hàng (thông tin cơ bản)
app.get("/taikhoan/:ma_kh", async (req, res) => {
  const { data, error } = await supabase
    .from("tai_khoan")
    .select("*")
    .eq("ma_kh", Number(req.params.ma_kh));
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 5.1b API: Lấy danh sách tài khoản kèm chi tiết dư nợ / số dư tối thiểu
// FIX CONFLICT 3: FE cần du_no_hien_tai và han_muc_tin_dung để hiển thị thông tin thẻ tín dụng
app.get("/taikhoan-chitiet/:ma_kh", async (req, res) => {
  try {
    const { data: tkData, error: tkErr } = await supabase
      .from("tai_khoan")
      .select("*")
      .eq("ma_kh", Number(req.params.ma_kh));
    
    if (tkErr) throw tkErr;
    if (!tkData || tkData.length === 0) return res.json([]);

    const stks = tkData.map(t => t.stk);

    const { data: tdData } = await supabase
      .from('tk_tin_dung')
      .select('stk, han_muc_tin_dung, du_no_hien_tai')
      .in('stk', stks);

    const { data: gtData } = await supabase
      .from('tk_gui_tien')
      .select('stk, so_du_toi_thieu, lai_suat_hang_thang')
      .in('stk', stks);

    // Merge dữ liệu: gắn thông tin chi tiết vào từng tài khoản
    const merged = tkData.map(tk => {
      const tdInfo = tdData && tdData.find(t => t.stk === tk.stk);
      const gtInfo = gtData && gtData.find(g => g.stk === tk.stk);
      return {
        ...tk,
        loai_tk: tdInfo ? 'tin_dung' : (gtInfo ? 'gui_tien' : 'khac'),
        han_muc_tin_dung: tdInfo ? tdInfo.han_muc_tin_dung : null,
        du_no_hien_tai: tdInfo ? tdInfo.du_no_hien_tai : null,
        so_du_toi_thieu: gtInfo ? gtInfo.so_du_toi_thieu : null,
        lai_suat_hang_thang: gtInfo ? gtInfo.lai_suat_hang_thang : null
      };
    });

    res.json(merged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5.2 API: Mô phỏng nghiệp vụ Chi tiêu / Quẹt thẻ tín dụng
// FIX CONFLICT 1+6: Xóa bước update du_no_hien_tai thủ công.
// Trigger GD_TIN_DUNG_BEFORE_INSERT sẽ validate, AFTER_INSERT sẽ tự tăng du_no_hien_tai.
// Nếu update thủ công TRƯỚC rồi trigger lại tăng THÊM => dư nợ bị nhân đôi!
app.post("/api/giaodich/chitieu", async (req, res) => {
  const { stk_tin_dung, so_tien, ma_nv } = req.body;
  
  try {
    // Kiểm tra thẻ tín dụng và hạn mức (validation phía BE trước khi đến trigger)
    const { data: tk, error: tkErr } = await supabase
      .from('tk_tin_dung')
      .select('stk, du_no_hien_tai, han_muc_tin_dung')
      .eq('stk', stk_tin_dung)
      .single();
      
    if (tkErr || !tk) throw new Error("Không tìm thấy thẻ tín dụng!");
    if (Number(tk.du_no_hien_tai) + Number(so_tien) > Number(tk.han_muc_tin_dung)) {
      throw new Error("Từ chối: Giao dịch vượt quá hạn mức tín dụng!");
    }
    
    // Tạo ID giao dịch mới
    const { data: gds } = await supabase
      .from('gd_tin_dung')
      .select('ma_gd')
      .order('ma_gd', { ascending: false })
      .limit(1);
    const nextId = gds && gds.length > 0 ? gds[0].ma_gd + 1 : 1;

    // Tính du_no_sau_gd từ giá trị TRƯỚC khi insert (trigger chưa chạy)
    const duNoSauGd = Number(tk.du_no_hien_tai) + Number(so_tien);

    // CHỈ INSERT vào GD_TIN_DUNG - KHÔNG update tk_tin_dung thủ công!
    // Trigger GD_TIN_DUNG_AFTER_INSERT sẽ tự động tăng DU_NO_HIEN_TAI
    const { error: insertErr } = await supabase.from('gd_tin_dung').insert([{
      ma_gd: nextId,
      loai_gd: 'Chi tiêu',
      stk: stk_tin_dung,
      so_tien: so_tien,
      noi_dung: 'Quẹt thẻ mua sắm',
      thoi_gian: new Date().toISOString(),
      du_no_sau_gd: duNoSauGd,
      ma_nv: ma_nv ? Number(ma_nv) : null
    }]);

    if (insertErr) throw insertErr;
    res.json({ message: "Chi tiêu thành công! Đã ghi nhận nợ thẻ." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// ==========================================
// NHÓM 6: THỐNG KÊ TỔNG QUAN (CHO DASHBOARD)
// ==========================================
app.get("/api/thongke/tongquan", async (req, res) => {
  try {
    // 1. Tính tổng tiền đang gửi (Bỏ qua các tài khoản tín dụng bắt đầu bằng 'TD')
    const { data: tkData, error: tkError } = await supabase.from('tai_khoan').select('stk, so_du');
    if (tkError) throw tkError;
    
    let tongTienGui = 0;
    if (tkData) {
      tongTienGui = tkData.reduce((sum, acc) => {
        return !acc.stk.startsWith('TD') ? sum + Number(acc.so_du) : sum;
      }, 0);
    }

    // 2. Đếm số lượng tài khoản được mở trong tháng hiện tại
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const { data: moTkData, error: moTkError } = await supabase.from('mo_tai_khoan').select('ngay_mo_tk');
    if (moTkError) throw moTkError;

    let tkMoi = 0;
    if (moTkData) {
      tkMoi = moTkData.filter(item => {
        const d = new Date(item.ngay_mo_tk);
        return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
      }).length;
    }

    // Trả về dữ liệu cho Frontend
    res.json({ tong_tien_gui: tongTienGui, tk_moi_trong_thang: tkMoi });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 
// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
app.listen(PORT, () => {
  console.log("\n==============================================");
  console.log(`🚀 Server Backend ĐANG CHẠY TẠI CỔNG: http://localhost:${PORT}`);
  console.log("==============================================\n");
});