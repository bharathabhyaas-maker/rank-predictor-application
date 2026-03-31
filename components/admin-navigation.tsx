"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Database, Users, Settings, FileText, Brain, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Templates", href: "/admin/exams/all", icon: Brain },
  { name: "Create", href: "/admin/exams/new", icon: FileText },
  { name: "Institutions", href: "/admin/users", icon: Users },
  { name: "Team", href: "/admin/team", icon: Users },
]

export default function AdminNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard" prefetch={false} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">RankPredict</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
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
            <Link href="/" prefetch={false}>
              <Button variant="outline" size="sm" className="bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Exit Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
