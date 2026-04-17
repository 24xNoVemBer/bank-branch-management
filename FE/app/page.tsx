"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, ArrowLeftRight, TrendingUp, RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const [customerCount, setCustomerCount] = useState<string | number>("Đang tải...")
  const [totalDebt, setTotalDebt] = useState<string>("Đang tải...")
  
  // 👉 ĐÃ THÊM 2 BIẾN MỚI CHO TỔNG TIỀN GỬI & TK MỚI
  const [totalDeposit, setTotalDeposit] = useState<string>("Đang tải...")
  const [newAccounts, setNewAccounts] = useState<string | number>("Đang tải...")
  
  const [loading, setLoading] = useState(false)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  // =================================================================
  // HÀM LẤY DỮ LIỆU THẬT TỪ BACKEND ĐỂ ĐỔ LÊN DASHBOARD
  // =================================================================
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Lấy tổng số khách hàng
      const resKh = await fetch("http://localhost:8080/khachhang");
      const dataKh = await resKh.json();
      setCustomerCount(Array.isArray(dataKh) ? dataKh.length : 0);

      // 2. Lấy Tổng dư nợ tín dụng
      const resNo = await fetch("http://localhost:8080/api/baocao/no-tin-dung");
      const dataNo = await resNo.json();
      if (Array.isArray(dataNo)) {
        const sumDebt = dataNo.reduce((acc, curr) => acc + (Number(curr.du_no_hien_tai) || 0), 0);
        setTotalDebt(new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sumDebt));
      }

      // 3. 👉 GỌI API MỚI ĐỂ LẤY TỔNG TIỀN GỬI VÀ TK MỚI
      const resThongKe = await fetch("http://localhost:8080/api/thongke/tongquan");
      const dataThongKe = await resThongKe.json();
      if (!dataThongKe.error) {
        setTotalDeposit(new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataThongKe.tong_tien_gui || 0));
        setNewAccounts(dataThongKe.tk_moi_trong_thang || 0);
      }

      // 4. Lấy 4 Giao dịch gần đây nhất
      const resGd = await fetch("http://localhost:8080/api/baocao/giaodich-tindung");
      const dataGd = await resGd.json();
      if (Array.isArray(dataGd) && dataGd.length > 0) {
        const recent = dataGd.slice(0, 4).map(gd => {
          const date = new Date(gd.thoi_gian);
          return {
            action: `${gd.ten_khach_hang} - ${gd.loai_gd} ${new Intl.NumberFormat('vi-VN').format(gd.so_tien)}đ`,
            time: date.toLocaleString('vi-VN')
          };
        });
        setRecentActivities(recent);
      } else {
        setRecentActivities([{ action: "Chưa có giao dịch nào được ghi nhận", time: "" }]);
      }

    } catch (err) {
      console.error("Lỗi mất kết nối Backend:", err);
      setCustomerCount("Lỗi kết nối");
      setTotalDebt("Lỗi kết nối");
      setTotalDeposit("Lỗi kết nối");
      setNewAccounts("Lỗi kết nối");
      setRecentActivities([{ action: "Lỗi kết nối đến máy chủ", time: "" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [])

  const stats = [
    {
      title: "Tổng số Khách hàng",
      value: customerCount, 
      change: "+Thực tế",
      subtext: "từ cơ sở dữ liệu",
      icon: Users,
    },
    {
      title: "Tổng Tiền Gửi",
      value: totalDeposit, // 👉 TRUYỀN DỮ LIỆU THẬT VÀO ĐÂY
      change: "+Đã cập nhật",
      subtext: "toàn hệ thống",
      icon: CreditCard,
    },
    {
      title: "TK Mới Trong Tháng",
      value: newAccounts, // 👉 TRUYỀN DỮ LIỆU THẬT VÀO ĐÂY
      change: "Tháng " + (new Date().getMonth() + 1),
      subtext: "mở thành công",
      icon: ArrowLeftRight,
    },
    {
      title: "Tổng Dư Nợ Tồn Đọng",
      value: totalDebt, 
      change: "+Cập nhật",
      subtext: "theo thời gian thực",
      icon: TrendingUp,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* NÚT LÀM MỚI DỮ LIỆU */}
        <div className="flex justify-end">
          <button 
            onClick={fetchDashboardData} 
            disabled={loading}
            className="flex items-center gap-2 bg-[#1464b4] text-white px-4 py-2 rounded-lg hover:bg-[#0f4d8a] disabled:bg-[#1464b4]/60 transition-all shadow-sm text-sm font-medium"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>

        {/* Welcome Card */}
        <WelcomeCard />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-[#1464b4] font-medium">{stat.change}</span> {stat.subtext}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động giao dịch gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm text-card-foreground font-medium">{activity.action}</p>
                    <span className="text-xs text-muted-foreground ml-4 shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Thêm Khách hàng", href: "/quanly_khach_hang" },
                  { label: "Tài khoản mới", href: "/tao_tai_khoan" },
                  { label: "Tạo Giao Dịch", href: "/giao_dich" },
                  { label: "Xem Thống kê", href: "/bao_cao" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center justify-center w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-[#1464b4] hover:text-white"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}