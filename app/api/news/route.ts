export const dynamic = "force-dynamic"

interface NewsItem {
  title: string
  source: string
  time: string
  url: string
  description?: string
}

// Cybersecurity news from real RSS feeds simulation
// In production, this would fetch from actual news APIs
const CYBERSECURITY_NEWS: NewsItem[] = [
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

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Randomize order slightly and return fresh timestamps
  const shuffled = [...CYBERSECURITY_NEWS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)

  return Response.json(shuffled)
}
