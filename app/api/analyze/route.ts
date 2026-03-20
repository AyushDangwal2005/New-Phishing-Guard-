import { generateText, Output } from "ai"
import { z } from "zod"

export const maxDuration = 60

const analysisResultSchema = z.object({
  risk_level: z.enum(["safe", "suspicious", "dangerous"]),
  risk_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  actions: z.array(z.string()),
  highlighted_words: z.array(z.string()),
})

// Phishing detection patterns for fallback
const PHISHING_KEYWORDS = [
  "urgent", "immediately", "verify", "suspended", "locked", "confirm",
  "password", "credentials", "otp", "pin", "bank", "account",
  "winner", "lottery", "prize", "free", "limited time", "act now",
  "click here", "update payment", "unusual activity", "security alert",
  "dear customer", "dear user", "your account", "expires today",
  "verification required", "action required", "confirm identity",
]

const SUSPICIOUS_URL_PATTERNS = [
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
  /bit\.ly|tinyurl|t\.co|goo\.gl/i, // URL shorteners
  /@.*\./,  // @ symbol in URL
  /\.xyz|\.top|\.tk|\.ml|\.ga|\.cf/i, // Suspicious TLDs
  /login|signin|verify|secure|account|update/i, // Phishing keywords in URL
  /[a-z0-9]{30,}/i, // Very long random strings
]

function analyzeWithRules(text: string, url: string): z.infer<typeof analysisResultSchema> {
  const lowerText = (text + " " + url).toLowerCase()
  const foundKeywords: string[] = []
  const reasons: string[] = []
  const actions: string[] = []
  let riskScore = 0

  // Check for phishing keywords
  for (const keyword of PHISHING_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword)
      riskScore += 8
    }
  }

  if (foundKeywords.length > 0) {
    reasons.push(`Contains ${foundKeywords.length} suspicious keywords: ${foundKeywords.slice(0, 5).join(", ")}${foundKeywords.length > 5 ? "..." : ""}`)
  }

  // Check URL patterns
  if (url) {
    for (const pattern of SUSPICIOUS_URL_PATTERNS) {
      if (pattern.test(url)) {
        riskScore += 15
        reasons.push("URL contains suspicious patterns")
        break
      }
    }

    if (url.includes("http://") && !url.includes("localhost")) {
      riskScore += 10
      reasons.push("Uses insecure HTTP connection")
    }

    // Check for mismatched domains (common phishing tactic)
    const domainMatch = url.match(/https?:\/\/([^\/]+)/)
    if (domainMatch) {
      const domain = domainMatch[1].toLowerCase()
      if (domain.includes("-") && (domain.includes("paypal") || domain.includes("amazon") || domain.includes("apple") || domain.includes("microsoft") || domain.includes("google"))) {
        riskScore += 25
        reasons.push("Domain mimics a well-known brand")
      }
    }
  }

  // Check for urgency indicators
  const urgencyPhrases = ["immediately", "urgent", "within 24 hours", "expires today", "act now", "don't wait"]
  const hasUrgency = urgencyPhrases.some(phrase => lowerText.includes(phrase))
  if (hasUrgency) {
    riskScore += 15
    reasons.push("Creates artificial sense of urgency")
  }

  // Check for requests for sensitive information
  const sensitiveRequests = ["password", "credit card", "ssn", "social security", "bank account", "pin number"]
  const requestsSensitive = sensitiveRequests.some(req => lowerText.includes(req))
  if (requestsSensitive) {
    riskScore += 20
    reasons.push("Requests sensitive personal information")
  }

  // Check for generic greetings
  if (/dear (customer|user|member|sir|madam)/i.test(lowerText)) {
    riskScore += 10
    reasons.push("Uses generic greeting instead of your name")
  }

  // Cap risk score
  riskScore = Math.min(riskScore, 100)

  // Determine risk level
  let riskLevel: "safe" | "suspicious" | "dangerous"
  if (riskScore <= 25) {
    riskLevel = "safe"
    if (reasons.length === 0) {
      reasons.push("No suspicious patterns detected")
    }
    actions.push("Content appears safe to interact with")
    actions.push("Always verify sender identity for important requests")
  } else if (riskScore <= 60) {
    riskLevel = "suspicious"
    actions.push("Verify the sender through official channels")
    actions.push("Do not click any links until verified")
    actions.push("Check the sender's email address carefully")
    actions.push("Contact the organization directly using known contact info")
  } else {
    riskLevel = "dangerous"
    actions.push("Do NOT click any links in this message")
    actions.push("Do NOT reply or provide any information")
    actions.push("Report this message as phishing")
    actions.push("Delete the message immediately")
    actions.push("If you shared any info, change passwords immediately")
  }

  return {
    risk_level: riskLevel,
    risk_score: riskScore,
    confidence_score: Math.min(70 + reasons.length * 5, 95),
    reasons,
    actions,
    highlighted_words: foundKeywords.slice(0, 10),
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const text = formData.get("text") as string || ""
    const url = formData.get("url") as string || ""
    const file = formData.get("file") as File | null

    let contentToAnalyze = text
    let extractedFileText = ""

    // Handle file if present
    if (file) {
      if (file.type.startsWith("text/") || file.type === "application/pdf") {
        extractedFileText = await file.text()
        contentToAnalyze += "\n\n[File Content]:\n" + extractedFileText
      }
    }

    if (url) {
      contentToAnalyze += "\n\n[URL to analyze]: " + url
    }

    if (!contentToAnalyze.trim()) {
      return Response.json(
        { error: "No content provided for analysis" },
        { status: 400 }
      )
    }

    try {
      // Try AI-powered analysis first
      const { output } = await generateText({
        model: "openai/gpt-4o-mini",
        output: Output.object({
          schema: analysisResultSchema,
        }),
        messages: [
          {
            role: "system",
            content: `You are an expert cybersecurity analyst specializing in phishing, scam, and fraud detection. Analyze the provided content for:

1. Phishing indicators (fake login pages, credential harvesting)
2. Scam patterns (lottery scams, advance fee fraud, romance scams)
3. Social engineering tactics (urgency, fear, authority impersonation)
4. Suspicious URLs (typosquatting, URL shorteners, suspicious domains)
5. Malicious content indicators

Provide a detailed analysis with specific reasons for your risk assessment. Be accurate and thorough.`
          },
          {
            role: "user",
            content: `Analyze this content for phishing, scams, and fraud:\n\n${contentToAnalyze}`
          }
        ],
      })

      return Response.json({
        ...output,
        original_text: text,
      })
    } catch {
      // Fallback to rule-based analysis
      console.log("AI unavailable, using rule-based analysis")
      const fallbackResult = analyzeWithRules(contentToAnalyze, url)
      
      return Response.json({
        ...fallbackResult,
        original_text: text,
      })
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json(
      { error: "Failed to analyze content" },
      { status: 500 }
    )
  }
}
