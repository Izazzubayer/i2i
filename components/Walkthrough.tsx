'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface WalkthroughStep {
  id: number
  title: string
  description: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlight?: 'glow' | 'spotlight'
}

interface WalkthroughProps {
  steps: WalkthroughStep[]
  onComplete: () => void
  onSkip: () => void
  currentStep: number
  onStepChange: (step: number) => void
}

export default function Walkthrough({
  steps,
  onComplete,
  onSkip,
  currentStep,
  onStepChange,
}: WalkthroughProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 })
  const step = steps[currentStep]
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step?.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement
      if (element) {
        setTargetElement(element)
        updateBubblePosition(element, step.position || 'bottom')
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      setTargetElement(null)
    }
  }, [currentStep, step])

  const updateBubblePosition = (element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = rect.top + scrollY - 20
        left = rect.left + scrollX + rect.width / 2
        break
      case 'bottom':
        top = rect.bottom + scrollY + 20
        left = rect.left + scrollX + rect.width / 2
        break
      case 'left':
        top = rect.top + scrollY + rect.height / 2
        left = rect.left + scrollX - 20
        break
      case 'right':
        top = rect.top + scrollY + rect.height / 2
        left = rect.right + scrollX + 20
        break
      case 'center':
        top = window.innerHeight / 2 + scrollY
        left = window.innerWidth / 2 + scrollX
        break
      default:
        top = rect.bottom + scrollY + 20
        left = rect.left + scrollX + rect.width / 2
    }

    setBubblePosition({ top, left })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  if (!step) return null

  return (
    <>
      {/* Overlay with spotlight effect */}
      <AnimatePresence>
        {targetElement && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              background: step.highlight === 'spotlight'
                ? `radial-gradient(circle at ${targetElement.getBoundingClientRect().left + targetElement.getBoundingClientRect().width / 2}px ${targetElement.getBoundingClientRect().top + targetElement.getBoundingClientRect().height / 2}px, transparent 0px, transparent ${Math.max(targetElement.getBoundingClientRect().width, targetElement.getBoundingClientRect().height) / 2 + 20}px, rgba(0, 0, 0, 0.7) 100%)`
                : 'rgba(0, 0, 0, 0.5)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Highlighted element glow */}
      <AnimatePresence>
        {targetElement && step.highlight === 'glow' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: targetElement.getBoundingClientRect().top + window.scrollY - 8,
              left: targetElement.getBoundingClientRect().left + window.scrollX - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              borderRadius: '12px',
              border: '3px solid',
              borderColor: 'hsl(var(--primary))',
              boxShadow: '0 0 20px 5px hsl(var(--primary) / 0.5)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Text Bubble */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed z-[10000] max-w-sm"
          style={{
            top: bubblePosition.top,
            left: bubblePosition.left,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-background border-2 border-primary rounded-lg shadow-2xl p-6 relative">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {currentStep + 1}
                </div>
                <span className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      idx === currentStep
                        ? "bg-primary w-6"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <Button
                size="sm"
                onClick={handleNext}
                className="text-xs"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep === steps.length - 1 ? (
                  <ArrowRight className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>

            {/* Skip link */}
            <div className="mt-4 text-center">
              <button
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Skip walkthrough
              </button>
            </div>
          </div>

          {/* Arrow pointing to target */}
          {targetElement && step.position && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{
                top: step.position === 'bottom' 
                  ? '-20px' 
                  : step.position === 'top'
                  ? '100%'
                  : '50%',
                left: step.position === 'left' || step.position === 'right'
                  ? step.position === 'left' ? '100%' : '-20px'
                  : '50%',
                transform: step.position === 'bottom' || step.position === 'top'
                  ? 'translateX(-50%)'
                  : step.position === 'left' || step.position === 'right'
                  ? 'translateY(-50%)'
                  : 'translate(-50%, -50%)',
              }}
            >
              <div
                className={cn(
                  "w-0 h-0 border-solid",
                  step.position === 'bottom' && "border-t-[20px] border-t-primary border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent",
                  step.position === 'top' && "border-b-[20px] border-b-primary border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent",
                  step.position === 'left' && "border-r-[20px] border-r-primary border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent",
                  step.position === 'right' && "border-l-[20px] border-l-primary border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"
                )}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

