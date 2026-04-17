const fs = require('fs');

// 1. Update quanly_khach_hang/page.tsx
let qhk = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', 'utf-8');
qhk = qhk.replace('const [customers, setCustomers] = useState(defaultCustomers);', 'const [customers, setCustomers] = useState<any[]>(defaultCustomers);');
fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', qhk, 'utf-8');

// 2. Update giao_dich/page.tsx
let gd = fs.readFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', 'utf-8');
gd = gd.replace(/const \[customers, setCustomers\] = useState<\{MA_KH: number, TEN: string, CMT\?: string\}\[\]>\(\[\]\);/g, 'const [customers, setCustomers] = useState<any[]>([]);');
fs.writeFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', gd, 'utf-8');

// Check quanly_nhan_vien/page.tsx to ensure it still implies any[]
// It should already be useState<any[]>(defaultEmployees) from earlier.
