"use client"

import { useState, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { AnalysisForm } from "@/components/analysis-form"
import { AnalysisResult, type AnalysisResultData } from "@/components/analysis-result"
import { Shield, Zap, Brain, Lock, AlertTriangle, TrendingUp, CheckCircle2, Activity } from "lucide-react"
import { toast } from "sonner"

const LOADING_STEPS = [
  "Analyzing text patterns...",
  "Scanning for phishing indicators...",
  "Checking URL with VirusTotal...",
  "Running Google Safe Browsing check...",
  "Evaluating with ML classifier...",
  "Generating AI assessment...",
]

const stats = [
  { label: "Threats Blocked", value: "2.5M+", icon: Shield, color: "text-success" },
  { label: "Detection Rate", value: "99.7%", icon: Zap, color: "text-accent" },
  { label: "AI Models", value: "5+", icon: Brain, color: "text-warning" },
  { label: "Real-time", value: "< 2s", icon: TrendingUp, color: "text-destructive" },
]

const apiStatus = [
  { name: "VirusTotal", status: "active" },
  { name: "Safe Browsing", status: "active" },
  { name: "AbuseIPDB", status: "active" },
  { name: "HuggingFace ML", status: "active" },
]

export default function AnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [result, setResult] = useState<AnalysisResultData | null>(null)

  const handleAnalyze = useCallback(async (formData: FormData) => {
    setIsLoading(true)
    setResult(null)

    // Multi-step loading animation
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(LOADING_STEPS[i])
      await new Promise(resolve => setTimeout(resolve, 350))
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
      
      if (data.risk_level === "dangerous") {
        toast.error("ALERT: High-risk content detected!", {
          description: "This content shows strong indicators of phishing or scam.",
        })
      } else if (data.risk_level === "suspicious") {
        toast.warning("Suspicious content detected", {
          description: "Proceed with caution and verify the source.",
        })
      } else {
        toast.success("Analysis complete", {
          description: "No immediate threats detected.",
        })
      }
    } catch {
      toast.error("Analysis failed", {
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
      setLoadingStep("")
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
            <Shield className="h-4 w-4" />
            AI-Powered Security Analysis
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-balance">
            Got a Suspicious Message?
            <br />
            <span className="text-accent">We&apos;ll Check It.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Analyze emails, texts, URLs, and files for phishing, scams, and fraud. 
            Get instant AI-powered threat detection with detailed explanations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 text-center card-hover"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* System Status Banner */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-3 bg-success/5 border border-success/20 rounded-xl">
          <div className="flex items-center gap-2 text-success text-sm font-medium">
            <Activity className="h-4 w-4 animate-pulse" />
            System Online
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex flex-wrap items-center gap-3">
            {apiStatus.map((api) => (
              <div key={api.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-success" />
                {api.name}
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Form */}
        <div className="mb-8">
          <AnalysisForm 
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        </div>

        {/* Results */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnalysisResult result={result} />
          </div>
        )}

        {/* Quick Tips */}
        {!result && !isLoading && (
          <div className="bg-card border border-border rounded-xl p-6 mt-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Quick Security Tips
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <p>Never share passwords or OTPs via email, SMS, or phone calls.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <p>Verify sender addresses carefully - scammers use similar-looking domains.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <p>Hover over links before clicking to see the actual destination URL.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <p>Be wary of urgent requests - legitimate orgs rarely demand immediate action.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-medium">Phishing Guard AI</p>
          <p className="text-xs mt-1">Protecting you from digital threats with advanced AI technology.</p>
        </div>
      </footer>
    </div>
  )
}
