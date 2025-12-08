/**
 * i2i Homepage - Landing Page
 * 
 * Main landing page for the i2i application.
 * Upload/processing interface has been moved to /upload
 */

'use client'

import dynamic from 'next/dynamic'

// Dynamically import LandingPage to avoid SSR issues
const LandingPage = dynamic(() => import('./LandingPage'), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
    </div>
  ),
})

export default function Home() {
  return <LandingPage />
}

