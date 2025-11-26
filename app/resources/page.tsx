'use client'

import { motion } from 'framer-motion'
import { 
  Upload, 
  MessageSquare, 
  Sparkles, 
  Eye, 
  Download, 
  Cloud,
  ArrowRight,
  Check,
  Zap,
  Cpu,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const steps = [
  {
    step: 1,
    title: 'Upload Your Images',
    description: 'Drag and drop your product images or click to browse. Support for JPEG, PNG, WebP, and TIFF formats.',
    icon: Upload,
    features: [
      'Batch upload up to 100 images',
      'Drag & drop interface',
      'Multiple file format support',
      'Automatic validation'
    ],
    details: 'Our intelligent upload system validates your images instantly and prepares them for processing. Maximum file size: 50MB per image.'
  },
  {
    step: 2,
    title: 'Provide Instructions',
    description: 'Tell our AI what you want to achieve. Type your requirements or upload a detailed instruction document.',
    icon: MessageSquare,
    features: [
      'AI chat assistant',
      'Natural language processing',
      'PDF/DOC document support',
      'Example templates'
    ],
    details: 'Our AI assistant helps you craft perfect instructions. Whether you need background removal, color correction, or custom enhancements.'
  },
  {
    step: 3,
    title: 'AI Processing',
    description: 'Advanced AI models analyze and process your images according to your instructions in real-time.',
    icon: Sparkles,
    features: [
      'Multiple AI models: GPT, Gemini, NanoBanana, Seedream, Reve',
      'In-house AI algorithm optimizes best output',
      'Real-time progress tracking',
      'Live processing logs'
    ],
    details: 'Watch as our AI processes your images. We leverage GPT, Gemini, NanoBanana, Seedream, and Reve. What makes us unique? Our proprietary AI algorithm intelligently selects and optimizes the best output from these models for your specific needs.'
  },
  {
    step: 4,
    title: 'Review & Approve',
    description: 'Inspect your processed images in our intuitive gallery. Approve or request refinements with a single click.',
    icon: Eye,
    features: [
      'Gallery view with zoom',
      'Before/after comparison',
      'Undo/Redo with complete activity log',
      'Individual image approval',
      'Batch actions'
    ],
    details: 'Review each image in detail. Our gallery provides multiple view modes and lets you compare original vs processed versions side-by-side. Full activity log lets you undo and redo changes at any time, giving you complete control over your workflow.'
  },
  {
    step: 5,
    title: 'Retouch if Needed',
    description: 'Not perfect? No problem. Request AI-powered retouching with specific instructions for individual images.',
    icon: Zap,
    features: [
      'Single image refinement',
      'Custom retouch instructions',
      'Multiple iterations',
      'Version history'
    ],
    details: 'Fine-tune any image with additional instructions. Our AI learns from your feedback to deliver exactly what you need.'
  },
  {
    step: 6,
    title: 'Export & Deliver',
    description: 'Download your images as a ZIP file or send them directly to your Digital Asset Management system.',
    icon: Download,
    features: [
      'ZIP download with summary',
      'DAM integration (8+ platforms)',
      'Automatic metadata',
      'Webhook notifications'
    ],
    details: 'Export to Creative Force, Shopify, Facebook, Instagram, or any custom DAM. Images include processing metadata and summaries.'
  }
]

const features = [
  {
    icon: Cpu,
    title: 'AI-Powered',
    description: 'Advanced machine learning models understand and execute complex instructions'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process images in seconds, not hours. Batch processing for efficiency'
  },
  {
    icon: Cloud,
    title: 'Cloud-Based',
    description: 'No software to install. Access from anywhere, on any device'
  },
  {
    icon: CheckCircle2,
    title: '99.9% Success Rate',
    description: 'Industry-leading quality with consistent, reliable results'
  }
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-4 border-zinc-300 dark:border-zinc-700">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              End-to-End Solution
            </Badge>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl md:text-6xl">
              How i2i Works
            </h1>
            
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
              Transform your product images in 6 simple steps. From upload to delivery, 
              our AI-powered platform handles everything.
            </p>

            <Button size="lg" asChild>
              <Link href="/dashboard">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="container px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

            {/* Timeline Steps */}
            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon
                
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-0 flex h-16 w-16 items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="ml-24">
                      <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                              Step {step.step}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl text-zinc-900 dark:text-zinc-100">
                            {step.title}
                          </CardTitle>
                          <CardDescription className="text-base text-zinc-600 dark:text-zinc-400">
                            {step.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-500">
                            {step.details}
                          </p>
                          
                          <div className="space-y-2">
                            {step.features.map((feature) => (
                              <div key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="container px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl"
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Why Choose i2i?
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Built for professionals, designed for simplicity
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="border-zinc-200 dark:border-zinc-800">
                      <CardHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <Icon className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
                        </div>
                        <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-zinc-600 dark:text-zinc-400">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100 md:text-4xl">
              Ready to Start Processing?
            </h2>
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
              Join thousands of businesses transforming their product images with AI. 
              Get started in minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200">
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-zinc-300 dark:border-zinc-700">
                <Link href="/portfolio">
                  View Portfolio
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
