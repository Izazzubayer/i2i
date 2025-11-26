'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Download, Share2, Zap, Clock, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { BeforeAfterSlider } from './BeforeAfterSlider'
import { toast } from 'sonner'

interface PortfolioItem {
  id: number
  category: string
  title: string
  before: string
  after: string
  tags: string[]
}

interface PortfolioModalProps {
  item: PortfolioItem | null
  onClose: () => void
}

export function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  if (!item) return null

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this amazing image transformation: ${item.title}`,
        url: window.location.href
      }).catch(() => {
        // Fallback to clipboard
        copyToClipboard()
      })
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const processingDetails = [
    { icon: Clock, label: 'Processing Time', value: '< 30 seconds' },
    { icon: Layers, label: 'AI Models Used', value: '3 models' },
    { icon: Zap, label: 'Enhancements', value: `${item.tags.length} applied` }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-background shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Image Comparison */}
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3]">
                      <BeforeAfterSlider
                        beforeImage={item.before}
                        afterImage={item.after}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Download Options */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 font-semibold">Download Sample</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Before
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        After
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Both
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Enhancements Applied */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold">
                      <Zap className="h-5 w-5 text-primary" />
                      AI Enhancements Applied
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold">Processing Details</h3>
                    <div className="space-y-3">
                      {processingDetails.map((detail) => {
                        const Icon = detail.icon
                        return (
                          <div key={detail.label} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">{detail.label}</div>
                              <div className="font-medium">{detail.value}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Features Used */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold">Key Features</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>Automatic background removal and replacement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>AI-powered color correction and enhancement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>Professional lighting and shadow adjustments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>Detail enhancement and sharpening</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>Batch processing with consistent results</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="border-primary bg-gradient-to-br from-primary/10 to-purple-500/10">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-semibold">Ready to Try?</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Transform your product images with the same professional quality. 
                      Start processing in minutes.
                    </p>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/dashboard">
                        Start Processing Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

