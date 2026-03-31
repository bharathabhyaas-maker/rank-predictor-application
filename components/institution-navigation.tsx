"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2, Link2, LogOut, Home, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "Dashboard", href: "/institution/dashboard", icon: Home },
  { name: "Student Links", href: "/institution/links", icon: Link2 },
  { name: "Predictions", href: "/institution/predictions", icon: Building2 },
  { name: "Team", href: "/institution/team", icon: Users },
]

export default function InstitutionNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/institution/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">RankPredict</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/institution/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-transparent" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
