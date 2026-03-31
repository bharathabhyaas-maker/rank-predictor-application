"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  role: "super-admin" | "institution" | "student"
  institutionId?: string
  institution?: {
    id: string
    name: string
    email: string
    location: string
    phone?: string
    plan: string
    status: string
    institutionId: string
  }
}

export interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem("user")
    console.log('🔍 Auth Context - Loading user from localStorage...')
    console.log('🔍 Auth Context - Saved user data:', savedUser)
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      console.log('🔍 Auth Context - Parsed user data:', parsedUser)
      console.log('🔍 Auth Context - User institution:', parsedUser?.institution)
      console.log('🔍 Auth Context - User institutionId:', parsedUser?.institutionId)
      setUser(parsedUser)
    } else {
      console.log('🔍 Auth Context - No saved user found in localStorage')
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log('🔐 Auth Context - Starting login for:', email, 'Role:', role)
      
      // Call API to authenticate
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })

      console.log('🔐 Auth Context - Login response status:', response.status)
      console.log('🔐 Auth Context - Login response headers:', response.headers.get('content-type'))

      if (!response.ok) {
        console.log('🔐 Auth Context - Login failed with status:', response.status)
        return false
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('🔐 Auth Context - Response is not JSON, content-type:', contentType)
        const text = await response.text()
        console.error('🔐 Auth Context - Response text:', text.substring(0, 200))
        return false
      }

      const data = await response.json()
      console.log('🔐 Auth Context - Login response data:', data)
      
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as "super-admin" | "institution" | "student",
        institutionId: data.user.institutionId,
        institution: data.institution || undefined
      }

      console.log('🔐 Auth Context - Constructed user data:', userData)
      console.log('🔐 Auth Context - User institution:', userData.institution)
      console.log('🔐 Auth Context - User institutionId:', userData.institutionId)

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      console.log('🔐 Auth Context - User data stored in localStorage')
      
      return true
    } catch (error) {
      console.error('🔐 Auth Context - Login failed:', error)
      console.error('🔐 Auth Context - Error type:', typeof error)
      console.error('🔐 Auth Context - Error message:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
