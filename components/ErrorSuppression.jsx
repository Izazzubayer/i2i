'use client'

import { useEffect } from 'react'

/**
 * Error Suppression Component
 * Suppresses errors from browser extensions and external scripts
 * that don't affect the application functionality
 */
export default function ErrorSuppression() {
  useEffect(() => {
    // Suppress errors from browser extensions and external scripts
    const handleError = (e) => {
      if (
        e.filename &&
        (e.filename.includes('share-modal') ||
          e.filename.includes('extension') ||
          e.filename.includes('chrome-extension') ||
          e.filename.includes('moz-extension'))
      ) {
        e.preventDefault()
        return false
      }
    }

    // Suppress unhandled promise rejections from external sources
    const handleUnhandledRejection = (e) => {
      if (
        e.reason &&
        typeof e.reason === 'string' &&
        (e.reason.includes('share-modal') ||
          e.reason.includes('extension') ||
          e.reason.includes('chrome-extension'))
      ) {
        e.preventDefault()
        return false
      }
    }

    window.addEventListener('error', handleError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
