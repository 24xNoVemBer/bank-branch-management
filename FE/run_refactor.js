const fs = require('fs');

function refactorFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const { from, to } of replacements) {
    // using split join to replace all occurrences
    content = content.split(from).join(to);
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${filePath}`);
}

// ------------------------------------------------------------------
// 1. quanly_khach_hang
// ------------------------------------------------------------------
refactorFile('d:/SQL/giao_dien_chinh/app/quanly_khach_hang/page.tsx', [
  { from: 'id: 1, name:', to: 'MA_KH: 1, TEN:' },
  { from: 'id: 2, name:', to: 'MA_KH: 2, TEN:' },
  { from: 'id: 3, name:', to: 'MA_KH: 3, TEN:' },
  { from: 'id: 4, name:', to: 'MA_KH: 4, TEN:' },
  { from: 'id: 5, name:', to: 'MA_KH: 5, TEN:' },
  { from: 'cmt:', to: 'CMT:' },
  { from: 'dob:', to: 'DOB:' },
  { from: 'address:', to: 'DIA_CHI:' },
  { from: '{ name', to: '{ TEN' },
  { from: ' name:', to: ' TEN:' },
  { from: 'name: ', to: 'TEN: ' },
  { from: 'c.name', to: 'c.TEN' },
  { from: 'c.cmt', to: 'c.CMT' },
  { from: 'c.id', to: 'c.MA_KH' },
  { from: 'customer.id', to: 'customer.MA_KH' },
  { from: 'customer.name', to: 'customer.TEN' },
  { from: 'customer.cmt', to: 'customer.CMT' },
  { from: 'customer.dob', to: 'customer.DOB' },
  { from: 'customer.address', to: 'customer.DIA_CHI' },
  { from: 'formData.name', to: 'formData.TEN' },
  { from: 'formData.cmt', to: 'formData.CMT' },
  { from: 'formData.dob', to: 'formData.DOB' },
  { from: 'formData.address', to: 'formData.DIA_CHI' },
  { from: 'name="name"', to: 'name="TEN"' },
  { from: 'name="cmt"', to: 'name="CMT"' },
  { from: 'name="dob"', to: 'name="DOB"' },
  { from: 'name="address"', to: 'name="DIA_CHI"' },
  { from: 'id: newId', to: 'MA_KH: newId' },
]);

// ------------------------------------------------------------------
// 2. quanly_nhan_vien
// ------------------------------------------------------------------
let nvContent = fs.readFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', 'utf-8');

nvContent = nvContent.split('id: 1, name:').join('MA_NV: 1, TEN:');
nvContent = nvContent.split('id: 2, name:').join('MA_NV: 2, TEN:');
nvContent = nvContent.split('id: 3, name:').join('MA_NV: 3, TEN:');
nvContent = nvContent.split('level:').join('BAC_NGHE:');
nvContent = nvContent.split('position:').join('VI_TRI:');
nvContent = nvContent.split('dob:').join('DOB:');
nvContent = nvContent.split('address:').join('DIA_CHI:');
nvContent = nvContent.split('joinDate:').join('THAM_NIEN:');

// Replace standard variables
nvContent = nvContent.split('e.id').join('e.MA_NV');
nvContent = nvContent.split('e.name').join('e.TEN');
nvContent = nvContent.split('e.position').join('e.VI_TRI');
nvContent = nvContent.split('employee.id').join('employee.MA_NV');
nvContent = nvContent.split('employee.name').join('employee.TEN');
nvContent = nvContent.split('employee.position').join('employee.VI_TRI');
nvContent = nvContent.split('employee.level').join('employee.BAC_NGHE');
nvContent = nvContent.split('formData.name').join('formData.TEN');
nvContent = nvContent.split('formData.position').join('formData.VI_TRI');
nvContent = nvContent.split('formData.level').join('formData.BAC_NGHE');
nvContent = nvContent.split('formData.dob').join('formData.DOB');
nvContent = nvContent.split('formData.address').join('formData.DIA_CHI');
nvContent = nvContent.split('formData.joinDate').join('formData.THAM_NIEN');

nvContent = nvContent.split('name="name"').join('name="TEN"');
nvContent = nvContent.split('name="position"').join('name="VI_TRI"');
nvContent = nvContent.split('name="level"').join('name="BAC_NGHE"');
nvContent = nvContent.split('name="dob"').join('name="DOB"');
nvContent = nvContent.split('name="address"').join('name="DIA_CHI"');
nvContent = nvContent.split('name="joinDate"').join('name="THAM_NIEN"');

nvContent = nvContent.split('id: newId').join('MA_NV: newId');

// default forms
nvContent = nvContent.replace(
/name: '',\s+cccd: '',\s+dob: '',\s+phone: '',\s+address: '',\s+joinDate: '',\s+position: 'Nhân viên kinh doanh',\s+level: 'Bậc 1'/g,
`TEN: '',
        DOB: '',
        DIA_CHI: '',
        THAM_NIEN: 0,
        VI_TRI: 'Nhân viên kinh doanh',
        BAC_NGHE: 'Bậc 1'`
);

// default dataset fixing the mock values
nvContent = nvContent.replace(/cccd: '[^']+', /g, '');
nvContent = nvContent.replace(/phone: '[^']+', /g, '');
nvContent = nvContent.replace(/THAM_NIEN: '2015-06-15'/g, 'THAM_NIEN: 9');
nvContent = nvContent.replace(/THAM_NIEN: '2019-09-01'/g, 'THAM_NIEN: 5');
nvContent = nvContent.replace(/THAM_NIEN: '2022-03-10'/g, 'THAM_NIEN: 2');

// form fields removal
const cccdRegex = /<div className="space-y-1\.5">\s*<label className="text-\[13px\] font-semibold text-slate-700">CMT\/CCCD<\/label>[\s\S]*?<\/div>\s*<\/div>/g;
nvContent = nvContent.replace(cccdRegex, '');

const phoneRegex = /<div className="space-y-1\.5">\s*<label className="text-\[13px\] font-semibold text-slate-700">Số điện thoại<\/label>[\s\S]*?<\/div>\s*<\/div>/g;
nvContent = nvContent.replace(phoneRegex, '');

// update joinDate input to THAM_NIEN (number)
nvContent = nvContent.replace(
/<label className="text-\[13px\] font-semibold text-slate-700">Ngày vào làm<\/label>/g,
'<label className="text-[13px] font-semibold text-slate-700">Thâm niên (Năm)</label>'
);
nvContent = nvContent.replace(
  'type="date"\n                                            name="THAM_NIEN"',
  'type="number"\n                                            name="THAM_NIEN"'
);

// Search logic
nvContent = nvContent.replace(/\|\|\s*e\.phone\.includes\(searchQuery\)/g, '');
nvContent = nvContent.replace(/\|\|\s*e\.cccd\?\.includes\(searchQuery\)/g, '');
nvContent = nvContent.replace(/!formData\.TEN\.trim\(\) \|\| !formData\.phone\.trim\(\)/g, '!formData.TEN.trim()');

// Table visualization
nvContent = nvContent.replace('<th className="px-6 py-4">Số điện thoại</th>', '<th className="px-6 py-4">Thâm niên</th>');
nvContent = nvContent.replace('{employee.phone}', '{employee.THAM_NIEN} năm');


fs.writeFileSync('d:/SQL/giao_dien_chinh/app/quanly_nhan_vien/page.tsx', nvContent, 'utf-8');
console.log('Updated quanly_nhan_vien');

// ------------------------------------------------------------------
// 3. giao_dich
// ------------------------------------------------------------------
let gdContent = fs.readFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', 'utf-8');

gdContent = gdContent.replace(/<\{id: string, name: string\}\[\]>/g, '<{MA_NV: number, TEN: string}[]>');
gdContent = gdContent.replace(/<\{id: string, name: string, phone\?: string, cmt\?: string\}\[\]>/g, '<{MA_KH: number, TEN: string, CMT?: string}[]>');
gdContent = gdContent.replace(/<\{id: string, name: string, phone\?: string, cmt\?: string\} \| null>/g, '<{MA_KH: number, TEN: string, CMT?: string} | null>');

gdContent = gdContent.split('c.name').join('c.TEN');
gdContent = gdContent.split('c.phone').join('c.CMT'); // Wait, will fix regex manually
gdContent = gdContent.split('c.cmt').join('c.CMT');
gdContent = gdContent.split('c.id').join('c.MA_KH');
gdContent = gdContent.split('e.id').join('e.MA_NV');
gdContent = gdContent.split('e.name').join('e.TEN');

gdContent = gdContent.replace(
  /c\.TEN\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\|\s*\(c\.CMT && c\.CMT\.includes\(searchQuery\)\) \|\|\s*\(c\.CMT && c\.CMT\.includes\(searchQuery\)\) \|\|\s*c\.MA_KH\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g,
  "c.TEN.toLowerCase().includes(searchQuery.toLowerCase()) || (c.CMT && c.CMT.includes(searchQuery)) || String(c.MA_KH).padStart(3, '0').includes(searchQuery)"
);

// also fix selectedCustomer.name
gdContent = gdContent.split('selectedCustomer.name').join('selectedCustomer.TEN');
gdContent = gdContent.split('selectedCustomer.cmt').join('selectedCustomer.CMT');
gdContent = gdContent.split('selectedCustomer.phone').join('selectedCustomer.CMT'); 
gdContent = gdContent.split('selectedCustomer.id').join('selectedCustomer.MA_KH');

// Amount to SO_TIEN
gdContent = gdContent.split('const [amount, setAmount]').join('const [SO_TIEN, setSO_TIEN]');
gdContent = gdContent.split('setAmount(').join('setSO_TIEN(');
gdContent = gdContent.split('value={amount}').join('value={SO_TIEN}');

fs.writeFileSync('d:/SQL/giao_dien_chinh/app/giao_dich/page.tsx', gdContent, 'utf-8');
console.log('Updated giao_dich');

