"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "super-admin" | "institution" | "student"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/super-admin/login")
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push("/unauthorized")
      return
    }
  }, [session, status, router, requiredRole])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
