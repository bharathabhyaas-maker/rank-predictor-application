"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  metadata: any
  createdAt: string
}

export default function RealTimeNotifications() {
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const { user } = useAuth()

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super-admin'

  // Request notification permission on mount
  useEffect(() => {
    if (isSuperAdmin && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission)
      })
    }
  }, [isSuperAdmin])

  // Show browser notification
  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message.split('\n')[0],
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: true
      })

      browserNotif.onclick = () => {
        window.focus()
        browserNotif.close()
        // Navigate to notifications page
        window.location.href = '/admin/notifications'
      }

      // Auto-close after 10 seconds
      setTimeout(() => {
        browserNotif.close()
      }, 10000)
    }
  }

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!isSuperAdmin) return

    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const newNotifications = await response.json()
          
          // Check for new notifications since last check
          if (lastChecked) {
            const newOnes = newNotifications.filter((notif: Notification) => 
              !notif.read && new Date(notif.createdAt) > lastChecked
            )
            
            // Show browser notifications for new ones
            newOnes.forEach((notif: Notification) => {
              showBrowserNotification(notif)
            })
          }
          
          setLastChecked(new Date())
        }
      } catch (error) {
        console.error('Error checking notifications:', error)
      }
    }

    // Initial check
    checkNotifications()

    // Set up polling
    const interval = setInterval(checkNotifications, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isSuperAdmin, lastChecked])

  // This component only handles browser notifications, no UI
  return null
}
