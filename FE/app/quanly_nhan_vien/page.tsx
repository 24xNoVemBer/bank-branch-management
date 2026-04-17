"use client";

import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, User, RefreshCw, Users, LayoutDashboard
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

interface Employee {
    MA_NV: number;
    TEN: string;
    VI_TRI: string;
    BAC_NGHE: string;
    DOB: string;
    DIA_CHI: string;
    THAM_NIEN: number;
    [key: string]: any;
}

export default function EmployeeManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State quản lý danh sách nhân viên từ Backend
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // =================================================================
    // 1. HÀM LẤY DỮ LIỆU TỪ BACKEND (GET)
    // =================================================================
    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8080/nhanvien");
            if (!res.ok) throw new Error("Lỗi khi tải danh sách nhân viên");
            const data = await res.json();
            
            // Chuyển đổi định dạng từ DB sang UI
            const formattedData = Array.isArray(data) ? data.map((dbItem: any) => ({
                MA_NV: dbItem.ma_nv,
                TEN: dbItem.ten,
                VI_TRI: dbItem.vi_tri || 'Nhân viên',
                BAC_NGHE: dbItem.bac_nghe || 'Bậc 1',
                DOB: dbItem.dob || '',
                DIA_CHI: dbItem.dia_chi || '',
                THAM_NIEN: dbItem.tham_nien || 0
            })) : [];
            
            setEmployees(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // State quản lý dữ liệu trong Form
    const [formData, setFormData] = useState({
        TEN: '',
        DOB: '',
        DIA_CHI: '',
        THAM_NIEN: 0,
        VI_TRI: 'Nhân viên kinh doanh',
        BAC_NGHE: 'Bậc 1'
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Lọc danh sách theo tìm kiếm
    const filteredEmployees = employees.filter(e =>
        (e.TEN || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(e.MA_NV || '').padStart(3, '0').includes(searchQuery) ||
        (e.VI_TRI || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Mở Modal chung cho Thêm mới và Chỉnh sửa
    const openModal = (employee: any = null) => {
        if (employee) {
            setEditingId(employee.MA_NV);
            
            // FIX LỖI DATE: Cắt chuỗi thời gian để thẻ <input type="date"> hiển thị được
            let formattedDate = '';
            if (employee.DOB) {
                try {
                    formattedDate = new Date(employee.DOB).toISOString().split('T')[0];
                } catch(e) {}
            }

            setFormData({
                TEN: employee.TEN || '',
                DOB: formattedDate,
                DIA_CHI: employee.DIA_CHI || '',
                THAM_NIEN: employee.THAM_NIEN !== undefined ? Number(employee.THAM_NIEN) : 0,
                VI_TRI: employee.VI_TRI || 'Nhân viên kinh doanh',
                BAC_NGHE: employee.BAC_NGHE || 'Bậc 1'
            });
        } else {
            setEditingId(null);
            setFormData({
                TEN: '',
                DOB: '',
                DIA_CHI: '',
                THAM_NIEN: 0,
                VI_TRI: 'Nhân viên kinh doanh',
                BAC_NGHE: 'Bậc 1'
            });
        }
        setIsModalOpen(true);
    };

    // =================================================================
    // 2. HÀM THÊM VÀ SỬA DỮ LIỆU TỚI BACKEND (POST / PUT)
    // =================================================================
    const handleSave = async () => {
        if (!formData.TEN.trim()) {
            alert("⚠️ Vui lòng nhập tối thiểu Họ và tên!");
            return;
        }

        try {
            // Chuẩn bị dữ liệu để gửi xuống DB (dùng tên cột viết thường)
            const payload = {
                ten: formData.TEN,
                dob: formData.DOB || null,
                dia_chi: formData.DIA_CHI || null,
                vi_tri: formData.VI_TRI,
                bac_nghe: formData.BAC_NGHE,
                tham_nien: formData.THAM_NIEN
            };

            if (editingId !== null) {
                // CẬP NHẬT (PUT)
                const res = await fetch(`http://localhost:8080/nhanvien/${editingId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error("Lỗi cập nhật");
                alert("✅ Cập nhật hồ sơ nhân viên thành công!");
            } else {
                // THÊM MỚI (POST) - Tự động sinh ID
                const maxIdNum = employees.length > 0 ? Math.max(...employees.map(e => e.MA_NV || 0)) : 0;
                const newId = maxIdNum + 1;
                
                const res = await fetch(`http://localhost:8080/nhanvien`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ma_nv: newId, ...payload })
                });
                if (!res.ok) throw new Error("Lỗi thêm mới");
                alert("✅ Thêm nhân viên mới thành công!");
            }

            setIsModalOpen(false);
            fetchEmployees(); // Load lại bảng ngay sau khi lưu
            
        } catch (error) {
            alert("❌ Có lỗi xảy ra! Không thể lưu dữ liệu.");
            console.error(error);
        }
    };

    // =================================================================
    // 3. HÀM XÓA DỮ LIỆU TỚI BACKEND (DELETE)
    // =================================================================
    const handleDelete = async (id: number, ten: string) => {
        if (window.confirm(`⚠️ Bạn có thực sự muốn xóa nhân viên "${ten}" không? Hành động này không thể hoàn tác.`)) {
            try {
                const res = await fetch(`http://localhost:8080/nhanvien/${id}`, {
                    method: "DELETE"
                });
                if (!res.ok) throw new Error("Lỗi xóa");
                
                alert("✅ Xóa nhân viên thành công!");
                fetchEmployees(); // Load lại bảng ngay sau khi xóa
            } catch (error) {
                alert("❌ Lỗi khi xóa nhân viên! (Có thể nhân viên này đang được ghi nhận thực hiện các giao dịch).");
            }
        }
    };

    // Hàm xử lý thay đổi input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1200px] mx-auto space-y-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-bold text-[#14234b]">Quản lý nhân viên</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Quản lý và cập nhật thông tin đội ngũ nhân viên</p>
                    </div>
                    <button 
                        onClick={fetchEmployees}
                        className="p-2 text-slate-400 hover:text-[#1464b4] hover:bg-slate-50 rounded-full transition-all bg-white border border-slate-200"
                        title="Làm mới dữ liệu từ Database"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin text-[#1464b4]" : ""}`} />
                    </button>
                </div>

                        {/* Search and Add Action */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full md:w-[400px]">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm kiếm theo mã nhân viên, tên..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>

                            <button
                                onClick={() => openModal()}
                                className="bg-[#1464b4] hover:bg-[#0f4d8a] text-white px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm nhân viên mới
                            </button>
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="text-[13px] font-medium text-slate-500 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#1464b4]" />
                                    Tổng quy mô nhân sự
                                </div>
                                <div className="text-3xl font-bold text-[#14234b]">{employees.length}</div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50/50">
                                            <th className="px-6 py-4">Mã NV</th>
                                            <th className="px-6 py-4">Họ và Tên</th>
                                            <th className="px-6 py-4">Vị trí công việc</th>
                                            <th className="px-6 py-4">Bậc nghề</th>
                                            <th className="px-6 py-4">Thâm niên</th>
                                            <th className="px-6 py-4 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1464b4]" />
                                                    Đang tải dữ liệu từ CSDL...
                                                </td>
                                            </tr>
                                        ) : paginatedEmployees.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                                                    Không tìm thấy nhân viên nào phù hợp.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedEmployees.map((employee, index) => (
                                                <tr key={employee.MA_NV || index} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold text-[#1464b4]">
                                                        NV{String(employee.MA_NV || '').padStart(3, '0')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-[#14234b]">
                                                        {employee.TEN}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                            employee.VI_TRI === 'Quản lý' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            employee.VI_TRI === 'Giao dịch viên' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {employee.VI_TRI}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600 font-medium">
                                                        <div className="flex gap-1">
                                                            {employee.BAC_NGHE}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-500 font-mono">
                                                        {employee.THAM_NIEN} năm
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-right">
                                                        <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => openModal(employee)}
                                                                className="text-slate-400 hover:text-[#1464b4] transition-colors"
                                                                title="Sửa nhân viên"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(employee.MA_NV, employee.TEN)}
                                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Xóa nhân viên"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between text-[13px] text-slate-500 gap-4">
                                <span>Hiển thị <span className="font-medium text-[#14234b]">{filteredEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium text-[#14234b]">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> trong <span className="font-medium text-[#14234b]">{filteredEmployees.length}</span> bản ghi</span>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
                                    >
                                        Trước
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${currentPage === page
                                                ? "bg-[#1464b4] text-white border border-[#1464b4]"
                                                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>

            </div>
            {/* Modal - Add / Edit Employee */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl">
                            <h2 className="text-lg font-semibold text-[#14234b] tracking-tight">
                                {editingId !== null ? 'Cập nhật hồ sơ nhân sự' : 'Hồ sơ nhân viên mới'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 p-2 rounded-full transition-colors focus:outline-none"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                                            <User className="h-4.5 w-4.5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="TEN"
                                            value={formData.TEN}
                                            onChange={handleInputChange}
                                            placeholder="Nguyễn Văn A"
                                            className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700">Ngày sinh</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                                            <Calendar className="h-4.5 w-4.5" />
                                        </div>
                                        <input
                                            type="date"
                                            name="DOB"
                                            value={formData.DOB}
                                            onChange={handleInputChange}
                                            className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700">Địa chỉ</label>
                                    <div className="relative group">
                                        <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                                            <MapPin className="h-4.5 w-4.5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="DIA_CHI"
                                            value={formData.DIA_CHI}
                                            onChange={handleInputChange}
                                            placeholder="Nơi ở hiện tại"
                                            className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700">Thâm niên (Năm)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                                            <Calendar className="h-4.5 w-4.5" />
                                        </div>
                                        <input
                                            type="number"
                                            name="THAM_NIEN"
                                            value={formData.THAM_NIEN}
                                            onChange={handleInputChange}
                                            className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700">Vị trí công việc</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                                            <Briefcase className="h-4.5 w-4.5" />
                                        </div>
                                        <select
                                            name="VI_TRI"
                                            value={formData.VI_TRI}
                                            onChange={handleInputChange}
                                            className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
                                            <option value="Giao dịch viên">Giao dịch viên</option>
                                            <option value="Quản lý">Quản lý</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-semibold text-slate-700">Bậc nghề</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                                            <Star className="h-4.5 w-4.5" />
                                        </div>
                                        <select
                                            name="BAC_NGHE"
                                            value={formData.BAC_NGHE}
                                            onChange={handleInputChange}
                                            className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white appearance-none cursor-pointer"
                                        >
                                            <option value="Bậc 1">Bậc 1</option>
                                            <option value="Bậc 2">Bậc 2</option>
                                            <option value="Bậc 3">Bậc 3</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors focus:outline-none"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1464b4] hover:bg-[#0f4d8a] rounded-xl shadow-sm active:scale-95 transition-all focus:outline-none"
                            >
                                {editingId !== null ? 'Cập nhật' : 'Lưu nhân viên'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}