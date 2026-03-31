'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { Building2, Lock, ArrowLeft } from 'lucide-react'

export default function InstitutionLoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call the real login API
      const success = await login(email, password, 'institution')
      
      if (success) {
        router.push('/institution/dashboard')
      } else {
        setError('Invalid Email or Password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2 text-teal-900">
              <Building2 className="w-8 h-8 text-teal-600" />
              <span className="text-2xl font-bold">RankPredict</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-teal-900 mb-2">Institution Portal</h1>
          <p className="text-teal-700">Manage prediction templates and student links</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-teal-200 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-teal-900 mb-2">Email</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-teal-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., school@example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-teal-200 rounded-lg text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-900 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-teal-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 border-2 border-teal-200 rounded-lg text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login to Institution Portal'}
            </Button>
          </form>
        </div>

        <p className="text-center text-teal-700 text-sm mt-6">
          <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            Back to Home
          </Link>
          {' • '}
          <Link href="/onboarding" className="text-teal-600 hover:text-teal-700 font-medium">
            New Institution Registration
          </Link>
        </p>
      </div>
    </div>
  )
}
