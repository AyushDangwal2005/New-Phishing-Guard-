import { generateText, Output } from "ai"
import { z } from "zod"
import {
  scanUrlWithVirusTotal,
  checkGoogleSafeBrowsing,
  classifyTextWithHuggingFace,
} from "@/lib/api-services"

export const maxDuration = 60

const analysisResultSchema = z.object({
  risk_level: z.enum(["safe", "suspicious", "dangerous"]),
  risk_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  actions: z.array(z.string()),
  highlighted_words: z.array(z.string()),
})

// Comprehensive phishing detection patterns
const SUSPICIOUS_PATTERNS = {
  urgency: [
    "urgent", "immediately", "act now", "limited time", "expires", "deadline",
    "hurry", "quick", "fast", "asap", "right away", "don't delay", "last chance",
    "final notice", "time sensitive", "within 24 hours", "within 48 hours"
  ],
  financial: [
    "bank", "account", "credit card", "payment", "transfer", "wire", "bitcoin",
    "crypto", "investment", "lottery", "prize", "winner", "inheritance", "million",
    "free money", "tax refund", "loan approved", "debt relief"
  ],
  credentials: [
    "password", "login", "verify", "confirm", "update your", "account suspended",
    "unusual activity", "security alert", "otp", "verification code", "pin",
    "ssn", "social security", "identity", "authenticate"
  ],
  threats: [
    "suspended", "blocked", "terminated", "legal action", "arrest", "police",
    "lawsuit", "court", "warrant", "fine", "penalty", "consequence", "lose access"
  ],
  impersonation: [
    "irs", "fbi", "government", "microsoft", "apple", "amazon", "paypal", "netflix",
    "google", "facebook", "whatsapp", "customer service", "tech support", "official"
  ],
  phishing_links: [
    "click here", "click this link", "click below", "visit this link",
    "open attachment", "download", "sign in", "log in", "access your account"
  ],
}

const SUSPICIOUS_URL_PATTERNS = [
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd/i,
  /@.*\./,
  /\.xyz|\.top|\.tk|\.ml|\.ga|\.cf|\.gq|\.work|\.click/i,
  /login|signin|verify|secure|account|update/i,
  /[a-z0-9]{30,}/i,
]

function analyzeTextPatterns(text: string): {
  score: number
  reasons: string[]
  highlightedWords: string[]
  threatTypes: string[]
} {
  const lowerText = text.toLowerCase()
  let score = 0
  const reasons: string[] = []
  const highlightedWords: string[] = []
  const threatTypes: string[] = []

  for (const [category, patterns] of Object.entries(SUSPICIOUS_PATTERNS)) {
    const matches = patterns.filter(p => lowerText.includes(p))
    if (matches.length > 0) {
      highlightedWords.push(...matches)
      
      switch (category) {
        case "urgency":
          score += matches.length * 8
          reasons.push(`Urgency tactics detected: "${matches.slice(0, 3).join('", "')}"`)
          threatTypes.push("Social Engineering")
          break
        case "financial":
          score += matches.length * 10
          reasons.push(`Financial/monetary references found: "${matches.slice(0, 3).join('", "')}"`)
          threatTypes.push("Financial Fraud")
          break
        case "credentials":
          score += matches.length * 12
          reasons.push(`Credential harvesting indicators: "${matches.slice(0, 3).join('", "')}"`)
          threatTypes.push("Credential Phishing")
          break
        case "threats":
          score += matches.length * 10
          reasons.push(`Threatening language detected: "${matches.slice(0, 3).join('", "')}"`)
          threatTypes.push("Intimidation Scam")
          break
        case "impersonation":
          score += matches.length * 12
          reasons.push(`Possible impersonation of: "${matches.slice(0, 3).join('", "')}"`)
          threatTypes.push("Brand Impersonation")
          break
        case "phishing_links":
          score += matches.length * 8
          reasons.push(`Suspicious call-to-action: "${matches.slice(0, 3).join('", "')}"`)
          threatTypes.push("Phishing")
          break
      }
    }
  }

  // Generic greetings
  if (/dear (customer|user|member|sir|madam)/i.test(lowerText)) {
    score += 10
    reasons.push("Uses generic greeting instead of your name")
  }

  // Excessive punctuation
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 3) {
    score += exclamationCount * 2
    reasons.push("Excessive punctuation for emphasis")
  }

  // ALL CAPS
  const capsWords = text.match(/\b[A-Z]{4,}\b/g) || []
  if (capsWords.length > 2) {
    score += capsWords.length * 3
    reasons.push("Excessive use of capital letters")
    highlightedWords.push(...capsWords.slice(0, 5))
  }

  return {
    score: Math.min(score, 100),
    reasons,
    highlightedWords: [...new Set(highlightedWords)],
    threatTypes: [...new Set(threatTypes)]
  }
}

