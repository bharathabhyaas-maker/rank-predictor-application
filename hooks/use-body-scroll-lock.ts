"use client"

import { useEffect, useRef } from 'react'

export function useBodyScrollLock(isLocked: boolean) {
  const originalStyleRef = useRef<{
    overflow: string
    paddingRight: string
  }>({
    overflow: '',
    paddingRight: ''
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const body = document.body
    
    if (isLocked) {
      // Store original styles
      originalStyleRef.current = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight
      }

      // Get the scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // Apply styles to prevent body scroll and compensate for scrollbar
      body.style.overflow = 'hidden'
      body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      // Restore original styles
      body.style.overflow = originalStyleRef.current.overflow
      body.style.paddingRight = originalStyleRef.current.paddingRight
    }

    // Cleanup function
    return () => {
      body.style.overflow = originalStyleRef.current.overflow
      body.style.paddingRight = originalStyleRef.current.paddingRight
    }
  }, [isLocked])
}
