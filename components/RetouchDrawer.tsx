'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import Image from 'next/image'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function RetouchDrawer() {
  const { retouchDrawerOpen, selectedImageForRetouch, closeRetouchDrawer, updateImageStatus, addLog } = useStore()
  const [instruction, setInstruction] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleApply = async () => {
    if (!selectedImageForRetouch || !instruction.trim()) {
      toast.error('Please enter retouch instructions')
      return
    }

    setProcessing(true)
    addLog(`Starting retouch for ${selectedImageForRetouch.originalName}`, 'info')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would call the API
      // const result = await apiClient.retouch(selectedImageForRetouch.id, instruction)
      
      // Update image with new processed URL
      const newProcessedUrl = `https://picsum.photos/seed/${selectedImageForRetouch.id}-retouched/400/300`
      updateImageStatus(selectedImageForRetouch.id, 'completed', newProcessedUrl)
      
      addLog(`Retouch completed for ${selectedImageForRetouch.originalName}`, 'success')
      toast.success('Retouch applied successfully!')
      
      setInstruction('')
      closeRetouchDrawer()
    } catch (error) {
      console.error('Retouch failed:', error)
      toast.error('Retouch failed. Please try again.')
      addLog(`Retouch failed for ${selectedImageForRetouch.originalName}`, 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    setInstruction('')
    closeRetouchDrawer()
  }

  return (
    <Drawer open={retouchDrawerOpen} onOpenChange={closeRetouchDrawer}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Retouch
            </DrawerTitle>
            <DrawerDescription>
              Provide instructions to refine this image with AI
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            {selectedImageForRetouch && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Image Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Current Image</h4>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                    {selectedImageForRetouch.processedUrl ? (
                      <Image
                        src={selectedImageForRetouch.processedUrl}
                        alt={selectedImageForRetouch.originalName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-muted">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedImageForRetouch.originalName}
                  </p>
                </div>

                {/* Instruction Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Retouch Instructions</h4>
                    <Textarea
                      placeholder="Example:
• Brighten the shadows by 20%
• Increase saturation slightly
• Remove any remaining artifacts
• Sharpen the edges"
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      className="min-h-[200px] resize-none"
                      disabled={processing}
                    />
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h5 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      Tips for Better Results
                    </h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Be specific about colors, brightness, and contrast</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Mention specific areas if needed (foreground, background)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Use measurable values (e.g., "increase by 20%")</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter>
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                disabled={!instruction.trim() || processing}
                className="flex-1"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply Retouch
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={processing}
                  size="lg"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

