'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useOptimizedNavigation() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigate = useCallback(async (path) => {
    try {
      setIsNavigating(true)
      // Prefetch the route
      router.prefetch(path)
      // Small delay to allow prefetch to start
      await new Promise(resolve => setTimeout(resolve, 50))
      // Navigate
      router.push(path)
    } catch (error) {
      console.error('Navigation error:', error)
      setIsNavigating(false)
    }
  }, [router])

  return { navigate, isNavigating }
}

