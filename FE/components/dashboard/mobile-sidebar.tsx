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
import { SheetClose } from "@/components/ui/sheet"
import { useRole } from "./role-context"

const menuItems = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Khách hàng", href: "/quanly_khach_hang", icon: Users },
  { name: "Nhân viên", href: "/employees", icon: UserCog },
  { name: "Tài khoản", href: "/accounts", icon: CreditCard },
  { name: "Giao dịch", href: "/transactions", icon: ArrowLeftRight },
  { name: "Thống kê", href: "/reports", icon: FileText },
]

export function MobileSidebar() {
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
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Building2 className="size-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-sidebar-foreground">BankAdmin</h1>
          <p className="text-xs text-sidebar-foreground/70">Hệ thống quản lý</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <SheetClose asChild key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            </SheetClose>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/60">© 2026 BankAdmin</p>
      </div>
    </div>
  )
}
