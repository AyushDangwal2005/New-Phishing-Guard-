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
  Scan,
  Activity,
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
  abuseipdb?: {
    abuse_confidence: number
    total_reports: number
    isp?: string
    country?: string
  } | null
  ipinfo?: {
    city: string
    region: string
    country: string
    org: string
  } | null
}

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
  external_scans?: ExternalScans
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
        toast.error("ALERT: High-risk domain detected!", {
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
            <Globe className="h-4 w-4" />
            Domain Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-balance">
            Check Any URL
            <br />
            <span className="text-accent">Before You Click</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get comprehensive domain intelligence: reputation scores, 
            IP geolocation, SSL verification, and threat analysis.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-2">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Enter URL or domain (e.g., suspicious-site.xyz)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="pl-11 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleTrack} 
                disabled={isLoading || !url.trim()}
                size="lg"
                className="gap-2 px-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Track URL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Risk Overview */}
            <div className="grid gap-5 md:grid-cols-2">
              <Card className="border-2" style={{
                borderColor: result.risk === "Low" ? "var(--success)" : 
                             result.risk === "Medium" ? "var(--warning)" : "var(--destructive)"
              }}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <RiskMeter score={riskScores[result.risk]} />
                    <div className={cn(
                      "mt-4 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide",
                      result.risk === "Low" && "bg-success/10 text-success",
                      result.risk === "Medium" && "bg-warning/10 text-warning",
                      result.risk === "High" && "bg-destructive/10 text-destructive"
                    )}>
                      {result.risk} Risk
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent" />
                    Domain Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Globe className="h-4 w-4" />
                      <span>Domain</span>
                    </div>
                    <span className="font-semibold">{result.domain}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Reputation</span>
                    </div>
                    <span className={cn("font-semibold", riskColors[result.risk])}>
                      {result.reputation}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                              {result.external_scans.virustotal.positives}/{result.external_scans.virustotal.total}
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

                    {/* Safe Browsing */}
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
                              {result.external_scans.google_safe_browsing.is_safe ? "Clear" : "Threats"}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Not scanned</div>
                          )}
                        </div>
                      </div>
                      {result.external_scans.google_safe_browsing?.is_safe && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                    </div>

                    {/* AbuseIPDB */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                          <Activity className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">AbuseIPDB</div>
                          {result.external_scans.abuseipdb ? (
                            <div className={cn(
                              "text-xs font-medium",
                              result.external_scans.abuseipdb.abuse_confidence > 50 ? "text-destructive" :
                              result.external_scans.abuseipdb.abuse_confidence > 20 ? "text-warning" : "text-success"
                            )}>
                              {result.external_scans.abuseipdb.abuse_confidence}% abuse
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Not checked</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* IPInfo */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">IPInfo</div>
                          {result.external_scans.ipinfo ? (
                            <div className="text-xs text-muted-foreground">
                              {result.external_scans.ipinfo.country}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">Not resolved</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Domain Details Grid */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-accent/10">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Domain Age</p>
                      <p className="font-bold">{result.age}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-accent/10">
                      <Server className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">IP Address</p>
                      <p className="font-bold font-mono text-sm">{result.ip || "Not available"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-accent/10">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</p>
                      <p className="font-bold">{result.location || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-lg", 
                      result.ssl === "Valid" ? "bg-success/10" :
                      result.ssl === "Invalid" ? "bg-destructive/10" : "bg-warning/10"
                    )}>
                      <Lock className={cn("h-5 w-5", sslColors[result.ssl])} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">SSL Certificate</p>
                      <p className={cn("font-bold flex items-center gap-1", sslColors[result.ssl])}>
                        <SslIcon className="h-4 w-4" />
                        {result.ssl}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-accent/10">
                      <Building className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Registrar</p>
                      <p className="font-bold">{result.registrar || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-accent/10">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last Checked</p>
                      <p className="font-bold">Just now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Analysis Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {result.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <div className={cn(
                        "mt-1.5 h-2 w-2 rounded-full shrink-0",
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
                  VirusTotal
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
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a 
                  href={`https://www.abuseipdb.com/check/${result.ip || result.domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  AbuseIPDB
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
              <Globe className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold mb-2">Enter a URL to analyze</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Get detailed domain intelligence including age, reputation, 
              SSL status, IP geolocation, and security risk assessment.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
