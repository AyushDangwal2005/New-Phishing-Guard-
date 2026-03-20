"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react"

export type RiskLevel = "safe" | "suspicious" | "dangerous"

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

const riskConfig = {
  safe: {
    label: "Safe",
    icon: ShieldCheck,
    className: "bg-success/10 text-success border-success/30 glow-success",
  },
  suspicious: {
    label: "Suspicious",
    icon: ShieldAlert,
    className: "bg-warning/10 text-warning border-warning/30 glow-warning",
  },
  dangerous: {
    label: "Dangerous",
    icon: ShieldX,
    className: "bg-destructive/10 text-destructive border-destructive/30 glow-destructive",
  },
}

const sizeConfig = {
  sm: "text-xs px-2 py-1 gap-1",
  md: "text-sm px-3 py-1.5 gap-2",
  lg: "text-base px-4 py-2 gap-2",
}

const iconSizeConfig = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function RiskBadge({ level, className, showIcon = true, size = "md" }: RiskBadgeProps) {
  const config = riskConfig[level]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-all",
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      <span>{config.label}</span>
    </div>
  )
}
