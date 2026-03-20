"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskMeter } from "@/components/risk-meter"
import { cn } from "@/lib/utils"
import {
  Globe,
  Search,
  Shield,
  Lock,
  MapPin,
  Server,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
  Building,
  Info,
} from "lucide-react"
import { toast } from "sonner"

interface TrackResult {
  domain: string
  age: string
  ip: string | null
  location: string | null
  ssl: "Valid" | "Invalid" | "Unknown"
  reputation: string
  risk: "Low" | "Medium" | "High"
  registrar: string | null
  details: string[]
}

const riskColors = {
  Low: "text-success",
  Medium: "text-warning",
  High: "text-destructive",
}

const riskScores = {
  Low: 25,
  Medium: 55,
  High: 85,
}

const sslIcons = {
  Valid: CheckCircle2,
  Invalid: XCircle,
  Unknown: AlertTriangle,
}

const sslColors = {
  Valid: "text-success",
  Invalid: "text-destructive",
  Unknown: "text-warning",
}

export default function TrackerPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TrackResult | null>(null)

  const handleTrack = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL to analyze")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/track?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        throw new Error("Failed to analyze domain")
      }

      const data = await response.json()
      setResult(data)
      
      if (data.risk === "High") {
        toast.error("High-risk domain detected!", {
          description: "Exercise extreme caution with this website.",
        })
      } else if (data.risk === "Medium") {
        toast.warning("Medium-risk domain", {
          description: "Verify the legitimacy before proceeding.",
        })
      } else {
        toast.success("Domain analysis complete", {
          description: "Domain appears to be relatively safe.",
        })
      }
    } catch {
      toast.error("Failed to analyze domain", {
        description: "Please check the URL and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const SslIcon = result ? sslIcons[result.ssl] : CheckCircle2

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Globe className="h-4 w-4" />
            Domain Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            URL <span className="gradient-text">Tracker</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze any URL or domain for security threats, reputation scores, 
            and potential phishing indicators.
          </p>
        </div>

        {/* Search Form */}
        <Card className="glass mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Enter URL or domain to analyze (e.g., example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="pl-11 h-12 text-base bg-background/50"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleTrack} 
                disabled={isLoading || !url.trim()}
                size="lg"
                className="gap-2 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Risk Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <RiskMeter score={riskScores[result.risk]} />
                    <div className={cn(
                      "mt-4 px-4 py-2 rounded-full text-sm font-medium",
                      result.risk === "Low" && "bg-success/10 text-success",
                      result.risk === "Medium" && "bg-warning/10 text-warning",
                      result.risk === "High" && "bg-destructive/10 text-destructive"
                    )}>
                      {result.risk} Risk Level
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Domain Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>Domain</span>
                    </div>
                    <span className="font-medium">{result.domain}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Reputation</span>
                    </div>
                    <span className={cn("font-medium", riskColors[result.risk])}>
                      {result.reputation}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Domain Details Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Domain Age</p>
                      <p className="font-semibold">{result.age}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Server className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IP Address</p>
                      <p className="font-semibold">{result.ip || "Not available"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{result.location || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-lg", `${sslColors[result.ssl]}/10`.replace("text-", "bg-"))}>
                      <Lock className={cn("h-5 w-5", sslColors[result.ssl])} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SSL Certificate</p>
                      <p className={cn("font-semibold flex items-center gap-1", sslColors[result.ssl])}>
                        <SslIcon className="h-4 w-4" />
                        {result.ssl}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registrar</p>
                      <p className="font-semibold">{result.registrar || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Checked</p>
                      <p className="font-semibold">Just now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Details */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Analysis Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        "mt-1 h-2 w-2 rounded-full shrink-0",
                        result.risk === "Low" ? "bg-success" :
                        result.risk === "High" ? "bg-destructive" : "bg-warning"
                      )} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* External Links */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a 
                  href={`https://www.virustotal.com/gui/domain/${result.domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Check on VirusTotal
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a 
                  href={`https://who.is/whois/${result.domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  WHOIS Lookup
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a 
                  href={`https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(url)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Safe Browsing
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="text-center py-16">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Enter a URL to analyze</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Get detailed domain intelligence including age, reputation, 
              SSL status, and security risk assessment.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
