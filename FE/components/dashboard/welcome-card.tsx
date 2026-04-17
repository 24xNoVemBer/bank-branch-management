import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Shield } from "lucide-react"

export function WelcomeCard() {
  return (
    <Card className="border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary-foreground sm:text-3xl text-balance">
          Chào mừng đến với Hệ thống Quản trị Ngân hàng
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Quản lý hoạt động ngân hàng hiệu quả và an toàn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Đa chi nhánh</p>
              <p className="text-xs text-primary-foreground/70">Quản lý</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/20">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Phân tích</p>
              <p className="text-xs text-primary-foreground/70">Thời gian thực</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/20">
              <Shield className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Bảo mật</p>
              <p className="text-xs text-primary-foreground/70">Cấp ngân hàng</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
