'use client'

import { useState, useEffect } from 'react'
import AuthenticatedNav from './AuthenticatedNav'
import Header from './Header'

/**
 * Unified Navbar Component
 * Automatically shows AuthenticatedNav if user is logged in, otherwise shows Header
 * Use this component on all pages for consistent navigation
 */
export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted to prevent hydration mismatch
    setMounted(true)
    
    // Check if user is authenticated AND email is verified
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      
      const user = localStorage.getItem('user')
      const authToken = localStorage.getItem('authToken')
      
      // STRICT CHECK: User must have BOTH verified status AND token
      // This prevents showing account when verification fails
      if (user && authToken) {
        try {
          const userData = JSON.parse(user)
          const isVerified = userData.isVerified === true
          
          // ONLY show authenticated nav if BOTH conditions are true:
          // 1. User is explicitly verified (isVerified === true)
          // 2. User has a valid auth token
          if (isVerified && authToken) {
            setIsAuthenticated(true)
          } else {
            // If not verified OR no token, clear everything and show unauthenticated
            if (!isVerified) {
              // Clear localStorage if user is not verified
              localStorage.removeItem('user')
              localStorage.removeItem('authToken')
              localStorage.removeItem('refreshToken')
              window.dispatchEvent(new Event('localStorageChange'))
              console.log('🧹 Cleared user data - email not verified')
            }
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
          // Clear corrupted data
          localStorage.removeItem('user')
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          setIsAuthenticated(false)
        }
      } else {
        // No user data OR no token - not authenticated
        // Clear any orphaned data
        if (user && !authToken) {
          localStorage.removeItem('user')
          window.dispatchEvent(new Event('localStorageChange'))
        }
        if (authToken && !user) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          window.dispatchEvent(new Event('localStorageChange'))
        }
        setIsAuthenticated(false)
      }
    }

    // Initial check
    checkAuth()
    
    // Listen for storage changes (works across tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'authToken') {
        checkAuth()
      }
    }
    
    // Custom event for same-tab storage changes
    const handleCustomStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange)
    // Also check on focus (in case user logged in another tab)
    window.addEventListener('focus', checkAuth)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <Header />
  }

  // Show AuthenticatedNav if user is authenticated, otherwise show Header
  return isAuthenticated ? <AuthenticatedNav /> : <Header />
}
