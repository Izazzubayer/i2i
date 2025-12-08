'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start navigation indicator
    setIsNavigating(true)
    setProgress(0)
    
    // Simulate progress quickly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return Math.min(prev + Math.random() * 15 + 5, 90)
      })
    }, 50)

    // Complete progress when navigation is done
    const completeTimeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimeout)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent pointer-events-none"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ boxShadow: '0 0 10px rgba(var(--primary), 0.5)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

