const fs = require('fs');

let nv = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', 'utf-8');

// The openModal issue
nv = nv.replace(/setFormData\(\{\s*name: employee\.TEN,[\s\S]*?level: employee\.BAC_NGHE \|\| 'Bậc 1'\s*\}\);/,
`setFormData({
                TEN: employee.TEN,
                DOB: employee.DOB || '',
                DIA_CHI: employee.DIA_CHI || '',
                THAM_NIEN: employee.THAM_NIEN ? Number(employee.THAM_NIEN) : 0,
                VI_TRI: employee.VI_TRI || 'Nhân viên kinh doanh',
                BAC_NGHE: employee.BAC_NGHE || 'Bậc 1'
            });`);

fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', nv);

let gd = fs.readFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', 'utf-8');
gd = gd.replace(/c\.id/g, 'c.MA_KH'); // blanket replace just in case
gd = gd.replace(/selectedCustomer\?\.id/g, 'selectedCustomer?.MA_KH');
fs.writeFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', gd);
