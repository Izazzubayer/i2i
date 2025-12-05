'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
}) => {
  const pathRef = useRef(null)
  const [pathD, setPathD] = useState('')

  useEffect(() => {
    const updatePath = () => {
      if (!fromRef.current || !toRef.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const fromRect = fromRef.current.getBoundingClientRect()
      const toRect = toRef.current.getBoundingClientRect()

      const fromX = fromRect.left - containerRect.left + fromRect.width / 2
      const fromY = fromRect.top - containerRect.top + fromRect.height / 2
      const toX = toRect.left - containerRect.left + toRect.width / 2
      const toY = toRect.top - containerRect.top + toRect.height / 2

      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2 - curvature

      const path = `M ${fromX},${fromY} Q ${midX},${midY} ${toX},${toY}`
      setPathD(path)
    }

    updatePath()
    window.addEventListener('resize', updatePath)
    return () => window.removeEventListener('resize', updatePath)
  }, [fromRef, toRef, containerRef, curvature])

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 1 }}
    >
      <defs>
        <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <path
        ref={pathRef}
        d={pathD}
        stroke="url(#beam-gradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      >
        <motion.animate
          attributeName="stroke-dashoffset"
          from={reverse ? -1000 : 1000}
          to={reverse ? 1000 : -1000}
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}

