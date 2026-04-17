"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Wallet, ArrowRightLeft, History, Bell, LogOut, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function EBankingDashboard() {
  // Giả lập Khách hàng đang đăng nhập (ID = 1: Nguyễn Văn Anh)
  const CUSTOMER_ID = 1;
  const [currentCustomer, setCurrentCustomer] = useState({ MA_KH: CUSTOMER_ID, TEN: 'Nguyễn Văn Anh' });

  // States lưu dữ liệu thật từ Database
  const [depositAccounts, setDepositAccounts] = useState<any[]>([]);
  const [creditAccounts, setCreditAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // States cho Form Thanh toán
  const [selectedDeposit, setSelectedDeposit] = useState('');
  const [selectedCredit, setSelectedCredit] = useState('');
  const [paymentType, setPaymentType] = useState<'my_card' | 'other_card'>('my_card');
  const [otherCardNumber, setOtherCardNumber] = useState('');
  const [payAmount, setPayAmount] = useState('');
  
  // States thông báo
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =================================================================
  // 1. TẢI DỮ LIỆU TỪ BACKEND
  // =================================================================
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Tải thông tin tài khoản của khách hàng
      const resAccounts = await fetch(`http://localhost:8080/taikhoan/${CUSTOMER_ID}`);
      const accData = await resAccounts.json();
      
      if (Array.isArray(accData)) {
        const deposits = accData.filter(a => !a.stk.startsWith('TD'));
        const credits = accData.filter(a => a.stk.startsWith('TD'));
        
        setDepositAccounts(deposits);
        setCreditAccounts(credits);

        // Đặt giá trị mặc định cho dropdown
        if (deposits.length > 0 && !selectedDeposit) setSelectedDeposit(deposits[0].stk);
        if (credits.length > 0 && !selectedCredit) setSelectedCredit(credits[0].stk);
      }

      // Tải lịch sử giao dịch (Lọc theo khách hàng này)
      const resTrans = await fetch("http://localhost:8080/api/baocao/giaodich-tindung");
      const transData = await resTrans.json();
      if (Array.isArray(transData)) {
        // Lọc các giao dịch thuộc về khách hàng hiện tại (Giả sử tên khớp)
        const myTrans = transData.filter(t => t.ten_khach_hang.includes(currentCustomer.TEN)).slice(0, 5);
        setTransactions(myTrans);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ngân hàng số:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =================================================================
  // 2. XỬ LÝ THANH TOÁN (GỌI API)
  // =================================================================
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      setErrorMsg('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    
    const targetCard = paymentType === 'my_card' ? selectedCredit : otherCardNumber;
    if (!targetCard) {
      setErrorMsg('Vui lòng chọn thẻ tín dụng cần thanh toán.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8080/api/giaodich/thanhtoan-the", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stk_gui: selectedDeposit,
          stk_tin_dung: targetCard,
          so_tien: Number(payAmount),
          ma_nv: 101 // ID mặc định của hệ thống/nhân viên duyệt online
        })
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "Giao dịch thất bại");

      // Thành công
      setIsSuccess(true);
      setPayAmount('');
      if (paymentType === 'other_card') setOtherCardNumber('');
      
      // Tải lại số dư và lịch sử ngay lập tức
      fetchDashboardData();

      setTimeout(() => {
        setIsSuccess(false);
      }, 4000);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatCardNumber = (stk: string) => stk.replace(/(.{4})/g, '$1 ').trim();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-200">
              <ShieldCheck className="text-white size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">KTSBank</h1>
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Personal Banking</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={fetchDashboardData} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Làm mới số dư">
              <RefreshCw className={`size-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors hidden sm:block">
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentCustomer.TEN}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Mã KH: {String(currentCustomer.MA_KH).padStart(3, '0')}</p>
              </div>
              <Avatar className="size-10 border-2 border-blue-100 flex items-center justify-center bg-blue-50">
                <AvatarFallback className="text-blue-700 font-bold text-sm bg-transparent">
                  {currentCustomer.TEN.split(' ').pop()?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <button className="text-slate-400 hover:text-red-500 transition-colors ml-2 hidden sm:block">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Xin chào, {currentCustomer.TEN.split(' ').pop()}! 👋</h2>
            <p className="text-slate-500 mt-1">Chào mừng bạn trở lại với KTSBank. Hôm nay bạn muốn làm gì?</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-200 gap-2 w-full sm:w-auto h-11">
            <ArrowRightLeft className="size-4" />
            Chuyển tiền nhanh
          </Button>
        </div>

        {/* Account Overviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Deposit Accounts Card */}
          <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Wallet className="w-40 h-40 -mt-8 -mr-8 text-blue-600" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Wallet className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tài khoản Thanh toán</h3>
            </div>
            
            <div className="space-y-4 relative z-10">
              {depositAccounts.length === 0 && !isLoading && (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">Bạn chưa có tài khoản gửi tiền nào.</div>
              )}
              {depositAccounts.map((acc, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Tài khoản VNĐ</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{formatCardNumber(acc.stk)}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(acc.so_du)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Accounts Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-6 lg:p-8 border border-slate-700 shadow-xl shadow-slate-900/20 relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <CreditCard className="w-40 h-40 -mt-8 -mr-8 text-white" />
            </div>
            <div className="absolute -bottom-24 -right-24 size-64 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-2xl text-indigo-300 backdrop-blur-md">
                <CreditCard className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Thẻ Tín dụng</h3>
            </div>
            
            <div className="space-y-4 relative z-10">
              {creditAccounts.length === 0 && !isLoading && (
                <div className="p-4 text-center text-slate-400 bg-white/5 rounded-xl border border-dashed border-white/10">Bạn chưa mở thẻ tín dụng nào.</div>
              )}
              {creditAccounts.map((acc, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Thẻ chi tiêu quốc tế</p>
                      <p className="text-sm text-slate-400 mt-1 font-mono tracking-widest">{formatCardNumber(acc.stk)}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] uppercase tracking-wider font-semibold rounded-full border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Dư nợ hiện tại</p>
                      <p className="text-xl font-bold text-red-300">{formatCurrency(acc.du_no_hien_tai)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Hạn mức khả dụng</p>
                      <p className="text-xl font-bold text-emerald-400">{formatCurrency(acc.han_muc_tin_dung - acc.du_no_hien_tai)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action & History Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Pay Credit Bill Form */}
          <div className="lg:col-span-1 bg-white rounded-[24px] p-6 lg:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
                <ArrowRightLeft className="size-5" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Thanh toán Dư Nợ</h3>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="size-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Giao dịch thành công!</h4>
                <p className="text-sm text-slate-500">Dư nợ tín dụng đã được cập nhật ngay lập tức.</p>
                <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-6 w-full rounded-xl">Thực hiện giao dịch khác</Button>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-5">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                  </div>
                )}

                {/* Payment Type Toggle */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl mb-4 border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setPaymentType('my_card')}
                    className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                      paymentType === 'my_card' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    Thanh toán thẻ của tôi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('other_card')}
                    className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                      paymentType === 'other_card' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    Thanh toán thẻ khác
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Từ tài khoản nguồn</label>
                  <select 
                    value={selectedDeposit}
                    onChange={(e) => setSelectedDeposit(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {depositAccounts.map(a => (
                      <option key={a.stk} value={a.stk}>{a.stk} - Khả dụng: {formatCurrency(a.so_du - 50000)}</option>
                    ))}
                    {depositAccounts.length === 0 && <option value="">Không có tài khoản nguồn</option>}
                  </select>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                  <div className="bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
                    <ArrowRightLeft className="size-4 text-slate-400 rotate-90" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Đến thẻ tín dụng</label>
                  {paymentType === 'my_card' ? (
                    <select 
                      value={selectedCredit}
                      onChange={(e) => setSelectedCredit(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                      {creditAccounts.map(a => (
                        <option key={a.stk} value={a.stk}>{a.stk} (Nợ: {formatCurrency(a.du_no_hien_tai)})</option>
                      ))}
                      {creditAccounts.length === 0 && <option value="">Không có thẻ tín dụng</option>}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Nhập mã thẻ (VD: TD001122)"
                      value={otherCardNumber}
                      onChange={(e) => setOtherCardNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-all placeholder:font-sans"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Số tiền thanh toán</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full pl-4 pr-14 py-3 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400">VND</span>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting || !payAmount || !selectedDeposit || (paymentType === 'my_card' && !selectedCredit)} className="w-full pt-1 pb-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-[15px] shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none">
                  {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Xác nhận thanh toán'}
                </Button>
              </form>
            )}
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2 bg-white rounded-[24px] p-6 lg:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <History className="size-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Lịch sử giao dịch tín dụng</h3>
              </div>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Xem tất cả</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 pl-2">Thời gian</th>
                    <th className="pb-4">Loại giao dịch</th>
                    <th className="pb-4">Tài khoản</th>
                    <th className="pb-4 text-right pr-2">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-500">Đang tải...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        <History className="size-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm">Bạn chưa có giao dịch tín dụng nào.</p>
                      </td>
                    </tr>
                  ) : transactions.map((tx, idx) => {
                    const isPayment = tx.loai_gd?.toLowerCase().includes('trả') || tx.loai_gd?.toLowerCase().includes('thanh toán');
                    const amountText = isPayment ? `+${formatCurrency(tx.so_tien)}` : `-${formatCurrency(tx.so_tien)}`;
                    const amountClass = isPayment ? 'text-emerald-500' : 'text-slate-800';
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 pl-2">
                          <p className="text-sm font-medium text-slate-700">{new Date(tx.thoi_gian).toLocaleDateString('vi-VN')}</p>
                          <p className="text-[12px] text-slate-400 mt-0.5">{new Date(tx.thoi_gian).toLocaleTimeString('vi-VN')}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <p className="text-[14px] font-semibold text-slate-800">{tx.loai_gd}</p>
                          <p className="text-[12px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="size-3.5" /> Thành công
                          </p>
                        </td>
                        <td className="py-4 text-[13px] font-mono font-medium text-slate-500 whitespace-nowrap">
                          *{tx.tai_khoan_tin_dung.slice(-4)}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <p className={`text-[15px] font-bold ${amountClass}`}>
                            {amountText}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}