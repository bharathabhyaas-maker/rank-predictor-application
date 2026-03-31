"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, CheckCircle, Clock, Users, BellRing } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  metadata: any
  createdAt: string
  updatedAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INSTITUTION_REGISTRATION':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'INSTITUTION_ONBOARDING':
        return <Users className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSTITUTION_REGISTRATION':
        return 'text-blue-700'
      case 'INSTITUTION_ONBOARDING':
        return 'text-blue-700'
      default:
        return 'text-gray-700'
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
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Notifications</h1>
            <Link 
              href="/admin/dashboard" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-gray-900">No Notifications</CardTitle>
                <p className="text-gray-600">You're all caught up! No new notifications to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
                <div className="text-sm text-gray-600">
                  {notifications.filter(n => !n.read).length} unread notifications
                </div>
              </div>

              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-lg ${
                    notification.read 
                      ? 'opacity-75 bg-gray-50' 
                      : 'bg-white border-l-4 border-blue-500'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.read 
                            ? 'bg-gray-200' 
                            : 'bg-blue-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className={`text-lg font-semibold ${getTypeColor(notification.type)}`}>
                            {notification.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        {notification.read && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {notification.message}
                    </div>
                    
                    {notification.metadata && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Institution Details:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {notification.metadata.institutionName && (
                            <div>
                              <span className="font-medium">Name:</span> {notification.metadata.institutionName}
                            </div>
                          )}
                          {notification.metadata.institutionType && (
                            <div>
                              <span className="font-medium">Type:</span> {notification.metadata.institutionType}
                            </div>
                          )}
                          {notification.metadata.fullName && (
                            <div>
                              <span className="font-medium">Contact:</span> {notification.metadata.fullName}
                            </div>
                          )}
                          {notification.metadata.email && (
                            <div>
                              <span className="font-medium">Email:</span> {notification.metadata.email}
                            </div>
                          )}
                          {notification.metadata.phone && (
                            <div>
                              <span className="font-medium">Phone:</span> {notification.metadata.phone}
                            </div>
                          )}
                          {notification.metadata.city && (
                            <div>
                              <span className="font-medium">City:</span> {notification.metadata.city}
                            </div>
                          )}
                          {notification.metadata.studentCount && (
                            <div>
                              <span className="font-medium">Students:</span> {notification.metadata.studentCount}
                            </div>
                          )}
                          {notification.metadata.examTypes && notification.metadata.examTypes.length > 0 && (
                            <div>
                              <span className="font-medium">Exams:</span> {notification.metadata.examTypes.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
