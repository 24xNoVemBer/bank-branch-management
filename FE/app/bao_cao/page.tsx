"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, Users, CreditCard, ArrowLeftRight, FileText, 
  LayoutDashboard, UserCog, Building2, User, Settings, LogOut, Coins, Activity, TrendingUp, Trophy, ArrowUpRight,
  TrendingDown, Search, ArrowDown, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function AnalyticsReports() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeTab, setActiveTab] = useState<'salary' | 'transactions' | 'debt' | 'top10'>('salary');

  // ==========================================
  // STATE LƯU TRỮ DỮ LIỆU TỪ BACKEND
  // ==========================================
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [transData, setTransData] = useState<any[]>([]);
  const [debtData, setDebtData] = useState<any[]>([]);
  const [top10Data, setTop10Data] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // States cho các bộ lọc (Filters)
  const [searchDebt, setSearchDebt] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ==========================================
  // HÀM GỌI ĐỒNG LOẠT 4 API BÁO CÁO
  // ==========================================
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [salRes, transRes, debtRes, topRes] = await Promise.all([
        fetch("http://localhost:8080/api/baocao/tinhluong"),
        fetch("http://localhost:8080/api/baocao/giaodich-tindung"),
        fetch("http://localhost:8080/api/baocao/no-tin-dung"),
        fetch("http://localhost:8080/api/baocao/top-khach-hang")
      ]);

      const sal = await salRes.json();
      const trans = await transRes.json();
      const debt = await debtRes.json();
      const top = await topRes.json();

      setSalaryData(Array.isArray(sal) ? sal : []);
      setTransData(Array.isArray(trans) ? trans : []);
      setDebtData(Array.isArray(debt) ? debt : []);
      setTop10Data(Array.isArray(top) ? top : []);
      
      // Lấy tổng nhân viên có phát sinh doanh số từ bảng lương
      if (Array.isArray(sal)) setTotalEmployees(sal.length);

    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lọc giao dịch theo ngày (Gọi lại API với Query Params)
  const fetchFilteredTransactions = async () => {
    try {
      setIsLoading(true);
      let url = "http://localhost:8080/api/baocao/giaodich-tindung";
      const params = new URLSearchParams();
      if (startDate) params.append('tu_ngay', startDate);
      if (endDate) params.append('den_ngay', endDate);
      if (startDate || endDate) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setTransData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi lọc giao dịch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Lọc trực tiếp dữ liệu nợ xấu trên Frontend
  const filteredDebtData = debtData.filter(item => {
    const term = searchDebt.toLowerCase();
    const name = (item.ten_khach_hang || '').toLowerCase();
    const stk = (item.so_tai_khoan || '').toLowerCase();
    return name.includes(term) || stk.includes(term);
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
        <div className="mb-6 flex items-center justify-between">
           <div>
             <h1 className="text-[22px] font-bold text-[#14234b]">Thống kê & Phân tích</h1>
             <p className="text-[13px] text-slate-500 mt-0.5">Truy xuất dữ liệu trực tiếp từ Database.</p>
           </div>
           <button 
             onClick={fetchAllData}
             className="p-2 text-slate-400 hover:text-[#1464b4] hover:bg-slate-50 rounded-full transition-all bg-white border border-slate-200"
             title="Làm mới báo cáo"
           >
             <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin text-[#1464b4]" : ""}`} />
           </button>
        </div>
              
            {/* Top Row: Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none duration-300">
                   <TrendingUp className="w-24 h-24 -mt-4 -mr-4 text-[#1464b4]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-sm font-medium text-slate-500">Tổng Dư Nợ Tồn Đọng</h3>
                  <div className="text-2xl font-bold text-[#14234b]">
                    {debtData.reduce((sum, item) => sum + (Number(item.du_no_hien_tai) || 0), 0).toLocaleString('vi-VN')} VND
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none duration-300">
                   <Users className="w-24 h-24 -mt-4 -mr-4 text-[#1464b4]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-50/70 rounded-xl flex items-center justify-center text-[#1464b4]">
                    <UserCog className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-sm font-medium text-slate-500">Nhân Viên Có Doanh Số</h3>
                  <div className="text-2xl font-bold text-[#14234b]">{totalEmployees.toLocaleString('vi-VN')}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none duration-300">
                   <Activity className="w-24 h-24 -mt-4 -mr-4 text-[#1464b4]" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-sm font-medium text-slate-500">Số Giao Dịch Tín Dụng</h3>
                  <div className="text-2xl font-bold text-[#14234b]">{transData.length}</div>
                </div>
              </div>
            </div>

            {/* TAB LIST */}
            <div className="flex space-x-2 border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('salary')}
                className={`py-3 px-5 text-[14px] font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'salary' ? 'border-[#1464b4] text-[#1464b4]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                 <UserCog className="w-4 h-4" /> Thống kê Lương
              </button>
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`py-3 px-5 text-[14px] font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'transactions' ? 'border-[#1464b4] text-[#1464b4]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                 <ArrowLeftRight className="w-4 h-4" /> Giao dịch Tín dụng
              </button>
              <button 
                onClick={() => setActiveTab('debt')}
                className={`py-3 px-5 text-[14px] font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'debt' ? 'border-[#1464b4] text-[#1464b4]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                 <TrendingDown className="w-4 h-4" /> Dư nợ Tín dụng
              </button>
              <button 
                onClick={() => setActiveTab('top10')}
                className={`py-3 px-5 text-[14px] font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'top10' ? 'border-[#1464b4] text-[#1464b4]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                 <Trophy className="w-4 h-4" /> Top 10 Khách hàng
              </button>
            </div>

            {/* TABS CONTENT */}
            <div className="bg-white border text-sm border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] animate-in fade-in duration-300">
              
              {/* TAB 1: THỐNG KÊ LƯƠNG */}
              {activeTab === 'salary' && (
                <div>
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-base font-bold text-[#14234b] flex items-center gap-2">
                       Thống kê Lương & KPI Nhân viên
                    </h2>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => window.open("http://localhost:8080/api/baocao/tinhluong/csv", "_blank")}
                        className="px-4 py-1.5 bg-[#1464b4] text-white font-medium rounded-lg hover:bg-[#0f4d8a] transition-colors"
                      >
                        Tải CSV
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                          <th className="px-6 py-4 border-b border-slate-200">Mã NV</th>
                          <th className="px-6 py-4 border-b border-slate-200">Tên Nhân Viên</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Thưởng Tín Dụng (VND)</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Thưởng Gửi Tiền (VND)</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Tổng Thưởng (VND)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isLoading ? (<tr><td colSpan={5} className="p-8 text-center text-slate-500">Đang tải...</td></tr>) : 
                          salaryData.length === 0 ? (<tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có dữ liệu tháng này.</td></tr>) :
                          salaryData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-mono font-medium text-[#1464b4]">
                                NV{String(item.ma_nv || item.MA_NV).padStart(3, '0')}
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-800">
                                {item.ten_nhan_vien || item.ten || item.TEN_NHAN_VIEN}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600">
                                {Number(item.thuong_tin_dung || item.THUONG_TIN_DUNG || 0).toLocaleString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600">
                                {Number(item.thuong_gui_tien || item.THUONG_GUI_TIEN || 0).toLocaleString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-[#14234b]">
                                {Number(item.tong_thuong_thang || item.TONG_THUONG_THANG || 0).toLocaleString('vi-VN')}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: GIAO DỊCH TÍN DỤNG */}
              {activeTab === 'transactions' && (
                <div>
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-base font-bold text-[#14234b] flex items-center gap-2">
                       Lịch sử Giao dịch Tín dụng
                    </h2>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1464b4]" 
                      />
                      <span>-</span>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1464b4]" 
                      />
                      <button 
                        onClick={fetchFilteredTransactions}
                        className="px-4 py-1.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 ml-2 transition-colors"
                      >
                        Lọc
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                          <th className="px-6 py-4 border-b border-slate-200">Thời gian</th>
                          <th className="px-6 py-4 border-b border-slate-200">Khách Hàng</th>
                          <th className="px-6 py-4 border-b border-slate-200">Số TK Tín dụng</th>
                          <th className="px-6 py-4 border-b border-slate-200">Loại Giao Dịch</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Số tiền (VND)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isLoading ? (<tr><td colSpan={5} className="p-8 text-center text-slate-500">Đang tải...</td></tr>) : 
                          transData.length === 0 ? (<tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có giao dịch trong khoảng thời gian này.</td></tr>) :
                          transData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-6 py-4 text-slate-500">{new Date(item.thoi_gian).toLocaleString('vi-VN')}</td>
                              <td className="px-6 py-4 font-semibold text-[#14234b]">{item.ten_khach_hang}</td>
                              <td className="px-6 py-4 font-mono text-slate-600">{item.tai_khoan_tin_dung}</td>
                              <td className="px-6 py-4 text-slate-600">{item.loai_gd}</td>
                              <td className="px-6 py-4 text-right font-bold text-red-600">{Number(item.so_tien).toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: DƯ NỢ TÍN DỤNG */}
              {activeTab === 'debt' && (
                <div>
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-base font-bold text-[#14234b] flex items-center gap-2">
                       Danh sách Nợ Xấu / Dư nợ Tín dụng
                    </h2>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm theo tên/số thẻ..." 
                        value={searchDebt}
                        onChange={(e) => setSearchDebt(e.target.value)}
                        className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1464b4] text-sm" 
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                          <th className="px-6 py-4 border-b border-slate-200">Số TK Tín dụng</th>
                          <th className="px-6 py-4 border-b border-slate-200">Khách Hàng</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Hạn mức (VND)</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">
                             <div className="flex items-center justify-end gap-1 text-red-600">
                               Tổng nợ tồn đọng <ArrowDown className="w-4 h-4" />
                             </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isLoading ? (<tr><td colSpan={4} className="p-8 text-center text-slate-500">Đang tải...</td></tr>) : 
                          filteredDebtData.length === 0 ? (<tr><td colSpan={4} className="p-8 text-center text-slate-500">Không tìm thấy dư nợ phù hợp.</td></tr>) :
                          filteredDebtData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-mono font-medium text-[#1464b4]">{item.so_tai_khoan}</td>
                              <td className="px-6 py-4 font-semibold text-slate-800">{item.ten_khach_hang}</td>
                              <td className="px-6 py-4 text-right text-slate-600">{Number(item.han_muc_tin_dung).toLocaleString('vi-VN')}</td>
                              <td className="px-6 py-4 text-right font-bold text-red-600 bg-red-50/30">{Number(item.du_no_hien_tai).toLocaleString('vi-VN')}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TOP 10 KHÁCH HÀNG */}
              {activeTab === 'top10' && (
                <div>
                  <div className="p-5 border-b border-slate-100 bg-white">
                    <h2 className="text-base font-bold text-[#14234b] flex items-center gap-2">
                       Top 10 Khách Hàng Gửi Tiền (VIP)
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                          <th className="px-6 py-4 border-b border-slate-200 text-center w-24">Hạng</th>
                          <th className="px-6 py-4 border-b border-slate-200">Tên Khách Hàng</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Tổng Số Dư Đang Gửi (VND)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {isLoading ? (<tr><td colSpan={3} className="p-8 text-center text-slate-500">Đang tải...</td></tr>) : 
                          top10Data.length === 0 ? (<tr><td colSpan={3} className="p-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr>) :
                          top10Data.map((customer, index) => {
                            const rank = index + 1;
                            return(
                              <tr key={customer.ma_kh} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="px-6 py-4 text-center">
                                  {rank <= 3 ? (
                                    <div className={`inline-flex items-center justify-center w-[28px] h-[28px] rounded-full font-bold shadow-sm ${
                                      rank === 1 ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 border border-amber-300 shadow-amber-200/50' :
                                      rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 border border-slate-300 shadow-slate-200/50' :
                                      'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-900 border border-orange-300 shadow-orange-200/50'
                                    } transition-transform group-hover:scale-110`}>
                                      {rank === 1 ? <Trophy className="w-3.5 h-3.5" /> : <span className="text-[12px]">{rank}</span>}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-semibold text-sm group-hover:text-slate-600 transition-colors">{rank}</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-[#14234b] text-[14px]">
                                    {customer.ten_khach_hang} <span className="text-xs text-slate-400 font-normal ml-2">(Mã KH: {customer.ma_kh})</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="font-bold text-[#1464b4] text-[14px]">
                                    {Number(customer.tong_tien_dang_gui).toLocaleString('vi-VN')}
                                  </div>
                                </td>
                              </tr>
                          )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

      </div>
    </DashboardLayout>
  );
}