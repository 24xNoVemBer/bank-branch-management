"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  CreditCard, Wallet, ArrowRight, ShieldCheck, ChevronDown, 
  LayoutDashboard, Users, FileText, Settings, LogOut, Building2, UserCog, ArrowLeftRight, User,
  History, AlertCircle, Clock, CheckCircle2, Search, CheckCircle, XCircle
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState<'spending' | 'payment'>('spending');
  const [SO_TIEN, setSO_TIEN] = useState('');
  
  // States lưu dữ liệu từ API
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // States cho Form giao dịch
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sourceAccount, setSourceAccount] = useState(''); // TK Nguồn
  const [creditAccount, setCreditAccount] = useState('');  // TK Tín dụng chi tiêu
  const [targetCreditCard, setTargetCreditCard] = useState('');  // TK Tín dụng đích (Thanh toán)
  const [verifiedTarget, setVerifiedTarget] = useState(false);
  const [employeeId, setEmployeeId] = useState('');              // Nhân viên thực hiện

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionMsg, setTransactionMsg] = useState({ type: '', text: '' });

  // =================================================================
  // 1. LẤY DỮ LIỆU KHỞI TẠO TỪ BACKEND
  // =================================================================
  const fetchRecentTransactions = () => {
    fetch("http://localhost:8080/api/baocao/giaodich-tindung")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentTransactions(data.slice(0, 4)); // Lấy 4 GD mới nhất
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetch("http://localhost:8080/khachhang").then(res => res.json()).then(data => setCustomers(Array.isArray(data) ? data : []));
    fetch("http://localhost:8080/nhanvien").then(res => res.json()).then(data => setEmployees(Array.isArray(data) ? data : []));
    fetchRecentTransactions();
  }, []);

  // Lấy tài khoản của Khách hàng khi được chọn
  // FIX CONFLICT 3: Dùng endpoint /taikhoan-chitiet/ để lấy đủ du_no_hien_tai, han_muc_tin_dung
  useEffect(() => {
    if (selectedCustomer) {
      const ma_kh = selectedCustomer.ma_kh || selectedCustomer.MA_KH;
      fetch(`http://localhost:8080/taikhoan-chitiet/${ma_kh}`)
        .then(res => res.json())
        .then(data => {
          setCustomerAccounts(Array.isArray(data) ? data : []);
          setSourceAccount('');
          setCreditAccount('');
        })
        .catch(e => console.error(e));
    } else {
      setCustomerAccounts([]);
    }
  }, [selectedCustomer]);

  // Phân loại tài khoản
  const savingsAccounts = customerAccounts.filter(tk => !tk.stk.startsWith('TD'));
  const creditAccounts = customerAccounts.filter(tk => tk.stk.startsWith('TD'));

  const filteredCustomers = customers.filter(c => {
    const name = (c.ten || c.TEN || '').toString().toLowerCase();
    const id = (c.ma_kh || c.MA_KH || '').toString();
    const cmt = (c.cmt || c.CMT || '').toString();
    return name.includes(searchQuery.toLowerCase()) || cmt.includes(searchQuery) || id.includes(searchQuery);
  });

  // =================================================================
  // 2. GỬI GIAO DỊCH LÊN BACKEND (POST)
  // =================================================================
  const handleTransactionSubmit = async () => {
    if (!SO_TIEN || !employeeId) {
      setTransactionMsg({ type: 'error', text: 'Vui lòng nhập đủ số tiền và chọn nhân viên thực hiện!' });
      return;
    }
    if (activeTab === 'payment' && (!targetCreditCard || !sourceAccount)) {
      setTransactionMsg({ type: 'error', text: 'Vui lòng chọn tài khoản nguồn và nhập thẻ tín dụng đích!' });
      return;
    }
    if (activeTab === 'spending' && !creditAccount) {
      setTransactionMsg({ type: 'error', text: 'Vui lòng chọn thẻ tín dụng để chi tiêu!' });
      return;
    }

    setIsSubmitting(true);
    setTransactionMsg({ type: '', text: '' });

    try {
      let res;
      if (activeTab === 'payment') {
        res = await fetch("http://localhost:8080/api/giaodich/thanhtoan-the", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stk_gui: sourceAccount, stk_tin_dung: targetCreditCard, so_tien: Number(SO_TIEN), ma_nv: Number(employeeId) })
        });
      } else {
        res = await fetch("http://localhost:8080/api/giaodich/chitieu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stk_tin_dung: creditAccount, so_tien: Number(SO_TIEN), ma_nv: Number(employeeId) })
        });
      }
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Giao dịch thất bại");
      
      setTransactionMsg({ type: 'success', text: result.message || 'Giao dịch thành công!' });
      
      // Reset form & Refresh lịch sử
      setSO_TIEN('');
      setTargetCreditCard('');
      setVerifiedTarget(false);
      fetchRecentTransactions();

    } catch (error: any) {
      setTransactionMsg({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCard = () => {
    if (targetCreditCard.length > 5) setVerifiedTarget(true);
  };

  const handleTabSwitch = (tab: 'spending' | 'payment') => {
    setActiveTab(tab);
    setSO_TIEN('');
    setTargetCreditCard('');
    setVerifiedTarget(false);
    setTransactionMsg({ type: '', text: '' });
  }

  // Component Dropdown Chọn KH
  const CustomerSearchDropdown = ({ title }: { title: string }) => (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700">{title}</label>
      <div ref={dropdownRef} className="relative">
        <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full bg-slate-50 border ${isDropdownOpen ? 'border-[#1464b4] ring-2 ring-[#1464b4]/20' : 'border-slate-200'} text-slate-800 rounded-xl px-4 py-4 pl-12 transition-all cursor-pointer flex items-center justify-between group hover:border-[#1464b4]/50 h-[58px]`}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#1464b4] transition-colors"><User className="w-5 h-5" /></div>
          <div className="flex-1 truncate text-[15px]">
            {selectedCustomer ? (
              <span className="font-semibold">{selectedCustomer.ten || selectedCustomer.TEN} <span className="text-slate-400 font-normal">({selectedCustomer.cmt || selectedCustomer.CMT})</span></span>
            ) : (<span className="text-slate-400 font-normal">Tra cứu và chọn khách hàng...</span>)}
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {isDropdownOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" autoFocus placeholder="Tìm mã KH, tên hoặc CCCD..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1464b4]/20 focus:border-[#1464b4]" />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, index) => (
                  <div key={c.ma_kh || c.MA_KH || index} onClick={() => { setSelectedCustomer(c); setIsDropdownOpen(false); setSearchQuery(''); setTransactionMsg({ type: '', text: '' }); }} className={`px-3 py-2.5 rounded-lg cursor-pointer flex flex-col transition-colors ${(selectedCustomer?.ma_kh || selectedCustomer?.MA_KH) === (c.ma_kh || c.MA_KH) ? 'bg-[#1464b4]/10 text-[#1464b4]' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <span className="text-[14px] font-semibold">{c.ten || c.TEN}</span>
                    <span className="text-xs text-slate-500 opacity-90">Mã KH: {c.ma_kh || c.MA_KH} • CCCD: {c.cmt || c.CMT}</span>
                  </div>
                ))
              ) : (<div className="p-4 text-center text-[14px] text-slate-500">Không tìm thấy khách hàng.</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#14234b]">Trung tâm Giao dịch</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Xử lý thanh toán dư nợ và sao kê chi tiêu thẻ tín dụng</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-white rounded-xl p-1 border border-slate-200 shadow-sm flex items-center gap-1 w-fit">
              <button onClick={() => handleTabSwitch('spending')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'spending' ? 'bg-[#1464b4] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}><CreditCard className="w-4 h-4" /> Chi tiêu tín dụng</button>
              <button onClick={() => handleTabSwitch('payment')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'payment' ? 'bg-[#1464b4] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}><Wallet className="w-4 h-4" /> Thanh toán dư nợ</button>
            </div>
        </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CỘT TRÁI: FORM GIAO DỊCH */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                  <div className="border-b border-slate-100 bg-slate-50/50 p-6">
                    <h2 className="text-lg font-bold text-[#14234b] flex items-center gap-2">{activeTab === 'spending' ? 'Lệnh thanh toán qua thẻ tín dụng' : 'Lệnh thanh toán dư nợ tín dụng'}</h2>
                  </div>

                  <div className="p-6 md:p-8 space-y-8">
                    {transactionMsg.text && (
                      <div className={`flex items-start gap-3 border p-4 rounded-xl ${transactionMsg.type === 'error' ? 'bg-red-50/80 border-red-200 text-red-800' : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'}`}>
                        {transactionMsg.type === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                        <div className="text-[14px] font-medium leading-relaxed">{transactionMsg.text}</div>
                      </div>
                    )}

                    {activeTab === 'spending' ? (
                      <>
                        <CustomerSearchDropdown title="1. Tra cứu Khách hàng" />
                        {selectedCustomer ? (
                          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-3 relative">
                              <label className="text-sm font-semibold text-slate-700">2. Chọn Tài khoản tín dụng</label>
                              <div className="relative group cursor-pointer">
                                <select value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-4 pl-12 pr-10 focus:ring-2 focus:ring-[#1464b4]/50 focus:border-[#1464b4] transition-all cursor-pointer font-medium text-[15px]">
                                  <option value="">-- Chọn thẻ tín dụng --</option>
                                  {creditAccounts.map(tk => (
                                    <option key={tk.stk} value={tk.stk}>
                                      Thẻ {tk.stk} | Dư nợ: {Number(tk.du_no_hien_tai || 0).toLocaleString('vi-VN')} / Hạn mức: {Number(tk.han_muc_tin_dung || 0).toLocaleString('vi-VN')} đ
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1464b4] pointer-events-none"><CreditCard className="w-5 h-5" /></div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown className="w-4 h-4" /></div>
                              </div>
                              {creditAccounts.length === 0 && <p className="text-xs text-red-500 mt-1">Khách hàng này chưa có thẻ tín dụng nào.</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">3. Số tiền chi tiêu</label>
                                <div className="relative shadow-sm rounded-xl">
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">VND</span>
                                  <input type="number" value={SO_TIEN} onChange={(e) => setSO_TIEN(e.target.value)} placeholder="0" className="w-full bg-white border border-slate-200 text-[#14234b] rounded-xl px-5 py-4 text-xl font-bold focus:ring-2 focus:ring-[#1464b4] transition-all pr-16" />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">4. Nhân viên hỗ trợ</label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><UserCog className="w-5 h-5" /></div>
                                  <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full pl-[2.8rem] pr-10 py-4 h-[62px] bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1464b4]/20 transition-all appearance-none cursor-pointer">
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(e => (<option key={e.MA_NV || e.ma_nv} value={e.MA_NV || e.ma_nv}>{e.TEN || e.ten}</option>))}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 flex items-center justify-center p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                            <span className="text-slate-400 text-sm font-medium">Vui lòng tra cứu khách hàng để tiếp tục giao dịch.</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <CustomerSearchDropdown title="1. Tra cứu Khách hàng (Người nộp tiền)" />
                        {selectedCustomer && (
                          <div className="space-y-3 relative animate-in fade-in slide-in-from-top-4 duration-500">
                            <label className="text-sm font-semibold text-slate-700">Tài khoản chuyển (Nguồn)</label>
                            <div className="relative group cursor-pointer">
                              <select value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)} className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-4 py-4 pl-12 pr-10 focus:ring-2 focus:ring-[#1464b4]/50 transition-all cursor-pointer font-medium text-[15px]">
                                <option value="">-- Chọn tài khoản thanh toán --</option>
                                {savingsAccounts.map(tk => (
                                  <option key={tk.stk} value={tk.stk}>TK VNĐ - {tk.stk} (Số dư: {Number(tk.so_du).toLocaleString('vi-VN')} đ)</option>
                                ))}
                              </select>
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1464b4] pointer-events-none"><Wallet className="w-5 h-5" /></div>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown className="w-4 h-4" /></div>
                            </div>
                            {savingsAccounts.length === 0 && <p className="text-xs text-red-500 mt-1">Khách hàng chưa có tài khoản gửi tiền để thanh toán.</p>}
                          </div>
                        )}
                        {selectedCustomer && (
                          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="space-y-3 mt-4">
                              <label className="text-sm font-semibold text-slate-700">2. Thẻ tín dụng đích (Thẻ cần trả nợ)</label>
                              <div className="flex gap-3">
                                <div className="relative flex-1">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600"><CreditCard className="w-5 h-5" /></div>
                                  <input type="text" value={targetCreditCard} onChange={(e) => { setTargetCreditCard(e.target.value); setVerifiedTarget(false); }} placeholder="Nhập mã thẻ..." className="w-full pl-12 pr-4 py-4 bg-slate-50 hover:bg-white border text-slate-800 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1464b4]/50 font-medium" />
                                </div>
                                <button onClick={handleVerifyCard} className="px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap">Kiểm tra</button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">3. Số tiền nộp</label>
                                <div className="relative shadow-sm rounded-xl">
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">VND</span>
                                  <input type="number" value={SO_TIEN} onChange={(e) => setSO_TIEN(e.target.value)} placeholder="0" className="w-full bg-white border border-slate-200 text-[#14234b] rounded-xl px-5 py-4 text-xl font-bold focus:ring-2 focus:ring-[#1464b4] transition-all pr-16" />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">4. Nhân viên thực hiện</label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><UserCog className="w-5 h-5" /></div>
                                  <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full pl-[2.8rem] pr-10 py-4 h-[62px] bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#1464b4]/20 transition-all appearance-none cursor-pointer">
                                    <option value="">-- Chọn nhân viên --</option>
                                    {employees.map(e => (<option key={e.MA_NV || e.ma_nv} value={e.MA_NV || e.ma_nv}>{e.TEN || e.ten}</option>))}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {!selectedCustomer && (
                          <div className="h-32 flex items-center justify-center p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                            <span className="text-slate-400 text-sm font-medium">Vui lòng chọn khách hàng gửi tiền để tiếp tục.</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="pt-4 border-t border-slate-100">
                      <button disabled={!selectedCustomer || isSubmitting} onClick={handleTransactionSubmit} className="w-full group disabled:bg-slate-300 disabled:shadow-none bg-gradient-to-r from-[#0d213b] to-[#1464b4] hover:from-[#0b1c32] hover:to-[#105296] text-white flex items-center justify-center gap-2.5 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md">
                        <ShieldCheck className={`w-5 h-5 opacity-90 ${isSubmitting ? 'animate-pulse' : 'group-enabled:group-hover:scale-110 transition-transform'}`} />
                        {isSubmitting ? 'Đang xử lý...' : `Xác nhận và Thực thi ${activeTab === 'spending' ? 'Chi Tiêu' : 'Thanh Toán'}`}
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none"><AlertCircle className="w-24 h-24 -mt-6 -mr-6" /></div>
                  <h3 className="font-bold text-[#14234b] mb-5 flex items-center gap-2 relative z-10"><div className="p-1.5 bg-amber-50 rounded-lg"><AlertCircle className="w-4 h-4 text-amber-500" /></div>Hạn mức trong ngày</h3>
                  <div className="space-y-5 relative z-10">
                    <div className="group"><div className="flex justify-between text-[13px] mb-2 font-medium"><span className="text-slate-500 group-hover:text-slate-700 transition-colors">Chi tiêu trong nước</span><span className="text-[#14234b]">500M / <span className="text-slate-400">1B</span></span></div><div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-amber-500 h-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] w-[50%] transition-all duration-1000"></div></div></div>
                    <div className="group"><div className="flex justify-between text-[13px] mb-2 font-medium"><span className="text-slate-500 group-hover:text-slate-700 transition-colors">Thanh toán quốc tế</span><span className="text-[#14234b]">20M / <span className="text-slate-400">100M</span></span></div><div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-emerald-500 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] w-[20%] transition-all duration-1000"></div></div></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-[#14234b] mb-5 flex items-center gap-2"><div className="p-1.5 bg-blue-50 rounded-lg"><History className="w-4 h-4 text-[#1464b4]" /></div> Giao dịch mới nhất</h3>
                  <div className="space-y-4">
                    {recentTransactions.map((gd, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-50 group cursor-pointer hover:bg-slate-50/50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${gd.loai_gd?.toLowerCase().includes('thanh toán') || gd.loai_gd?.toLowerCase().includes('trả') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {gd.loai_gd?.toLowerCase().includes('thanh toán') || gd.loai_gd?.toLowerCase().includes('trả') ? <CreditCard className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-slate-800 truncate">{gd.loai_gd}: {gd.ten_khach_hang}</p>
                          <p className="text-[12px] text-slate-400 mt-0.5">{new Date(gd.thoi_gian).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[14px] font-bold text-slate-700">{Number(gd.so_tien).toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>
                    ))}
                    {recentTransactions.length === 0 && <p className="text-sm text-slate-500 text-center">Chưa có giao dịch nào.</p>}
                  </div>
                  <Link href="/bao_cao" className="block text-center w-full mt-4 py-2.5 text-[13px] text-[#1464b4] font-semibold hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                    Xem toàn bộ lịch sử
                  </Link>
                </div>
              </div>

          </div>
        </div>
    </DashboardLayout>
  );
}