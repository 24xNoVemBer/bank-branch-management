const fs = require('fs');

// 1. Fix giao_dich
let gd = fs.readFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', 'utf-8');
gd = gd.replace(/key=\{c\.id\}/g, 'key={c.MA_KH}');
gd = gd.replace(/selectedCustomer\?\.id === c\.id/g, 'selectedCustomer?.MA_KH === c.MA_KH');
gd = gd.replace(/>\{c\.id\} •/g, '>{c.MA_KH} •');
gd = gd.replace(/e\.id/g, 'e.MA_NV');
fs.writeFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', gd);


// 2. Fix quanly_khach_hang
let qh = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', 'utf-8');
qh = qh.replace(/const \{ TEN, value \} = e\.target;/g, 'const { name, value } = e.target;');
qh = qh.replace(/\[TEN\]: value/g, '[name]: value');
// Also check setFormData({ TEN: '', CMT: '', DOB: '', DIA_CHI: '' }) - it's fine! 
fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', qh);


// 3. Fix quanly_nhan_vien
let nv = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', 'utf-8');
// Error: Property 'TEN' does not exist on type '{ name: string; cccd: string; DOB: string; phone: string; DIA_CHI: string; THAM_NIEN: string; VI_TRI: string; BAC_NGHE: string; }'
// It seems the default state formulation missed something.
nv = nv.replace(/setFormData\(\{[\s\S]*?\}\)/g, (match) => {
    if (match.includes("name: ''")) {
        return `setFormData({
                TEN: '',
                DOB: '',
                DIA_CHI: '',
                THAM_NIEN: 0,
                VI_TRI: 'Nhân viên kinh doanh',
                BAC_NGHE: 'Bậc 1'
            })`;
    }
    return match;
});

// Also replace the declaration
nv = nv.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?level: 'Bậc 1'[\s\S]*?\}\);/g, `const [formData, setFormData] = useState({
        TEN: '',
        DOB: '',
        DIA_CHI: '',
        THAM_NIEN: 0,
        VI_TRI: 'Nhân viên kinh doanh',
        BAC_NGHE: 'Bậc 1'
    });`);

nv = nv.replace(/formData\.name/g, 'formData.TEN');

// also handle input change
nv = nv.replace(/const handleInputChange = \(e: React\.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement \| HTMLSelectElement>\) => \{[\s\S]*?\};/g, `const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };`);

// also fix !formData.name 
nv = nv.replace(/!formData\.name\.trim\(\)/g, '!formData.TEN.trim()');


fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', nv);
