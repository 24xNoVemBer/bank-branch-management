const fs = require('fs');

// 1. Update quanly_khach_hang/page.tsx
let qhk = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', 'utf-8');

qhk = qhk.replace(
    /const filteredCustomers = customers\.filter\(c =>\s*c\.TEN\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\|\s*c\.CMT\?\.includes\(searchQuery\) \|\|\s*String\(c\.MA_KH\)\.padStart\(3, '0'\)\.includes\(searchQuery\)\s*\);/g,
    `const filteredCustomers = customers.filter(c => 
    (c?.TEN || c?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c?.CMT || c?.cmt || '').includes(searchQuery) ||
    String(c?.MA_KH || c?.id || '').padStart(3, '0').includes(searchQuery)
  );`
);

qhk = qhk.replace(
    /paginatedCustomers\.map\(\(customer\) => \(\s*<tr key=\{customer\.MA_KH\}/g,
    `paginatedCustomers.map((customer, index) => (
                        <tr key={customer?.MA_KH || customer?.id || index} `
);

// additional defense inside mapping
qhk = qhk.replace(/\{customer\.TEN\}/g, '{customer?.TEN || customer?.name}');
qhk = qhk.replace(/\{customer\.CMT\}/g, '{customer?.CMT || customer?.cmt}');
qhk = qhk.replace(/\{customer\.DIA_CHI\}/g, '{customer?.DIA_CHI || customer?.address}');

fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', qhk, 'utf-8');

// 2. Update quanly_nhan_vien/page.tsx
let nv = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', 'utf-8');

nv = nv.replace(
    /paginatedEmployees\.map\(\(employee\) => \(\s*<tr key=\{employee\.MA_NV\}/g,
    `paginatedEmployees.map((employee, index) => (
                                                <tr key={employee?.MA_NV || employee?.id || index}`
);

nv = nv.replace(/\{employee\.TEN\}/g, '{employee?.TEN || employee?.name}');
nv = nv.replace(/\{employee\.VI_TRI\}/g, '{employee?.VI_TRI || employee?.position}');
nv = nv.replace(/\{employee\.BAC_NGHE\}/g, '{employee?.BAC_NGHE || employee?.level}');

fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', nv, 'utf-8');

// 3. Update giao_dich/page.tsx
// wait, giao_dich mapping logic
let gd = fs.readFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', 'utf-8');

gd = gd.replace(
    /filteredCustomers\.map\(c => \(\s*<div\s*key=\{c\.MA_KH\}/g,
    `filteredCustomers.map((c, index) => (
                  <div 
                    key={c?.MA_KH || c?.id || index}`
);

gd = gd.replace(/\{c\.TEN\}/g, '{c?.TEN || c?.name}');
gd = gd.replace(/\{c\.CMT \|\| 'N\/A'\}/g, '{c?.CMT || c?.cmt || \'N/A\'}');
gd = gd.replace(/\{c\.MA_KH\}/g, '{c?.MA_KH || c?.id}');

fs.writeFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', gd, 'utf-8');
