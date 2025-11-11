'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Header from '@/components/Header'
import UploadSection from '@/components/UploadSection'
import ProcessingPanel from '@/components/ProcessingPanel'
import ImageGallery from '@/components/ImageGallery'
import RetouchDrawer from '@/components/RetouchDrawer'
import SummaryDrawer from '@/components/SummaryDrawer'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'

/**
 * PageDefault - Original Default Homepage
 * 
 * Classic upload → process → gallery workflow
 * Best for: General purpose, small to medium batches
 */
export default function PageDefault() {
  const { batch, resetBatch } = useStore()

  const handleNewProject = () => {
    if (batch) {
      if (confirm('Start a new project? This will clear the current batch.')) {
        resetBatch()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Only show when no batch */}
      {!batch && (
        <section className="border-b bg-gradient-to-b from-background to-muted/20">
          <div className="container py-16 px-4 text-center md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                AI-Powered Image Processing
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Transform your images with advanced AI technology. Upload, process, and export with enterprise-grade precision.
              </p>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Main Content */}
      <div className="relative">
        {/* Upload Section - Always visible at top */}
        <UploadSection />

        {/* Processing & Results - Show when batch exists */}
        {batch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ProcessingPanel />
            
            {/* Show gallery when processing has started */}
            {batch.images.some(img => img.processedUrl) && (
              <ImageGallery />
            )}
          </motion.div>
        )}

      </div>

      {/* Drawers */}
      <RetouchDrawer />
      <SummaryDrawer />

      {/* Floating New Project Button - Only show when batch exists */}
      {batch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            onClick={handleNewProject}
            className="h-14 rounded-full px-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </motion.div>
      )}
    </main>
  )
}

