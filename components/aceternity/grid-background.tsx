'use client'

import { motion } from 'framer-motion'

export const GridBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-full">
      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(156 163 175 / 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(156 163 175 / 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>
      
      {children}
    </div>
  )
}

