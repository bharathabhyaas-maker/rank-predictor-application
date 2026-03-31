'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { Shield, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [stage, setStage] = useState<'login' | 'forgot-password' | 'verify-otp'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For admin users (super-admin, admin, analyst, manager), use generic login
    // The API will auto-detect the user's role based on email
    const success = await login(email, password, 'generic')
    
    if (success) {
      // Redirect based on user role (will be determined by the API response)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userRole = user.role
      
      switch (userRole) {
        case 'super-admin':
          router.push('/admin/dashboard')
          break
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'analyst':
          router.push('/admin/dashboard')
          break
        case 'manager':
          router.push('/admin/dashboard')
          break
        default:
          router.push('/admin/dashboard')
      }
    } else {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For demo purposes, generate OTP for any email
    // In production, this would check if email exists in database
    if (email) {
      // Generate mock OTP
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(mockOtp)
      setSuccessMessage(`OTP sent to ${email}. Demo OTP: ${mockOtp}`)
      setStage('verify-otp')
    } else {
      setError('Please enter a valid email address')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (otp === generatedOtp) {
      setSuccessMessage('OTP verified! You can now reset your password.')
      // In a real app, this would lead to a password reset form
      // For demo, redirect to login
      setTimeout(() => {
        setStage('login')
        setOtp('')
        setEmail('')
        setPassword('')
        setSuccessMessage('')
      }, 2000)
    } else {
      setError('Invalid OTP. Please try again.')
    }
    setLoading(false)
  }

  if (stage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center justify-center gap-2 text-white">
                <Shield className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold">RankPredict</span>
              </div>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Super Admin</h1>
            <p className="text-purple-200">Create and manage prediction templates</p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <button
              onClick={() => setStage('forgot-password')}
              className="w-full mt-4 text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
            >
              Forgot Password?
            </button>

                      </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (stage === 'forgot-password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => {
                setStage('login')
                setEmail('')
                setError('')
                setSuccessMessage('')
              }}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="text-center mb-8">
              <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-purple-200 text-sm">Enter your email to receive a reset code</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-200">{successMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP to Email'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'verify-otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => {
                setStage('login')
                setEmail('')
                setOtp('')
                setError('')
                setSuccessMessage('')
              }}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="text-center mb-8">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-purple-200 text-sm">Enter the OTP sent to {email}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-200">{successMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>

            <p className="text-center text-slate-400 text-xs mt-4">
              Didn't receive code?{' '}
              <button
                onClick={() => {
                  setStage('forgot-password')
                  setOtp('')
                  setSuccessMessage('')
                }}
                className="text-purple-400 hover:text-purple-300"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }
}
