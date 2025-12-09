'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function BeforeAfterSliderImproved({
  beforeImage,
  afterImage,
}) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)

  // Load image to get dimensions
  useEffect(() => {
    if (!beforeImage) return
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      // Fallback to default dimensions if image fails to load
      setImageDimensions({ width: 1920, height: 1080 })
    }
    img.src = beforeImage
  }, [beforeImage])

  const updateSliderPosition = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const offset = clientX - rect.left
    const percentage = Math.min(Math.max((offset / rect.width) * 100, 0), 100)
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }, [updateSliderPosition])

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      updateSliderPosition(e.clientX)
    }
  }, [isDragging, updateSliderPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Calculate aspect ratio
  const aspectRatio = imageDimensions.width > 0 && imageDimensions.height > 0
    ? imageDimensions.width / imageDimensions.height
    : 16 / 9 // fallback

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden bg-muted cursor-ew-resize"
      onMouseDown={handleMouseDown}
      style={{
        aspectRatio: aspectRatio > 0 ? aspectRatio : 'auto',
        maxHeight: 'calc(95vh - 200px)',
        maxWidth: '100%',
        minHeight: '400px',
      }}
    >
      {/* Before Image (Original) */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt="Before processing"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
          unoptimized={beforeImage?.startsWith('data:') || beforeImage?.includes('storage.googleapis.com')}
        />
      </div>

      {/* After Image (Processed) - Clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={afterImage}
          alt="After processing"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority
          unoptimized={afterImage?.startsWith('data:') || afterImage?.includes('storage.googleapis.com')}
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1 rounded-full bg-white p-2 shadow-lg">
          <div className="h-4 w-0.5 rounded bg-muted-foreground/40" />
          <div className="h-4 w-0.5 rounded bg-muted-foreground/40" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute left-4 top-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        Raw
      </div>
      <div className="absolute right-4 top-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        Processed
      </div>
    </div>
  )
}

