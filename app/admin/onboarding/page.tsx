"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Phone, MapPin, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import RealTimeNotifications from '@/components/real-time-notifications'

interface InstitutionOnboarding {
  id: string
  institutionName: string
  contactPerson: string
  email: string
  mobile?: string
  location?: string
  interestedCourses: string[]
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export default function InstitutionOnboardingPage() {
  const [onboardings, setOnboardings] = useState<InstitutionOnboarding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOnboardings()
  }, [])

  const fetchOnboardings = async () => {
    try {
      const response = await fetch('/api/onboarding')
      if (response.ok) {
        const data = await response.json()
        setOnboardings(data)
      }
    } catch (error) {
      console.error('Error fetching onboarding records:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setOnboardings(prev => 
          prev.map(onboarding => 
            onboarding.id === id 
              ? { ...onboarding, status: status as any }
              : onboarding
          )
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONVERTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="w-4 h-4" />
      case 'CONTACTED':
        return <Clock className="w-4 h-4" />
      case 'CONVERTED':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Institution Onboarding Requests</h1>
            <div className="flex items-center gap-4">
              <RealTimeNotifications />
              <Link 
                href="/admin/dashboard" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : onboardings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-gray-900">No Onboarding Requests</CardTitle>
                <p className="text-gray-600">No institution onboarding requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
                <div className="text-sm text-gray-600">
                  {onboardings.filter(o => o.status === 'NEW').length} new requests
                </div>
              </div>

              {onboardings.map((onboarding) => (
                <Card 
                  key={onboarding.id} 
                  className={`transition-all hover:shadow-lg ${
                    onboarding.status === 'NEW' 
                      ? 'border-l-4 border-blue-500 bg-blue-50' 
                      : 'bg-white'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {onboarding.institutionName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Contact: {onboarding.contactPerson}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(onboarding.status)}`}>
                        {getStatusIcon(onboarding.status)}
                        {onboarding.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{onboarding.email}</span>
                      </div>
                      {onboarding.mobile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{onboarding.mobile}</span>
                        </div>
                      )}
                      {onboarding.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{onboarding.location}</span>
                        </div>
                      )}
                      {onboarding.interestedCourses.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 md:col-span-2 lg:col-span-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{onboarding.interestedCourses.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-gray-500">
                        Submitted: {formatDate(onboarding.createdAt)}
                      </div>
                      <div className="flex gap-2">
                        {onboarding.status === 'NEW' && (
                          <>
                            <button
                              onClick={() => updateStatus(onboarding.id, 'CONTACTED')}
                              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                            >
                              Mark Contacted
                            </button>
                            <button
                              onClick={() => updateStatus(onboarding.id, 'CONVERTED')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(onboarding.id, 'REJECTED')}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {onboarding.status === 'CONTACTED' && (
                          <>
                            <button
                              onClick={() => updateStatus(onboarding.id, 'CONVERTED')}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(onboarding.id, 'REJECTED')}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
