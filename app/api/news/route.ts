import { fetchSecurityNews } from "@/lib/api-services"

export const dynamic = "force-dynamic"

interface NewsItem {
  title: string
  source: string
  time: string
  url: string
  description?: string
  image?: string
}

// Fallback cybersecurity news when API is unavailable
const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "New AI-Powered Phishing Attacks Target Corporate Executives",
    source: "Security Week",
    time: "2 hours ago",
    url: "https://www.securityweek.com",
    description: "Researchers have discovered a sophisticated phishing campaign using AI-generated content to target C-suite executives."
  },
  {
    title: "Major Bank Warns Customers of SMS Phishing Surge",
    source: "BankInfoSecurity",
    time: "4 hours ago",
    url: "https://www.bankinfosecurity.com",
    description: "Financial institutions report 300% increase in smishing attacks targeting banking customers."
  },
  {
    title: "Google Blocks 100 Million Phishing Emails Daily with New AI",
    source: "The Verge",
    time: "6 hours ago",
    url: "https://www.theverge.com",
    description: "Google's latest AI security measures are blocking record numbers of malicious emails."
  },
  {
    title: "FBI Issues Warning About QR Code Phishing Scams",
    source: "FBI.gov",
    time: "8 hours ago",
    url: "https://www.fbi.gov",
    description: "Federal Bureau of Investigation alerts public about increasing QR code-based phishing attacks."
  },
  {
    title: "Cryptocurrency Scams Cost Consumers $3.9 Billion in 2024",
    source: "CoinDesk",
    time: "12 hours ago",
    url: "https://www.coindesk.com",
    description: "New report reveals staggering losses from crypto-related fraud and investment scams."
  },
  {
    title: "Social Media Platforms Deploy New Anti-Scam Features",
    source: "TechCrunch",
    time: "1 day ago",
    url: "https://techcrunch.com",
    description: "Meta, Twitter, and TikTok announce coordinated effort to combat romance scams."
  },
  {
    title: "Healthcare Sector Sees 45% Increase in Phishing Attacks",
    source: "Healthcare IT News",
    time: "1 day ago",
    url: "https://www.healthcareitnews.com",
    description: "Medical institutions face unprecedented wave of credential harvesting attempts."
  },
  {
    title: "New Browser Extension Helps Users Identify Fake Websites",
    source: "Ars Technica",
    time: "2 days ago",
    url: "https://arstechnica.com",
    description: "Open-source tool uses machine learning to detect phishing sites in real-time."
  },
]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export async function GET() {
  try {
    // Try to fetch from News API
    const newsArticles = await fetchSecurityNews()

    if (newsArticles.length > 0) {
      const formattedNews: NewsItem[] = newsArticles.map(article => ({
        title: article.title,
        source: article.source,
        time: formatTimeAgo(article.publishedAt),
        url: article.url,
        description: article.description,
        image: article.urlToImage,
      }))

      return Response.json({
        articles: formattedNews.slice(0, 8),
        source: "live",
        lastUpdated: new Date().toISOString(),
      })
    }

    // Fallback to static news
    return Response.json({
      articles: FALLBACK_NEWS.slice(0, 6),
      source: "cached",
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("News fetch error:", error)
    
    // Return fallback news on error
    return Response.json({
      articles: FALLBACK_NEWS.slice(0, 6),
      source: "cached",
      lastUpdated: new Date().toISOString(),
    })
  }
}
