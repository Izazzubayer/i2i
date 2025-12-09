'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MousePointer2, RotateCcw, FileEdit, Trash2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ImageWalkthrough({ isOpen, onClose, targetImageId }) {
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const targetRef = useRef(null)
  const overlayRef = useRef(null)

  const steps = [
    {
      title: 'Right-Click on Images',
      description: 'Right-click on any processed image to access powerful actions like Reprocess, Amendment, and Delete.',
      icon: MousePointer2,
      actions: [
        { icon: RotateCcw, label: 'Reprocess', description: 'Create a new version with updated instructions' },
        { icon: FileEdit, label: 'Amendment', description: 'Request changes to processed images' },
        { icon: Trash2, label: 'Delete', description: 'Remove images (can be undone)' },
      ],
    },
  ]

  useEffect(() => {
    if (isOpen && targetImageId) {
      // Find the target image element
      const findTargetElement = () => {
        const imageCard = document.querySelector(`[data-image-id="${targetImageId}"]`)
        if (imageCard) {
          targetRef.current = imageCard
          scrollToElement(imageCard)
        }
      }

      // Try to find element immediately and also after a short delay
      findTargetElement()
      const timeout = setTimeout(findTargetElement, 100)

      // Update position on scroll/resize
      const updatePosition = () => {
        if (targetRef.current) {
          // Force re-render by updating state
          const rect = targetRef.current.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) {
            findTargetElement()
          }
        }
      }

      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        clearTimeout(timeout)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, targetImageId])

  const scrollToElement = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  // Update target rect for highlighting
  useEffect(() => {
    if (isOpen && targetRef.current) {
      const updateRect = () => {
        if (targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect()
          setTargetRect({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          })
        }
      }

      updateRect()
      const interval = setInterval(updateRect, 100)

      return () => clearInterval(interval)
    } else {
      setTargetRect(null)
    }
  }, [isOpen])

  const handleClose = () => {
    setStep(0)
    onClose()
    // Don't save to localStorage so it can show again during next processing
  }

  const handleNeverShowAgain = () => {
    // Save to localStorage that user doesn't want to see walkthrough again
    if (typeof window !== 'undefined') {
      localStorage.setItem('imageWalkthroughSeen', 'true')
    }
    handleClose()
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon

  return (
    <AnimatePresence mode="sync">
      {isOpen && (
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Dark overlay */}
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Highlight border around target */}
        {targetRef.current && targetRect && (
          <motion.div
            key={`${targetRect.left}-${targetRect.top}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute pointer-events-none"
            style={{
              left: `${targetRect.left - 6}px`,
              top: `${targetRect.top - 6}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`,
            }}
          >
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                border: '3px solid',
                borderColor: 'hsl(var(--primary))',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.6)',
              }}
            />
            {/* Pulsing ring */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(59, 130, 246, 0.4)',
                  '0 0 0 8px rgba(59, 130, 246, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-lg border-2 border-primary"
            />
          </motion.div>
        )}

        {/* Tooltip Card */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-10"
          >
            <Card className="w-full max-w-md shadow-2xl border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Step {step + 1} of {steps.length}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Action Icons */}
                {currentStep.actions && (
                  <div className="mb-4 p-4 rounded-lg bg-muted/50 space-y-2">
                    {currentStep.actions.map((action, idx) => {
                      const ActionIcon = action.icon
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`p-2 rounded-md ${
                            action.label === 'Delete' 
                              ? 'bg-red-100 dark:bg-red-900/30' 
                              : 'bg-background'
                          }`}>
                            <ActionIcon 
                              className={`h-4 w-4 ${
                                action.label === 'Delete' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-foreground'
                              }`} 
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Sparkle animation hint */}
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <p className="text-xs text-foreground">
                    <strong>Tip:</strong> Try right-clicking on the highlighted image above!
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleNeverShowAgain}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Never Show Again
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="gap-2"
                  >
                    {step === steps.length - 1 ? 'Got it!' : 'Next'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      )}
    </AnimatePresence>
  )
}
