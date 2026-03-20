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
  Info,
  Shield,
  ExternalLink,
  XCircle,
  Scan,
} from "lucide-react"
import { toast } from "sonner"

interface ExternalScans {
  virustotal?: {
    positives: number
    total: number
    permalink: string | null
  } | null
  google_safe_browsing?: {
    is_safe: boolean
    threats: string[]
  } | null
  huggingface?: {
    label: string
    confidence: number
  } | null
}

export interface AnalysisResultData {
  risk_level: RiskLevel
  risk_score: number
  confidence_score: number
  reasons: string[]
  actions: string[]
  highlighted_words: string[]
  original_text?: string
  threat_types?: string[] | null
  external_scans?: ExternalScans | null
}

interface AnalysisResultProps {
  result: AnalysisResultData
  className?: string
}

export function AnalysisResult({ result, className }: AnalysisResultProps) {
  const handleCopy = async () => {
    const text = `
Risk Level: ${result.risk_level.toUpperCase()}
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
    <div className={cn("space-y-5", className)}>
      {/* Main Result Card */}
      <Card className="overflow-hidden border-2" style={{
        borderColor: result.risk_level === "safe" ? "var(--success)" : 
                     result.risk_level === "suspicious" ? "var(--warning)" : "var(--destructive)"
      }}>
        <div className={cn(
          "h-1.5",
          result.risk_level === "safe" && "bg-success",
          result.risk_level === "suspicious" && "bg-warning",
          result.risk_level === "dangerous" && "bg-destructive"
        )} />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-4">
              <RiskBadge level={result.risk_level} size="lg" />
              {result.threat_types && result.threat_types.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.threat_types.map((type, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-medium rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-center md:text-left">
                <p className="text-muted-foreground text-sm font-medium">
                  AI Confidence Score
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={result.confidence_score} className="w-32 h-2" />
                  <span className="font-bold">{result.confidence_score}%</span>
                </div>
              </div>
            </div>
            <RiskMeter score={result.risk_score} />
          </div>
        </CardContent>
      </Card>

      {/* External Scan Results */}
      {result.external_scans && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scan className="h-4 w-4 text-accent" />
              External Security Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* VirusTotal */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">VirusTotal</div>
                    {result.external_scans.virustotal ? (
                      <div className={cn(
                        "text-xs font-medium",
                        result.external_scans.virustotal.positives > 0 ? "text-destructive" : "text-success"
                      )}>
                        {result.external_scans.virustotal.positives}/{result.external_scans.virustotal.total} detections
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Not scanned</div>
                    )}
                  </div>
                </div>
                {result.external_scans.virustotal?.positives === 0 && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
                {result.external_scans.virustotal && result.external_scans.virustotal.positives > 0 && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>

              {/* Google Safe Browsing */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Safe Browsing</div>
                    {result.external_scans.google_safe_browsing ? (
                      <div className={cn(
                        "text-xs font-medium",
                        result.external_scans.google_safe_browsing.is_safe ? "text-success" : "text-destructive"
                      )}>
                        {result.external_scans.google_safe_browsing.is_safe ? "No threats" : "Threats found"}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Not scanned</div>
                    )}
                  </div>
                </div>
                {result.external_scans.google_safe_browsing?.is_safe && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
                {result.external_scans.google_safe_browsing && !result.external_scans.google_safe_browsing.is_safe && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>

              {/* HuggingFace ML */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">ML Classifier</div>
                    {result.external_scans.huggingface ? (
                      <div className="text-xs font-medium text-foreground">
                        {result.external_scans.huggingface.label} ({result.external_scans.huggingface.confidence}%)
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Not classified</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* VirusTotal Link */}
            {result.external_scans.virustotal?.permalink && (
              <div className="mt-3 pt-3 border-t border-border">
                <a 
                  href={result.external_scans.virustotal.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  View full VirusTotal report
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Highlighted Text */}
      {result.original_text && result.highlighted_words.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-warning" />
              Suspicious Content Highlighted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm leading-relaxed border border-border">
              <HighlightedText 
                text={result.original_text} 
                highlights={result.highlighted_words} 
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Reasons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Detection Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {result.reasons.map((reason, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2.5 text-sm"
                >
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {result.actions.map((action, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2.5 text-sm"
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReport} 
          className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
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
          <mark key={index} className="bg-destructive/20 text-destructive px-1 rounded font-semibold border border-destructive/30">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </span>
  )
}
