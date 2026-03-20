"use client"

import { cn } from "@/lib/utils"
import { RiskBadge, type RiskLevel } from "@/components/risk-badge"
import { RiskMeter } from "@/components/risk-meter"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Share2, 
  Flag,
  Lightbulb,
  Target,
  Info
} from "lucide-react"
import { toast } from "sonner"

export interface AnalysisResultData {
  risk_level: RiskLevel
  risk_score: number
  confidence_score: number
  reasons: string[]
  actions: string[]
  highlighted_words: string[]
  original_text?: string
}

interface AnalysisResultProps {
  result: AnalysisResultData
  className?: string
}

export function AnalysisResult({ result, className }: AnalysisResultProps) {
  const handleCopy = async () => {
    const text = `
Risk Level: ${result.risk_level}
Risk Score: ${result.risk_score}/100
Confidence: ${result.confidence_score}%

Reasons:
${result.reasons.map(r => `- ${r}`).join('\n')}

Recommended Actions:
${result.actions.map(a => `- ${a}`).join('\n')}
    `.trim()
    
    await navigator.clipboard.writeText(text)
    toast.success("Analysis copied to clipboard")
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Phishing Guard AI Analysis",
        text: `Risk Level: ${result.risk_level.toUpperCase()} (Score: ${result.risk_score}/100)`,
      })
    } else {
      handleCopy()
    }
  }

  const handleReport = () => {
    toast.success("Thank you for reporting! This helps improve our detection.")
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Result Card */}
      <Card className="glass overflow-hidden">
        <div className={cn(
          "h-1",
          result.risk_level === "safe" && "bg-success",
          result.risk_level === "suspicious" && "bg-warning",
          result.risk_level === "dangerous" && "bg-destructive"
        )} />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <RiskBadge level={result.risk_level} size="lg" />
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm">
                  AI Confidence Score
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={result.confidence_score} className="w-32 h-2" />
                  <span className="font-semibold">{result.confidence_score}%</span>
                </div>
              </div>
            </div>
            <RiskMeter score={result.risk_score} />
          </div>
        </CardContent>
      </Card>

      {/* Highlighted Text */}
      {result.original_text && result.highlighted_words.length > 0 && (
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Suspicious Content Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm leading-relaxed">
              <HighlightedText 
                text={result.original_text} 
                highlights={result.highlighted_words} 
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reasons */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Detection Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.reasons.map((reason, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm"
                >
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.actions.map((action, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Result
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={handleReport} className="gap-2 text-destructive hover:text-destructive">
          <Flag className="h-4 w-4" />
          Report Phishing
        </Button>
      </div>
    </div>
  )
}

function HighlightedText({ text, highlights }: { text: string; highlights: string[] }) {
  if (!highlights.length) return <span>{text}</span>

  const regex = new RegExp(`(${highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, index) => {
        const isHighlight = highlights.some(h => h.toLowerCase() === part.toLowerCase())
        return isHighlight ? (
          <mark key={index} className="bg-destructive/30 text-destructive px-1 rounded font-semibold">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </span>
  )
}
