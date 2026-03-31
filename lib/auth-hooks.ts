"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  const logout = async () => {
    await router.push("/auth/super-admin/login")
  }

  const requireAuth = (requiredRole?: string) => {
    if (isLoading) return null
    
    if (!isAuthenticated) {
      router.push("/auth/super-admin/login")
      return null
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/unauthorized")
      return null
    }

    return user
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    requireAuth
  }
}
