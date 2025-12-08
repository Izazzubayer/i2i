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
      
      // If user has a valid token, they should be authenticated
      // Token is only given after email verification, so trust it
      if (user) {
        try {
          const userData = JSON.parse(user)
          const isVerified = userData.isVerified === true
          
          // If token exists, user is authenticated (token = verified)
          // Only clear if explicitly not verified AND no token exists
          if (isVerified || authToken) {
            // User is verified (either by flag or by having a token)
            setIsAuthenticated(true)
          } else {
            // Only clear if explicitly not verified AND no token
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
          setIsAuthenticated(false)
        }
      } else if (authToken) {
        // Token exists but no user data - might be from another session
        // Don't clear token, but don't show authenticated nav without user data
        setIsAuthenticated(false)
      } else {
        // No user data and no token - not authenticated
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
