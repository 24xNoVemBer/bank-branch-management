-- =====================================================
-- PostgreSQL / Supabase version
-- Banking Schema with Transaction Views & Integrity Triggers
-- =====================================================

-- Náº¿u muá»‘n reset hoÃ n toÃ n schema cÅ© thÃ¬ má»Ÿ dÃ²ng dÆ°á»›i:
-- DROP SCHEMA IF EXISTS mydb CASCADE;

CREATE SCHEMA IF NOT EXISTS mydb;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.khach_hang (
    ma_kh INT PRIMARY KEY,
    cmt VARCHAR(15) UNIQUE,
    ten VARCHAR(45),
    dob DATE,
    dia_chi VARCHAR(45)
);

CREATE TABLE IF NOT EXISTS public.nhan_vien (
    ma_nv INT PRIMARY KEY,
    cmt VARCHAR(15) UNIQUE,
    ten VARCHAR(45),
    dob DATE,
    dia_chi VARCHAR(45),
    vi_tri VARCHAR(45),
    bac_nghe VARCHAR(45),
    tham_nien INT
);

CREATE TABLE IF NOT EXISTS public.tai_khoan (
    stk VARCHAR(45) PRIMARY KEY,
    so_du NUMERIC(18,2) NOT NULL DEFAULT 0,
    ma_kh INT NOT NULL,
    CONSTRAINT fk_tai_khoan_khach_hang
        FOREIGN KEY (ma_kh)
        REFERENCES public.khach_hang (ma_kh)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.mo_tai_khoan (
    ma_mo_tk INT PRIMARY KEY,
    ngay_mo_tk TIMESTAMP,
    ma_kh INT NOT NULL,
    stk VARCHAR(45) NOT NULL UNIQUE,
    ma_nv INT NOT NULL,
    CONSTRAINT fk_mo_tai_khoan_khach_hang
        FOREIGN KEY (ma_kh)
        REFERENCES public.khach_hang (ma_kh)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT fk_mo_tai_khoan_tai_khoan
        FOREIGN KEY (stk)
        REFERENCES public.tai_khoan (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT fk_mo_tai_khoan_nhan_vien
        FOREIGN KEY (ma_nv)
        REFERENCES public.nhan_vien (ma_nv)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.tk_tin_dung (
    stk VARCHAR(45) PRIMARY KEY,
    han_muc_tin_dung NUMERIC(18,2) NOT NULL,
    du_no_hien_tai NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_tk_tin_dung_tai_khoan
        FOREIGN KEY (stk)
        REFERENCES public.tai_khoan (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.tk_gui_tien (
    stk VARCHAR(45) PRIMARY KEY,
    so_du_toi_thieu NUMERIC(18,2) NOT NULL,
    lai_suat_hang_thang NUMERIC(5,2),
    CONSTRAINT fk_tk_gui_tien_tai_khoan
        FOREIGN KEY (stk)
        REFERENCES public.tai_khoan (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.gd_tin_dung (
    ma_gd INT PRIMARY KEY,
    loai_gd VARCHAR(45),
    stk VARCHAR(45) NOT NULL,
    so_tien NUMERIC(18,2) NOT NULL,
    noi_dung VARCHAR(255),
    thoi_gian TIMESTAMP,
    du_no_sau_gd NUMERIC(18,2),
    ma_nv INT,
    CONSTRAINT fk_gd_tin_dung_tk_tin_dung
        FOREIGN KEY (stk)
        REFERENCES public.tk_tin_dung (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT fk_gd_tin_dung_nhan_vien
        FOREIGN KEY (ma_nv)
        REFERENCES public.nhan_vien (ma_nv)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.gd_gui_tien (
    ma_gd INT PRIMARY KEY,
    loai_gd VARCHAR(45),
    so_tien NUMERIC(18,2) NOT NULL,
    noi_dung VARCHAR(255),
    thoi_gian TIMESTAMP,
    so_du_sau_gd NUMERIC(18,2),
    stk VARCHAR(45) NOT NULL,
    ma_nv INT,
    CONSTRAINT fk_gd_gui_tien_tk_gui_tien
        FOREIGN KEY (stk)
        REFERENCES public.tk_gui_tien (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT fk_gd_gui_tien_nhan_vien
        FOREIGN KEY (ma_nv)
        REFERENCES public.nhan_vien (ma_nv)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.thanh_toan_tin_dung (
    ma_tt INT PRIMARY KEY,
    thoi_gian TIMESTAMP,
    so_tien NUMERIC(18,2) NOT NULL,
    ma_nv INT,
    stk_tin_dung VARCHAR(45) NOT NULL,
    stk_gui_tien VARCHAR(45) NOT NULL,
    CONSTRAINT fk_thanh_toan_tin_dung_nhan_vien
        FOREIGN KEY (ma_nv)
        REFERENCES public.nhan_vien (ma_nv)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT fk_thanh_toan_tin_dung_tk_tin_dung
        FOREIGN KEY (stk_tin_dung)
        REFERENCES public.tk_tin_dung (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT fk_thanh_toan_tin_dung_tk_gui_tien
        FOREIGN KEY (stk_gui_tien)
        REFERENCES public.tk_gui_tien (stk)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tai_khoan_ma_kh
    ON public.tai_khoan(ma_kh);

CREATE INDEX IF NOT EXISTS idx_mo_tai_khoan_ma_kh
    ON public.mo_tai_khoan(ma_kh);

CREATE INDEX IF NOT EXISTS idx_mo_tai_khoan_ma_nv
    ON public.mo_tai_khoan(ma_nv);

CREATE INDEX IF NOT EXISTS idx_gd_tin_dung_stk
    ON public.gd_tin_dung(stk);

CREATE INDEX IF NOT EXISTS idx_gd_tin_dung_ma_nv
    ON public.gd_tin_dung(ma_nv);

CREATE INDEX IF NOT EXISTS idx_gd_gui_tien_stk
    ON public.gd_gui_tien(stk);

CREATE INDEX IF NOT EXISTS idx_gd_gui_tien_ma_nv
    ON public.gd_gui_tien(ma_nv);

CREATE INDEX IF NOT EXISTS idx_thanh_toan_tin_dung_ma_nv
    ON public.thanh_toan_tin_dung(ma_nv);

CREATE INDEX IF NOT EXISTS idx_thanh_toan_tin_dung_stk_tin_dung
    ON public.thanh_toan_tin_dung(stk_tin_dung);

CREATE INDEX IF NOT EXISTS idx_thanh_toan_tin_dung_stk_gui_tien
    ON public.thanh_toan_tin_dung(stk_gui_tien);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- 1. Kiá»ƒm tra má»Ÿ tÃ i khoáº£n
CREATE OR REPLACE FUNCTION public.fn_mo_tai_khoan_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_vi_tri_nv VARCHAR(45);
    v_ma_kh_tai_khoan INT;
BEGIN
    SELECT vi_tri
    INTO v_vi_tri_nv
    FROM public.nhan_vien
    WHERE ma_nv = NEW.ma_nv;

    IF v_vi_tri_nv IS NULL
       OR (v_vi_tri_nv <> 'Nhân viên kinh doanh'
           AND v_vi_tri_nv <> 'Kinh doanh'
           AND v_vi_tri_nv <> 'Quan ly'
           AND v_vi_tri_nv <> 'Quản lý'
           AND v_vi_tri_nv <> 'Quáº£n lÃ½') THEN
        RAISE EXCEPTION 'Chi nhan vien kinh doanh hoac quan ly moi duoc mo tai khoan';
    END IF;

    SELECT ma_kh
    INTO v_ma_kh_tai_khoan
    FROM public.tai_khoan
    WHERE stk = NEW.stk;

    IF v_ma_kh_tai_khoan IS NULL THEN
        RAISE EXCEPTION 'STK khong ton tai trong TAI_KHOAN';
    END IF;

    IF v_ma_kh_tai_khoan <> NEW.ma_kh THEN
        RAISE EXCEPTION 'MA_KH trong MO_TAI_KHOAN khong khop chu tai khoan';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mo_tai_khoan_before_insert ON public.mo_tai_khoan;
CREATE TRIGGER mo_tai_khoan_before_insert
BEFORE INSERT ON public.mo_tai_khoan
FOR EACH ROW
EXECUTE FUNCTION public.fn_mo_tai_khoan_before_insert();

-- 2. Kiá»ƒm tra tÃ i khoáº£n tÃ­n dá»¥ng
CREATE OR REPLACE FUNCTION public.fn_tk_tin_dung_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_ma_kh INT;
    v_count_tk_tin_dung INT;
    v_exists_tk_gui_tien INT;
BEGIN
    SELECT ma_kh
    INTO v_ma_kh
    FROM public.tai_khoan
    WHERE stk = NEW.stk;

    IF v_ma_kh IS NULL THEN
        RAISE EXCEPTION 'STK khong ton tai trong TAI_KHOAN';
    END IF;

    SELECT COUNT(*)
    INTO v_exists_tk_gui_tien
    FROM public.tk_gui_tien
    WHERE stk = NEW.stk;

    IF v_exists_tk_gui_tien > 0 THEN
        RAISE EXCEPTION 'Mot STK khong the vua la TK_TIN_DUNG vua la TK_GUI_TIEN';
    END IF;

    SELECT COUNT(*)
    INTO v_count_tk_tin_dung
    FROM public.tk_tin_dung td
    JOIN public.tai_khoan tk ON td.stk = tk.stk
    WHERE tk.ma_kh = v_ma_kh;

    IF v_count_tk_tin_dung >= 2 THEN
        RAISE EXCEPTION 'Moi khach hang chi duoc mo toi da 2 tai khoan tin dung';
    END IF;

    IF NEW.du_no_hien_tai > NEW.han_muc_tin_dung THEN
        RAISE EXCEPTION 'DU_NO_HIEN_TAI khong duoc vuot HAN_MUC_TIN_DUNG';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tk_tin_dung_before_insert ON public.tk_tin_dung;
CREATE TRIGGER tk_tin_dung_before_insert
BEFORE INSERT ON public.tk_tin_dung
FOR EACH ROW
EXECUTE FUNCTION public.fn_tk_tin_dung_before_insert();

-- 3. Kiá»ƒm tra tÃ i khoáº£n gá»­i tiá»n
CREATE OR REPLACE FUNCTION public.fn_tk_gui_tien_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_ma_kh INT;
    v_count_tk_gui_tien INT;
    v_exists_tk_tin_dung INT;
BEGIN
    SELECT ma_kh
    INTO v_ma_kh
    FROM public.tai_khoan
    WHERE stk = NEW.stk;

    IF v_ma_kh IS NULL THEN
        RAISE EXCEPTION 'STK khong ton tai trong TAI_KHOAN';
    END IF;

    SELECT COUNT(*)
    INTO v_exists_tk_tin_dung
    FROM public.tk_tin_dung
    WHERE stk = NEW.stk;

    IF v_exists_tk_tin_dung > 0 THEN
        RAISE EXCEPTION 'Mot STK khong the vua la TK_GUI_TIEN vua la TK_TIN_DUNG';
    END IF;

    SELECT COUNT(*)
    INTO v_count_tk_gui_tien
    FROM public.tk_gui_tien gt
    JOIN public.tai_khoan tk ON gt.stk = tk.stk
    WHERE tk.ma_kh = v_ma_kh;

    IF v_count_tk_gui_tien >= 3 THEN
        RAISE EXCEPTION 'Moi khach hang chi duoc mo toi da 3 tai khoan gui tien';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tk_gui_tien_before_insert ON public.tk_gui_tien;
CREATE TRIGGER tk_gui_tien_before_insert
BEFORE INSERT ON public.tk_gui_tien
FOR EACH ROW
EXECUTE FUNCTION public.fn_tk_gui_tien_before_insert();

-- 4. Kiá»ƒm tra giao dá»‹ch tÃ­n dá»¥ng trÆ°á»›c insert
CREATE OR REPLACE FUNCTION public.fn_gd_tin_dung_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_du_no_hien_tai NUMERIC(18,2);
    v_han_muc_tin_dung NUMERIC(18,2);
    v_du_no_moi NUMERIC(18,2);
BEGIN
    SELECT du_no_hien_tai, han_muc_tin_dung
    INTO v_du_no_hien_tai, v_han_muc_tin_dung
    FROM public.tk_tin_dung
    WHERE stk = NEW.stk;

    IF v_du_no_hien_tai IS NULL THEN
        RAISE EXCEPTION 'Tai khoan tin dung khong ton tai';
    END IF;

    v_du_no_moi := v_du_no_hien_tai + NEW.so_tien;

    IF v_du_no_moi > v_han_muc_tin_dung THEN
        RAISE EXCEPTION 'Giao dich lam vuot han muc tin dung';
    END IF;

    IF NEW.du_no_sau_gd IS NOT NULL AND NEW.du_no_sau_gd <> v_du_no_moi THEN
        RAISE EXCEPTION 'DU_NO_SAU_GD khong hop le';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gd_tin_dung_before_insert ON public.gd_tin_dung;
CREATE TRIGGER gd_tin_dung_before_insert
BEFORE INSERT ON public.gd_tin_dung
FOR EACH ROW
EXECUTE FUNCTION public.fn_gd_tin_dung_before_insert();

-- 5. Cáº­p nháº­t dÆ° ná»£ sau insert giao dá»‹ch tÃ­n dá»¥ng
CREATE OR REPLACE FUNCTION public.fn_gd_tin_dung_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.tk_tin_dung
    SET du_no_hien_tai = du_no_hien_tai + NEW.so_tien
    WHERE stk = NEW.stk;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gd_tin_dung_after_insert ON public.gd_tin_dung;
CREATE TRIGGER gd_tin_dung_after_insert
AFTER INSERT ON public.gd_tin_dung
FOR EACH ROW
EXECUTE FUNCTION public.fn_gd_tin_dung_after_insert();

-- 6. Kiá»ƒm tra thanh toÃ¡n tÃ­n dá»¥ng trÆ°á»›c insert
CREATE OR REPLACE FUNCTION public.fn_thanh_toan_tin_dung_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_so_du_tai_khoan NUMERIC(18,2);
    v_so_du_toi_thieu NUMERIC(18,2);
    v_du_no_hien_tai NUMERIC(18,2);
    v_so_du_moi NUMERIC(18,2);
BEGIN
    SELECT tk.so_du, gt.so_du_toi_thieu
    INTO v_so_du_tai_khoan, v_so_du_toi_thieu
    FROM public.tai_khoan tk
    JOIN public.tk_gui_tien gt ON tk.stk = gt.stk
    WHERE gt.stk = NEW.stk_gui_tien;

    IF v_so_du_tai_khoan IS NULL THEN
        RAISE EXCEPTION 'Tai khoan gui tien khong ton tai';
    END IF;

    SELECT du_no_hien_tai
    INTO v_du_no_hien_tai
    FROM public.tk_tin_dung
    WHERE stk = NEW.stk_tin_dung;

    IF v_du_no_hien_tai IS NULL THEN
        RAISE EXCEPTION 'Tai khoan tin dung khong ton tai';
    END IF;

    v_so_du_moi := v_so_du_tai_khoan - NEW.so_tien;

    IF v_so_du_moi < v_so_du_toi_thieu THEN
        RAISE EXCEPTION 'So du sau thanh toan nho hon so du toi thieu';
    END IF;

    IF NEW.so_tien > v_du_no_hien_tai THEN
        RAISE EXCEPTION 'So tien thanh toan vuot qua du no hien tai';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS thanh_toan_tin_dung_before_insert ON public.thanh_toan_tin_dung;
CREATE TRIGGER thanh_toan_tin_dung_before_insert
BEFORE INSERT ON public.thanh_toan_tin_dung
FOR EACH ROW
EXECUTE FUNCTION public.fn_thanh_toan_tin_dung_before_insert();

-- 7. Cáº­p nháº­t sá»‘ dÆ° vÃ  dÆ° ná»£ sau thanh toÃ¡n tÃ­n dá»¥ng
CREATE OR REPLACE FUNCTION public.fn_thanh_toan_tin_dung_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.tai_khoan
    SET so_du = so_du - NEW.so_tien
    WHERE stk = NEW.stk_gui_tien;

    UPDATE public.tk_tin_dung
    SET du_no_hien_tai = du_no_hien_tai - NEW.so_tien
    WHERE stk = NEW.stk_tin_dung;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS thanh_toan_tin_dung_after_insert ON public.thanh_toan_tin_dung;
CREATE TRIGGER thanh_toan_tin_dung_after_insert
AFTER INSERT ON public.thanh_toan_tin_dung
FOR EACH ROW
EXECUTE FUNCTION public.fn_thanh_toan_tin_dung_after_insert();

-- =====================================================
-- VIEWS
-- =====================================================

-- View 1: Thá»‘ng kÃª thÆ°á»Ÿng nhÃ¢n viÃªn trong thÃ¡ng hiá»‡n táº¡i
CREATE OR REPLACE VIEW public.view_tinh_luong_thang_nay AS
SELECT
    nv.ma_nv AS ma_nv,
    nv.ten AS ten_nhan_vien,
    COALESCE(COUNT(DISTINCT td.stk), 0) AS so_tk_tin_dung_mo,
    COALESCE(COUNT(DISTINCT gt.stk), 0) AS so_tk_gui_tien_mo,
    ROUND((COALESCE(COUNT(DISTINCT td.stk), 0) * 500000)::numeric, 2) AS thuong_tin_dung,
    ROUND((COALESCE(COUNT(DISTINCT gt.stk), 0) * 300000)::numeric, 2) AS thuong_gui_tien,
    ROUND((
        COALESCE(COUNT(DISTINCT td.stk), 0) * 500000 +
        COALESCE(COUNT(DISTINCT gt.stk), 0) * 300000
    )::numeric, 2) AS tong_thuong_thang
FROM public.nhan_vien nv
LEFT JOIN public.mo_tai_khoan mtk
    ON nv.ma_nv = mtk.ma_nv
   AND date_trunc('month', mtk.ngay_mo_tk) = date_trunc('month', CURRENT_DATE)
LEFT JOIN public.tk_tin_dung td ON mtk.stk = td.stk
LEFT JOIN public.tk_gui_tien gt ON mtk.stk = gt.stk
WHERE nv.vi_tri IN ('Kinh doanh', 'NhÃ¢n viÃªn kinh doanh', 'Quan ly', 'Quáº£n lÃ½')
GROUP BY nv.ma_nv, nv.ten
HAVING COUNT(DISTINCT td.stk) + COUNT(DISTINCT gt.stk) > 0;

-- View 2: Lá»‹ch sá»­ giao dá»‹ch tÃ­n dá»¥ng
CREATE OR REPLACE VIEW public.view_lich_su_tin_dung AS
SELECT
    gd.ma_gd AS ma_gd,
    gd.loai_gd AS loai_gd,
    gd.stk AS tai_khoan_tin_dung,
    gd.so_tien AS so_tien,
    gd.noi_dung AS noi_dung,
    gd.thoi_gian AS thoi_gian,
    gd.du_no_sau_gd AS du_no_sau_gd,
    kh.ma_kh AS ma_kh,
    kh.ten AS ten_khach_hang,
    nv.ten AS ten_nhan_vien
FROM public.gd_tin_dung gd
LEFT JOIN public.tai_khoan tk ON gd.stk = tk.stk
LEFT JOIN public.khach_hang kh ON tk.ma_kh = kh.ma_kh
LEFT JOIN public.nhan_vien nv ON gd.ma_nv = nv.ma_nv;

-- View 3: Danh sÃ¡ch dÆ° ná»£ tÃ­n dá»¥ng
CREATE OR REPLACE VIEW public.view_no_tin_dung AS
SELECT
    td.stk AS so_tai_khoan,
    kh.ma_kh AS ma_kh,
    kh.ten AS ten_khach_hang,
    td.han_muc_tin_dung AS han_muc_tin_dung,
    td.du_no_hien_tai AS du_no_hien_tai
FROM public.tk_tin_dung td
LEFT JOIN public.tai_khoan tk ON td.stk = tk.stk
LEFT JOIN public.khach_hang kh ON tk.ma_kh = kh.ma_kh
WHERE td.du_no_hien_tai > 0
ORDER BY td.du_no_hien_tai DESC;

-- View 4: Top 10 khÃ¡ch hÃ ng gá»­i tiá»n nhiá»u nháº¥t
CREATE OR REPLACE VIEW public.view_top_10_khach_hang AS
SELECT
    kh.ma_kh AS ma_kh,
    kh.ten AS ten_khach_hang,
    SUM(tk.so_du) AS tong_tien_dang_gui
FROM public.khach_hang kh
JOIN public.tai_khoan tk ON kh.ma_kh = tk.ma_kh
JOIN public.tk_gui_tien gt ON tk.stk = gt.stk
GROUP BY kh.ma_kh, kh.ten
ORDER BY tong_tien_dang_gui DESC
LIMIT 10;