function analyzeUrlPatterns(url: string): {
  score: number
  reasons: string[]
  threatTypes: string[]
} {
  let score = 0
  const reasons: string[] = []
  const threatTypes: string[] = []

  try {
    const urlObj = new URL(url)
    
    // IP address check
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(urlObj.hostname)) {
      score += 30
      reasons.push("URL uses IP address instead of domain name")
      threatTypes.push("Suspicious Infrastructure")
    }

    // Suspicious TLDs
    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work", ".click", ".link"]
    if (suspiciousTlds.some(tld => urlObj.hostname.endsWith(tld))) {
      score += 25
      reasons.push("Domain uses high-risk TLD commonly associated with malicious sites")
      threatTypes.push("Suspicious Domain")
    }

    // URL shorteners
    const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd"]
    if (shorteners.some(s => urlObj.hostname.includes(s))) {
      score += 15
      reasons.push("URL shortener detected - destination is hidden")
      threatTypes.push("Obfuscated Link")
    }

    // Brand names in suspicious positions
    const brands = ["paypal", "amazon", "apple", "microsoft", "google", "netflix", "facebook", "bank"]
    const brandMatches = brands.filter(b => 
      urlObj.hostname.includes(b) && 
      !urlObj.hostname.match(new RegExp(`^(www\\.)?${b}\\.(com|org|net)$`))
    )
    if (brandMatches.length > 0) {
      score += 35
      reasons.push(`Possible brand impersonation: "${brandMatches.join('", "')}" in non-official domain`)
      threatTypes.push("Brand Spoofing")
    }

    // Excessive hyphens
    if ((urlObj.hostname.match(/-/g) || []).length > 2) {
      score += 10
      reasons.push("Domain contains excessive hyphens")
    }

    // No HTTPS
    if (urlObj.protocol !== "https:") {
      score += 10
      reasons.push("URL does not use HTTPS encryption")
      threatTypes.push("Insecure Connection")
    }

  } catch {
    score += 20
    reasons.push("URL appears malformed or invalid")
    threatTypes.push("Invalid URL")
  }

  return {
    score: Math.min(score, 100),
    reasons,
    threatTypes: [...new Set(threatTypes)]
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const text = formData.get("text") as string || ""
    const url = formData.get("url") as string || ""
    const file = formData.get("file") as File | null

    let contentToAnalyze = text
    let fileInfo: { type: string; name: string; size: number } | null = null

    // Handle file
    if (file) {
      fileInfo = { type: file.type, name: file.name, size: file.size }
      
      if (file.type.startsWith("text/") || file.type === "application/pdf") {
        const fileText = await file.text()
        contentToAnalyze += "\n\n[File Content]:\n" + fileText
      }
    }

    if (url) {
      contentToAnalyze += "\n\n[URL to analyze]: " + url
    }

    if (!contentToAnalyze.trim()) {
      return Response.json({ error: "No content provided for analysis" }, { status: 400 })
    }

    // Run external API checks in parallel
    const [virusTotalResult, safeBrowsingResult, huggingfaceResult] = await Promise.all([
      url ? scanUrlWithVirusTotal(url) : Promise.resolve(null),
      url ? checkGoogleSafeBrowsing(url) : Promise.resolve(null),
      contentToAnalyze.length > 20 ? classifyTextWithHuggingFace(contentToAnalyze.slice(0, 500)) : Promise.resolve(null),
    ])

    // Rule-based analysis
    const textAnalysis = analyzeTextPatterns(contentToAnalyze)
    const urlAnalysis = url ? analyzeUrlPatterns(url) : { score: 0, reasons: [], threatTypes: [] }

    // External API scoring
    let externalScore = 0
    const externalReasons: string[] = []
    const externalThreatTypes: string[] = []

    if (virusTotalResult && virusTotalResult.positives > 0) {
      externalScore += Math.min(virusTotalResult.positives * 10, 50)
      externalReasons.push(`VirusTotal: ${virusTotalResult.positives}/${virusTotalResult.total} security vendors flagged this URL`)
      externalThreatTypes.push("Malicious URL")
    }

    if (safeBrowsingResult && !safeBrowsingResult.isSafe) {
      externalScore += 40
      externalReasons.push(`Google Safe Browsing: Flagged as ${safeBrowsingResult.threats.map(t => t.threatType).join(", ")}`)
      safeBrowsingResult.threats.forEach(t => externalThreatTypes.push(t.threatType))
    }

    if (huggingfaceResult) {
      const harmfulLabels = ["phishing", "scam", "spam", "suspicious"]
      if (harmfulLabels.includes(huggingfaceResult.label) && huggingfaceResult.score > 0.6) {
        externalScore += Math.round(huggingfaceResult.score * 30)
        externalReasons.push(`ML Classification: ${huggingfaceResult.label} (${Math.round(huggingfaceResult.score * 100)}% confidence)`)
        externalThreatTypes.push(huggingfaceResult.label.charAt(0).toUpperCase() + huggingfaceResult.label.slice(1))
      }
    }

    // Combined scoring
    const ruleScore = textAnalysis.score * 0.5 + urlAnalysis.score * 0.5
    const combinedScore = Math.min(
      Math.round(ruleScore * 0.6 + externalScore * 0.4),
      100
    )

    // Build reasons and threat types
    const allReasons = [...textAnalysis.reasons, ...urlAnalysis.reasons, ...externalReasons]
    const allThreatTypes = [...new Set([...textAnalysis.threatTypes, ...urlAnalysis.threatTypes, ...externalThreatTypes])]

    // Try AI-powered enhanced analysis
    let aiResult = null
    try {
      const { output } = await generateText({
        model: "openai/gpt-4o-mini",
        output: Output.object({ schema: analysisResultSchema }),
        messages: [
          {
            role: "system",
            content: `You are an expert cybersecurity analyst specializing in phishing, scam, and fraud detection. Analyze content for:
1. Phishing indicators (fake login pages, credential harvesting)
2. Scam patterns (lottery, advance fee fraud, romance scams)
3. Social engineering tactics (urgency, fear, authority)
4. Suspicious URLs (typosquatting, shorteners, suspicious domains)
5. Malicious content indicators

Current rule-based findings:
- Risk score: ${combinedScore}/100
- Detected issues: ${allReasons.join("; ") || "None"}
- External scan results: ${externalReasons.join("; ") || "None"}

Enhance the analysis with additional insights.`
          },
          { role: "user", content: `Analyze:\n\n${contentToAnalyze.slice(0, 2000)}` }
        ],
      })
      aiResult = output
    } catch {
      // AI unavailable - continue with rule-based
    }

    // Merge AI insights
    if (aiResult) {
      aiResult.reasons.forEach(r => {
        if (!allReasons.some(existing => existing.toLowerCase().includes(r.toLowerCase().slice(0, 20)))) {
          allReasons.push(r)
        }
      })
    }

    // Determine final risk level
    const finalScore = aiResult ? Math.round((combinedScore + aiResult.risk_score) / 2) : combinedScore
    let riskLevel: "safe" | "suspicious" | "dangerous"
    
    if (finalScore >= 60) {
      riskLevel = "dangerous"
    } else if (finalScore >= 30) {
      riskLevel = "suspicious"
    } else {
      riskLevel = "safe"
    }

    // Generate actions
    const actions: string[] = []
    if (riskLevel === "dangerous") {
      actions.push("Do NOT click any links in this message")
      actions.push("Do NOT provide any personal information")
      actions.push("Report this message as phishing/spam")
      actions.push("Block the sender immediately")
      if (url) actions.push("Do NOT visit the linked website")
    } else if (riskLevel === "suspicious") {
      actions.push("Verify the sender through official channels")
      actions.push("Do not click links - navigate directly to official websites")
      actions.push("Be cautious with any requests for information")
    } else {
      if (allReasons.length === 0) allReasons.push("No suspicious patterns detected")
      actions.push("Content appears legitimate")
      actions.push("Always verify sender identity for sensitive requests")
    }

    return Response.json({
      risk_level: riskLevel,
      risk_score: finalScore,
      confidence_score: Math.min(75 + allReasons.length * 3, 98),
      reasons: allReasons,
      actions,
      highlighted_words: textAnalysis.highlightedWords.slice(0, 15),
      threat_types: allThreatTypes.length > 0 ? allThreatTypes : null,
      original_text: text,
      file_info: fileInfo,
      external_scans: {
        virustotal: virusTotalResult ? {
          positives: virusTotalResult.positives,
          total: virusTotalResult.total,
          permalink: virusTotalResult.permalink,
        } : null,
        google_safe_browsing: safeBrowsingResult ? {
          is_safe: safeBrowsingResult.isSafe,
          threats: safeBrowsingResult.threats.map(t => t.threatType),
        } : null,
        huggingface: huggingfaceResult ? {
          label: huggingfaceResult.label,
          confidence: Math.round(huggingfaceResult.score * 100),
        } : null,
      },
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json({ error: "Failed to analyze content" }, { status: 500 })
  }
}
