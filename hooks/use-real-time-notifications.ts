"use client"

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export function useRealTimeNotifications() {
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
  const showBrowserNotification = (title: string, message: string, onClick?: () => void) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: `notification-${Date.now()}`,
        requireInteraction: true
      })

      browserNotif.onclick = () => {
        window.focus()
        browserNotif.close()
        if (onClick) onClick()
      }

      // Auto-close after 10 seconds
      setTimeout(() => {
        browserNotif.close()
      }, 10000)
    }
  }

  return {
    isSuperAdmin,
    showBrowserNotification
  }
}
