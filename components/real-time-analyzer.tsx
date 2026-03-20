"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface RealTimeAnalyzerProps {
  text: string
  className?: string
}

const PHISHING_KEYWORDS = [
  "urgent", "immediately", "verify", "suspended", "locked", "confirm",
  "password", "credentials", "otp", "pin", "bank", "account",
  "winner", "lottery", "prize", "free", "limited time", "act now",
  "click here", "update payment", "unusual activity", "security alert",
  "dear customer", "dear user", "expires today", "action required",
]

const URL_PATTERN = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi

export function RealTimeAnalyzer({ text, className }: RealTimeAnalyzerProps) {
  const analysis = useMemo(() => {
    if (!text || text.length < 10) {
      return { foundKeywords: [], urls: [], riskLevel: "none" as const }
    }

    const lowerText = text.toLowerCase()
    const foundKeywords = PHISHING_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )

    const urls = text.match(URL_PATTERN) || []
    
    let riskLevel: "none" | "low" | "medium" | "high" = "none"
    const totalIndicators = foundKeywords.length + (urls.length > 0 ? 1 : 0)
    
    if (totalIndicators >= 4) riskLevel = "high"
    else if (totalIndicators >= 2) riskLevel = "medium"
    else if (totalIndicators >= 1) riskLevel = "low"

    return { foundKeywords, urls, riskLevel }
  }, [text])

  if (analysis.riskLevel === "none") return null

  return (
    <div className={cn(
      "rounded-lg p-3 text-sm transition-all",
      analysis.riskLevel === "low" && "bg-success/10 border border-success/30",
      analysis.riskLevel === "medium" && "bg-warning/10 border border-warning/30",
      analysis.riskLevel === "high" && "bg-destructive/10 border border-destructive/30",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        {analysis.riskLevel === "high" ? (
          <>
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">High-risk patterns detected</span>
          </>
        ) : analysis.riskLevel === "medium" ? (
          <>
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning">Suspicious patterns found</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="font-medium text-success">Low risk detected</span>
          </>
        )}
      </div>
      
      {analysis.foundKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {analysis.foundKeywords.slice(0, 8).map((keyword, i) => (
            <span 
              key={i}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                analysis.riskLevel === "high" && "bg-destructive/20 text-destructive",
                analysis.riskLevel === "medium" && "bg-warning/20 text-warning",
                analysis.riskLevel === "low" && "bg-success/20 text-success"
              )}
            >
              {keyword}
            </span>
          ))}
          {analysis.foundKeywords.length > 8 && (
            <span className="text-xs text-muted-foreground">
              +{analysis.foundKeywords.length - 8} more
            </span>
          )}
        </div>
      )}

      {analysis.urls.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {analysis.urls.length} URL{analysis.urls.length > 1 ? 's' : ''} detected - will be analyzed
        </p>
      )}
    </div>
  )
}
