"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Clock,
  AlertTriangle,
  Shield,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

interface NewsItem {
  title: string
  source: string
  time: string
  url: string
  description?: string
}

const threatStats = [
  { label: "Phishing Attacks Today", value: "3.4B", trend: "+12%", color: "text-destructive" },
  { label: "Blocked Threats", value: "99.2%", trend: "+0.3%", color: "text-success" },
  { label: "New Malware Variants", value: "450K", trend: "+8%", color: "text-warning" },
  { label: "Data Breaches YTD", value: "2,847", trend: "-5%", color: "text-primary" },
]

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/news")
      if (!response.ok) throw new Error("Failed to fetch news")
      const data = await response.json()
      setNews(data)
      setLastUpdated(new Date())
    } catch {
      toast.error("Failed to load news")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleRefresh = () => {
    fetchNews()
    toast.success("News refreshed")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Newspaper className="h-4 w-4" />
            Threat Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Security <span className="gradient-text">News</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed about the latest cybersecurity threats, phishing campaigns, 
            and security best practices.
          </p>
        </div>

        {/* Threat Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {threatStats.map((stat) => (
            <Card key={stat.label} className="glass">
              <CardContent className="pt-6 text-center">
                <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${
                  stat.trend.startsWith("+") && stat.color === "text-destructive" 
                    ? "text-destructive" 
                    : stat.trend.startsWith("-") && stat.color === "text-destructive"
                    ? "text-success"
                    : stat.color
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* News Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-warning" />
            Latest Security News
          </h2>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* News Grid */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            news.map((item, index) => (
              <Card 
                key={index} 
                className="glass transition-all hover:ring-2 hover:ring-primary/50"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-secondary rounded-full">
                          {item.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      asChild
                      className="shrink-0"
                    >
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Read more about ${item.title}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Security Tips */}
        <Card className="glass mt-8 border-primary/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Stay Protected
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <p className="text-muted-foreground">
                  Subscribe to security alerts from organizations you use
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <p className="text-muted-foreground">
                  Keep your software and security tools updated
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <p className="text-muted-foreground">
                  Use our Analyzer tool to check suspicious content
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</div>
                <p className="text-muted-foreground">
                  Report phishing attempts to help protect others
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Resources */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Trusted Security Resources</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "CISA", url: "https://www.cisa.gov" },
              { name: "NIST", url: "https://www.nist.gov/cybersecurity" },
              { name: "Krebs on Security", url: "https://krebsonsecurity.com" },
              { name: "Have I Been Pwned", url: "https://haveibeenpwned.com" },
              { name: "VirusTotal", url: "https://www.virustotal.com" },
            ].map((resource) => (
              <Button key={resource.name} variant="outline" size="sm" asChild className="gap-2">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
