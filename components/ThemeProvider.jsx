'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

export default function ThemeProvider({ children }) {
  const { darkMode } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Apply theme on mount and when darkMode changes
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode, mounted])

  // Prevent hydration mismatch by not applying theme until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

