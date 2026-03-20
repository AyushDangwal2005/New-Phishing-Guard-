"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface RiskMeterProps {
  score: number
  className?: string
  showLabel?: boolean
  animate?: boolean
}

export function RiskMeter({ score, className, showLabel = true, animate = true }: RiskMeterProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score)
      return
    }

    const duration = 1000
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, animate])

  const getColor = (value: number) => {
    if (value <= 30) return "text-success"
    if (value <= 70) return "text-warning"
    return "text-destructive"
  }

  const getGradient = (value: number) => {
    if (value <= 30) return "from-success/20 to-success"
    if (value <= 70) return "from-warning/20 to-warning"
    return "from-destructive/20 to-destructive"
  }

  const rotation = (displayScore / 100) * 180 - 90

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 rounded-t-full border-8 border-muted" />
        
        {/* Colored arc */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className="text-success" stopColor="currentColor" />
              <stop offset="50%" className="text-warning" stopColor="currentColor" />
              <stop offset="100%" className="text-destructive" stopColor="currentColor" />
            </linearGradient>
          </defs>
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#meterGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-30"
          />
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#meterGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(displayScore / 100) * 283} 283`}
            className="transition-all duration-300"
          />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className={cn("w-1 h-20 rounded-full bg-gradient-to-t", getGradient(displayScore))} />
          <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full", getColor(displayScore).replace("text-", "bg-"))} />
        </div>
      </div>

      {showLabel && (
        <div className="mt-4 text-center">
          <div className={cn("text-4xl font-bold tabular-nums", getColor(displayScore))}>
            {displayScore}
          </div>
          <div className="text-sm text-muted-foreground">Risk Score</div>
        </div>
      )}
    </div>
  )
}
