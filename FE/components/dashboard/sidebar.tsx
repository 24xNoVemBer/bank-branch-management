"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  ArrowLeftRight,
  FileText,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRole } from "./role-context"

const menuItems = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Khách hàng", href: "/quanly_khach_hang", icon: Users },
  { name: "Nhân viên", href: "/quanly_nhan_vien", icon: UserCog },
  { name: "Tài khoản", href: "/tao_tai_khoan", icon: CreditCard },
  { name: "Giao dịch", href: "/giao_dich", icon: ArrowLeftRight },
  { name: "Thống kê", href: "/bao_cao", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { currentRole } = useRole()

  const filteredMenuItems = menuItems.filter(item => {
    if (['Thống kê', 'Nhân viên'].includes(item.name)) {
      return currentRole === 'Quản lý';
    }
    if (item.name === 'Tài khoản') {
      return currentRole === 'Quản lý' || currentRole === 'Kinh doanh';
    }
    return true; // "Giao dịch", "Khách hàng", "Tổng quan"
  });

  return (
    <aside className="w-64 bg-[#0d213b] text-slate-300 flex-col shrink-0 hidden lg:flex">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-[80px] items-center gap-3 border-b border-white/10 px-6 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#2563eb]">
            <Building2 className="size-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-base font-semibold text-white leading-tight">BankAdmin</h1>
            <p className="text-xs text-slate-400 mt-0.5">Hệ thống quản lý</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("size-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-5 shrink-0">
          <p className="text-xs text-slate-400">© 2026 BankAdmin</p>
        </div>
      </div>
    </aside>
  )
}
