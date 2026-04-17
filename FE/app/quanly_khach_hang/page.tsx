"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Edit2, Trash2, X, User, MapPin, Calendar, CreditCard as CreditCardIcon,
  LayoutDashboard, Users, FileText, Settings, LogOut, Building2, UserCog, CreditCard, ArrowLeftRight, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CustomerManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State quản lý danh sách khách hàng từ Backend
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // =================================================================
  // 1. HÀM LẤY DỮ LIỆU TỪ BACKEND (GET)
  // =================================================================
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/khachhang");
      const data = await res.json();
      
      // Chuyển đổi key từ DB (viết thường) sang key giao diện UI (viết hoa)
      const formattedData = Array.isArray(data) ? data.map((dbItem: any) => ({
        MA_KH: dbItem.ma_kh,
        TEN: dbItem.ten,
        CMT: dbItem.cmt,
        DOB: dbItem.dob,
        DIA_CHI: dbItem.dia_chi
      })) : [];
      
      setCustomers(formattedData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động lấy dữ liệu khi vừa mở trang
  useEffect(() => {
    fetchCustomers();
  }, []);

  // State quản lý dữ liệu trong Form
  const [formData, setFormData] = useState({
    TEN: '',
    CMT: '',
    DOB: '',
    DIA_CHI: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Lọc danh sách theo tìm kiếm
  const filteredCustomers = customers.filter(c => 
    (c?.TEN || c?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c?.CMT || c?.cmt || '').includes(searchQuery) ||
    String(c?.MA_KH || c?.id || '').padStart(3, '0').includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mở Modal chung cho Thêm mới và Chỉnh sửa
  const openModal = (customer: any = null) => {
    if (customer) {
      setEditingId(customer.MA_KH || customer.id);
      
      // FIX LỖI DATE: Định dạng lại chuỗi thời gian từ DB để <input type="date"> có thể đọc được
      let formattedDate = '';
      if (customer.DOB) {
        // Cắt lấy phần 'YYYY-MM-DD' từ chuỗi ISO (VD: '1995-02-15T00:00:00Z' -> '1995-02-15')
        formattedDate = new Date(customer.DOB).toISOString().split('T')[0];
      }

      setFormData({
        TEN: customer.TEN || '',
        CMT: customer.CMT || '',
        DOB: formattedDate,
        DIA_CHI: customer.DIA_CHI || ''
      });
    } else {
      setEditingId(null);
      setFormData({ TEN: '', CMT: '', DOB: '', DIA_CHI: '' });
    }
    setIsModalOpen(true);
  };

  // =================================================================
  // 2. HÀM THÊM VÀ SỬA DỮ LIỆU TỚI BACKEND (POST / PUT)
  // =================================================================
  const handleSave = async () => {
    if (!formData.TEN.trim() || !formData.CMT.trim()) {
      alert("⚠️ Vui lòng nhập tối thiểu Họ và tên cùng Số CMT/CCCD!");
      return;
    }

    try {
      const payload = {
        ten: formData.TEN,
        cmt: formData.CMT,
        dob: formData.DOB || null,
        dia_chi: formData.DIA_CHI || null
      };

      if (editingId !== null) {
        // CẬP NHẬT (PUT)
        const res = await fetch(`http://localhost:8080/khachhang/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Lỗi cập nhật");
        alert("✅ Cập nhật thông tin khách hàng thành công!");

      } else {
        // THÊM MỚI (POST) - Tự động sinh ID mới nhất + 1
        const maxIdNum = customers.length > 0 ? Math.max(...customers.map(c => c.MA_KH || 0)) : 0;
        const newId = maxIdNum + 1;
        
        const res = await fetch(`http://localhost:8080/khachhang`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ma_kh: newId, ...payload })
        });
        if (!res.ok) throw new Error("Lỗi thêm mới");
        alert("✅ Thêm khách hàng mới thành công!");
      }

      setIsModalOpen(false);
      fetchCustomers(); // Tải lại bảng dữ liệu ngay sau khi lưu
      
    } catch (error) {
      alert("❌ Có lỗi xảy ra! Không thể lưu dữ liệu.");
      console.error(error);
    }
  };

  // =================================================================
  // 3. HÀM XÓA DỮ LIỆU TỚI BACKEND (DELETE)
  // =================================================================
  const handleDelete = async (id: number, ten: string) => {
    if (window.confirm(`⚠️ Bạn có thực sự muốn xóa khách hàng "${ten}" không? Hành động này không thể hoàn tác.`)) {
      try {
        const res = await fetch(`http://localhost:8080/khachhang/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Lỗi khi xóa");
        
        alert("✅ Xóa khách hàng thành công!");
        fetchCustomers(); // Tải lại bảng dữ liệu ngay sau khi xóa
      } catch (error) {
        alert("❌ Lỗi khi xóa khách hàng! (Có thể khách hàng này đang có tài khoản ràng buộc).");
      }
    }
  };

  // Hàm xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-[#14234b]">Quản lý khách hàng</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">Quản lý và tổ chức cơ sở dữ liệu khách hàng của bạn</p>
            </div>
            <button 
              onClick={fetchCustomers}
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
                  placeholder="Tìm kiếm theo mã KH, tên, CCCD..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-[13px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all placeholder:text-slate-400"
                />
              </div>
              
              <button 
                onClick={() => openModal()}
                className="bg-[#1464b4] hover:bg-[#0f4d8a] text-white px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Thêm khách hàng mới
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="text-[13px] font-medium text-slate-500 mb-2 flex items-center gap-2">
                   <Users className="w-4 h-4 text-[#1464b4]" />
                   Tổng khách hàng hệ thống
                </div>
                <div className="text-3xl font-bold text-[#14234b]">{customers ? customers.length : 0}</div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold bg-slate-50/50">
                      <th className="px-6 py-4">Mã KH</th>
                      <th className="px-6 py-4">Họ và tên</th>
                      <th className="px-6 py-4">Số CMT/CCCD</th>
                      <th className="px-6 py-4">Địa chỉ</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                           <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1464b4]" />
                           Đang tải dữ liệu từ Database...
                         </td>
                       </tr>
                    ) : paginatedCustomers.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                           Không tìm thấy khách hàng nào.
                         </td>
                       </tr>
                    ) : (
                      paginatedCustomers.map((customer, index) => (
                        <tr key={customer?.MA_KH || customer?.id || index}  className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold text-[#1464b4]">
                            KH{String(customer?.MA_KH || customer?.id || '').padStart(3, '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-[#14234b]">
                            {customer?.TEN || customer?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-500 font-mono">
                            {customer?.CMT || customer?.cmt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-600">
                            {customer?.DIA_CHI || customer?.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[13px] text-right">
                            <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openModal(customer)}
                                className="text-slate-400 hover:text-[#1464b4] transition-colors"
                                title="Sửa khách hàng"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(customer?.MA_KH || customer?.id, customer?.TEN || customer?.name)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Xóa khách hàng"
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
                <span>Hiển thị <span className="font-medium text-[#14234b]">{filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium text-[#14234b]">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> trong <span className="font-medium text-[#14234b]">{filteredCustomers.length}</span> bản ghi</span>
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
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        currentPage === page 
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

      {/* Modal - Add / Edit Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-semibold text-[#14234b] tracking-tight">
                {editingId !== null ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-100 hover:text-slate-700 p-2 rounded-full transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
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
                    placeholder="VD: Nguyễn Văn A" 
                    className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Số CMT/CCCD <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4]">
                    <CreditCardIcon className="h-4.5 w-4.5" />
                  </div>
                  <input 
                    type="text" 
                    name="CMT"
                    value={formData.CMT}
                    onChange={handleInputChange}
                    placeholder="079090123456" 
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
                  <textarea 
                    rows={2} 
                    name="DIA_CHI"
                    value={formData.DIA_CHI}
                    onChange={handleInputChange}
                    placeholder="Số nhà, phố, quận/huyện..." 
                    className="w-full pl-[2.6rem] pr-4 py-2.5 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1464b4] focus:border-[#1464b4] transition-all bg-slate-50/50 focus:bg-white resize-none" 
                  />
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
                {editingId !== null ? 'Cập nhật' : 'Lưu khách hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}