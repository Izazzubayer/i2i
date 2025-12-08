/**
 * i2i Homepage - Landing Page
 * 
 * Main landing page for the i2i application.
 * Upload/processing interface has been moved to /upload
 */

import LandingPage from './LandingPage'

export const metadata = {
  title: 'i2i - AI Image Processing Platform',
  description: 'Professional image-to-image AI processing for businesses',
}

export default function Home() {
  return <LandingPage />
}

