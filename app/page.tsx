"use client"

import { useState, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { AnalysisForm } from "@/components/analysis-form"
import { AnalysisResult, type AnalysisResultData } from "@/components/analysis-result"
import { Shield, Zap, Brain, Lock, AlertTriangle, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const LOADING_STEPS = [
  "Analyzing text patterns...",
  "Scanning for phishing indicators...",
  "Checking URL reputation...",
  "Evaluating risk factors...",
  "Generating AI assessment...",
]

const stats = [
  { label: "Threats Blocked", value: "2.5M+", icon: Shield },
  { label: "Detection Rate", value: "99.7%", icon: Zap },
  { label: "AI Models", value: "5+", icon: Brain },
  { label: "Real-time", value: "< 2s", icon: TrendingUp },
]

export default function AnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [result, setResult] = useState<AnalysisResultData | null>(null)

  const handleAnalyze = useCallback(async (formData: FormData) => {
    setIsLoading(true)
    setResult(null)

    // Simulate multi-step loading
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(LOADING_STEPS[i])
      await new Promise(resolve => setTimeout(resolve, 400))
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
        toast.error("High-risk content detected!", {
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            AI-Powered Security Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="gradient-text">Phishing Guard</span> AI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Protect yourself from phishing, scams, and digital fraud with our advanced 
            AI detection system. Analyze suspicious content in seconds.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className="glass rounded-xl p-4 text-center"
            >
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
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
          <div className="glass rounded-xl p-6 mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Quick Security Tips
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                <p>Never share passwords or OTPs via email, SMS, or phone calls.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                <p>Verify sender addresses carefully - scammers often use similar-looking domains.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                <p>Hover over links before clicking to see the actual destination URL.</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 mt-1 text-primary shrink-0" />
                <p>Be wary of urgent requests - legitimate organizations rarely demand immediate action.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Phishing Guard AI - Protecting you from digital threats with advanced AI technology.</p>
        </div>
      </footer>
    </div>
  )
}
