'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useStore()

  useEffect(() => {
    // Apply theme on mount and when darkMode changes
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  return <>{children}</>
}

