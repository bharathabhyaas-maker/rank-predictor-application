'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, ChevronRight, Lock, Sparkles, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect } from "react"
import RealTimeNotifications from "@/components/real-time-notifications"

function AdminLandingContent() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard')
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <RealTimeNotifications />
      <div className="max-w-2xl w-full">
        <div className="border-2 border-purple-200 rounded-2xl p-12 text-center bg-white/80 backdrop-blur-sm shadow-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Super Admin Portal
          </h1>

          <p className="text-muted-foreground mb-8 text-balance leading-relaxed">
            Welcome to the template creation system. Create AI-powered prediction templates 
            and sell them to institutions. Configure prompts, datasets, and conditional logic 
            that institutions can deploy for their students.
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 border border-purple-200 font-mono text-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700">CREATE_TEMPLATES</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 border border-indigo-200 font-mono text-sm">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-700">SELL_TO_INSTITUTIONS</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <Link href="/admin/dashboard">
              <Button size="lg" className="font-mono bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                ACCESS_DASHBOARD
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/admin/onboarding">
              <Button size="lg" className="font-mono bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                CLEANUP_DATABASE
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/admin/notifications">
              <Button size="lg" className="font-mono bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                VIEW_NOTIFICATIONS
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/admin/onboarding">
              <Button size="lg" className="font-mono bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                MANAGE_ONBOARDING
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center text-xs font-mono text-muted-foreground">
            SUPER_ADMIN: Create templates, manage onboarding requests, and supervise the entire system.
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLandingPage() {
  return (
    <ProtectedRoute requiredRole="super-admin">
      <AdminLandingContent />
    </ProtectedRoute>
  )
}
