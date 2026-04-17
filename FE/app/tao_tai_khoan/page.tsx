"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, User, CreditCard, Wallet, Banknote, ShieldAlert, CheckCircle2, ChevronDown, Info,
  LayoutDashboard, Users, FileText, HelpCircle, Settings, LogOut, Building2, UserCog, ArrowLeftRight, Percent, AlertCircle
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

export default function OpenNewAccount() {
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accountType, setAccountType] = useState<'credit' | 'savings' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedSTK, setGeneratedSTK] = useState('');
  
  // States cho các trường nhập liệu
  const [soTien, setSoTien] = useState('');
  const [laiSuat, setLaiSuat] = useState('');
  const [soDuToiThieu, setSoDuToiThieu] = useState('50000');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sinh STK giả lập trên UI cho đẹp (Backend sẽ tự sinh số thật)
  useEffect(() => {
    if (accountType === 'credit') {
      setGeneratedSTK('TD00' + Math.floor(100000 + Math.random() * 900000));
    } else if (accountType === 'savings') {
      setGeneratedSTK('1000' + Math.floor(100000 + Math.random() * 900000));
    } else {
      setGeneratedSTK('');
    }
  }, [accountType]);

  // 1. LẤY DỮ LIỆU THẬT TỪ BACKEND
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    // Lấy khách hàng
    fetch("http://localhost:8080/khachhang")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Lỗi lấy dữ liệu khách hàng:", err));

    // Lấy nhân viên
    fetch("http://localhost:8080/nhanvien")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Lỗi lấy dữ liệu nhân viên:", err));
  }, []);

  // Lọc khách hàng
  const filteredCustomers = customers.filter(c => {
    const name = (c.ten || c.TEN || c.name || '').toString().toLowerCase();
    const id = (c.ma_kh || c.MA_KH || c.id || '').toString().toLowerCase();
    const cmt = (c.cmt || c.CMT || '').toString();
    const query = searchQuery.toLowerCase();

    return name.includes(query) || id.includes(query) || cmt.includes(query);
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // 2. GỬI YÊU CẦU TẠO TÀI KHOẢN XUỐNG BACKEND
  const handleCreateAccount = async () => {
    try {
      setErrorMessage(null);
      
      const payload = {
        ma_kh: selectedCustomer?.ma_kh || selectedCustomer?.MA_KH || selectedCustomer?.id,
        ma_nv: parseInt(selectedEmployee),
        loai_tk: accountType,
        so_tien: parseFloat(soTien || '0'),
        lai_suat: parseFloat(laiSuat || '0'),
        so_du_toi_thieu: parseFloat(soDuToiThieu || '50000')
      };

      const response = await fetch("http://localhost:8080/taotaikhoan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Nếu API trả về lỗi (Do nhân viên sai vị trí, vượt quá số lượng thẻ...)
      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tạo tài khoản!");
      }

      alert(`✅ ${data.message}`);
      
      // Reset form sau khi tạo thành công
      setSelectedCustomer(null);
      setSearchQuery('');
      setAccountType(null);
      setSelectedEmployee('');
      setSoTien('');
      setLaiSuat('');
      
    } catch (error: any) {
      const msg = error.message || 'Có lỗi hệ thống trong quá trình tạo tài khoản.';
      setErrorMessage(msg);
      alert("❌ " + msg);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#14234b]">Mở tài khoản mới</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Cấp phát tài khoản gửi tiền hoặc tín dụng cho khách hàng.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="max-w-4xl w-full">

            <div className="bg-white border border-slate-200 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0d213b] to-[#1464b4]"></div>

              <div className="p-8 space-y-10">
                
                {errorMessage && (
                  <div className="flex items-start gap-3 bg-red-50/80 border border-red-200 p-4 rounded-xl text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-[13.5px] font-medium leading-relaxed">
                      {errorMessage}
                    </div>
                  </div>
                )}

                {/* Section 1: Customer Selection */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1464b4]/10 text-[#1464b4] font-bold text-xs ring-1 ring-[#1464b4]/20">1</div>
                    <h2 className="text-lg font-semibold text-slate-800">Chọn khách hàng</h2>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Customer Dropdown */}
                    <div ref={dropdownRef} className="relative">
                      <label className="block text-[13px] font-semibold text-slate-700 mb-2">Thông tin Khách hàng</label>
                      
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full bg-slate-50 border ${isDropdownOpen ? 'border-[#1464b4] ring-2 ring-[#1464b4]/20' : 'border-slate-200'} text-slate-800 rounded-xl px-4 py-3 pl-[2.8rem] transition-all cursor-pointer flex items-center justify-between group hover:border-[#1464b4]/50 h-12`}
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#1464b4] transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 truncate text-sm">
                          {selectedCustomer ? (
                            <span className="font-semibold">
                              {selectedCustomer.ten || selectedCustomer.TEN} 
                              <span className="text-slate-400 font-normal ml-1">
                                 (CCCD: {selectedCustomer.cmt || selectedCustomer.CMT})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Tra cứu và chọn khách hàng...</span>
                          )}
                        </div>

                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Searchable Dropdown List */}
                      {isDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-20">
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                autoFocus
                                placeholder="Tìm mã KH, tên hoặc CCCD..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4]"
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map(c => (
                                <div 
                                  key={c.ma_kh || c.MA_KH} 
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setIsDropdownOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className={`px-3 py-2.5 rounded-lg cursor-pointer flex flex-col transition-colors ${(selectedCustomer?.ma_kh || selectedCustomer?.MA_KH) === (c.ma_kh || c.MA_KH) ? 'bg-[#1464b4]/10 text-[#1464b4]' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                  <span className="text-sm font-semibold">{c.ten || c.TEN}</span>
                                  <span className="text-xs text-slate-500 opacity-90">KH{String(c.ma_kh || c.MA_KH).padStart(3, '0')} • CCCD: {c.cmt || c.CMT}</span>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-slate-500">
                                Không tìm thấy khách hàng.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sales Employee Select */}
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-2">Nhân viên phụ trách</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1464b4] transition-colors">
                          <UserCog className="w-5 h-5" />
                        </div>
                        <select 
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          className={`w-full pl-[2.8rem] pr-4 py-3 h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4] hover:border-[#1464b4]/50 ${selectedEmployee ? 'font-semibold text-slate-800' : 'text-slate-400'}`}
                        >
                          <option value="" disabled className="text-slate-400 font-normal">-- Chọn nhân viên --</option>
                          {employees.map(e => (
                            <option key={e.ma_nv || e.MA_NV} value={e.ma_nv || e.MA_NV} className="text-slate-800 font-medium">
                              {String(e.ma_nv || e.MA_NV).padStart(3, '0')} - {e.ten || e.TEN} ({e.vi_tri || e.VI_TRI})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                </section>

                <hr className="border-slate-100" />

                {/* Section 2: Account Type Selection */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1464b4]/10 text-[#1464b4] font-bold text-xs ring-1 ring-[#1464b4]/20">2</div>
                    <h2 className="text-lg font-semibold text-slate-800">Loại tài khoản</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* Savings Account Card */}
                    <div 
                      onClick={() => setAccountType('savings')}
                      className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                        accountType === 'savings' 
                        ? 'border-[#1464b4] bg-[#f0f5fc] shadow-[0_4px_20px_-4px_rgba(20,100,180,0.2)] scale-[1.01]' 
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${accountType === 'savings' ? 'bg-[#1464b4] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${accountType === 'savings' ? 'text-[#1464b4]' : 'text-slate-800'}`}>Tài khoản Gửi tiền</h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">Dành cho giao dịch hàng ngày, nhận lương và tiết kiệm cá nhân.</p>
                        </div>
                      </div>
                      {accountType === 'savings' && (
                        <div className="absolute top-4 right-4 text-[#1464b4]">
                          <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                        </div>
                      )}
                    </div>

                    {/* Credit Account Card */}
                    <div 
                      onClick={() => setAccountType('credit')}
                      className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                        accountType === 'credit' 
                        ? 'border-[#1464b4] bg-[#f0f5fc] shadow-[0_4px_20px_-4px_rgba(20,100,180,0.2)] scale-[1.01]' 
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${accountType === 'credit' ? 'bg-[#1464b4] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${accountType === 'credit' ? 'text-[#1464b4]' : 'text-slate-800'}`}>Tài khoản Tín dụng</h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">Cấp hạn mức chi tiêu trước, thanh toán sau. Phù hợp mua sắm thẻ.</p>
                        </div>
                      </div>
                      {accountType === 'credit' && (
                        <div className="absolute top-4 right-4 text-[#1464b4]">
                          <CheckCircle2 className="w-5 h-5 fill-current text-white" />
                        </div>
                      )}
                    </div>

                  </div>
                </section>

                {/* Section 3: Dynamic Fields */}
                {accountType && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <hr className="border-slate-100 mb-8" />
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1464b4]/10 text-[#1464b4] font-bold text-xs ring-1 ring-[#1464b4]/20">3</div>
                        <h2 className="text-lg font-semibold text-slate-800">
                          Cấu hình {accountType === 'savings' ? 'gửi tiền' : 'tín dụng'}
                        </h2>
                      </div>

                      <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
                        {/* decorative accent */}
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                          {accountType === 'credit' ? <CreditCard className="w-40 h-40 -mt-10 -mr-10" /> : <Wallet className="w-40 h-40 -mt-10 -mr-10" />}
                        </div>

                        <div className="mb-6 relative z-10 w-full sm:max-w-sm">
                          <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                            Số tài khoản cấp phát (Tự động)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                              <CreditCard className="w-4.5 h-4.5" />
                            </div>
                            <input
                              type="text"
                              value={generatedSTK}
                              readOnly
                              disabled
                              className="w-full pl-10 pr-4 py-3 bg-slate-200 border border-slate-300 rounded-xl font-bold text-[#1464b4] focus:outline-none transition-all cursor-not-allowed opacity-80"
                            />
                          </div>
                        </div>

                        {accountType === 'savings' ? (
                          <div className="relative z-10 w-full pt-6 border-t border-slate-200/60">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                              {/* Cột 1 */}
                              <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                  Số tiền gửi ban đầu
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Banknote className="w-4.5 h-4.5" />
                                  </div>
                                  <input 
                                    type="number"
                                    placeholder="0"
                                    value={soTien}
                                    onChange={(e) => setSoTien(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4] transition-all"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 font-medium text-xs">
                                    VND
                                  </div>
                                </div>
                              </div>
                              
                              {/* Cột 2 */}
                              <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                  Lãi suất hàng tháng
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Percent className="w-4.5 h-4.5" />
                                  </div>
                                  <input 
                                    type="number"
                                    placeholder="0.0"
                                    step="0.1"
                                    value={laiSuat}
                                    onChange={(e) => setLaiSuat(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4] transition-all"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 font-medium text-xs">
                                    %
                                  </div>
                                </div>
                              </div>

                              {/* Cột 3 */}
                              <div>
                                <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                  Số dư tối thiểu
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Banknote className="w-4.5 h-4.5" />
                                  </div>
                                  <input 
                                    type="number"
                                    value={soDuToiThieu}
                                    onChange={(e) => setSoDuToiThieu(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4] transition-all"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 font-medium text-xs">
                                    VND
                                  </div>
                                </div>
                              </div>

                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                              * Nộp tối thiểu 50,000 VND để duy trì thẻ thanh toán nội địa.
                            </p>
                          </div>
                        ) : (
                          <div className="relative z-10 max-w-sm pt-6 border-t border-slate-200/60">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Hạn mức tín dụng đề xuất
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Banknote className="w-5 h-5" />
                              </div>
                              <input 
                                type="number"
                                placeholder="0"
                                value={soTien}
                                onChange={(e) => setSoTien(e.target.value)}
                                className="w-full pl-11 pr-14 py-3.5 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4] transition-all"
                              />
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 font-medium">
                                VND
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              * Yêu cầu xác thực thu nhập để duyệt hạn mức gốc.
                            </p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {/* Alert Message Box */}
                <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-100 p-4 rounded-xl text-blue-800 mt-4">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm leading-relaxed">
                    <span className="font-semibold block mb-1">Lưu ý quan trọng:</span>
                    Mỗi khách hàng chỉ được mở tối đa <strong>2 tài khoản tín dụng</strong> và <strong>3 tài khoản gửi tiền</strong>. Chỉ <u>Nhân viên kinh doanh</u> hoặc quản lý mới có quyền thực hiện thao tác duyệt bước này để tính KPI hoa hồng.
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                   <button 
                    disabled={!selectedCustomer || !accountType || !selectedEmployee}
                    onClick={handleCreateAccount}
                    className="group bg-[#1464b4] hover:bg-[#0f4d8a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-[0_8px_20px_-6px_rgba(20,100,180,0.5)] active:scale-[0.98] disabled:active:scale-100 disabled:shadow-none flex items-center gap-2"
                  >
                    Xác nhận mở tài khoản
                    <CheckCircle2 className="w-5 h-5 group-enabled:group-hover:scale-110 transition-transform hidden sm:block" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}