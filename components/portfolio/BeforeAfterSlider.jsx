'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
}) {
  const [isHolding, setIsHolding] = useState(false)

  const handleMouseDown = () => setIsHolding(true)
  const handleMouseUp = () => setIsHolding(false)
  const handleMouseLeave = () => setIsHolding(false)

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* After Image (Default - Always visible) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt="After processing"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>

      {/* Before Image (Shows on hold) */}
      <AnimatePresence>
        {isHolding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10"
          >
            <Image
              src={beforeImage}
              alt="Before processing"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hold Instruction Chip - Top Left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
        className="absolute top-3 left-3 z-20"
      >
        <div className="rounded-full bg-zinc-900/40 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm dark:bg-zinc-100/40 dark:text-zinc-900/90">
          {isHolding ? 'Before' : 'Hold to see before'}
        </div>
      </motion.div>

      {/* Loading placeholder for images */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 -z-10" />
    </div>
  )
}

