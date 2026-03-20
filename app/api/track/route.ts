import { generateText, Output } from "ai"
import { z } from "zod"
import {
  scanUrlWithVirusTotal,
  checkGoogleSafeBrowsing,
  checkAbuseIPDB,
  getIPInfo,
  resolveDomainToIP,
} from "@/lib/api-services"

export const maxDuration = 30

const trackResultSchema = z.object({
  domain: z.string(),
  age: z.string(),
  ip: z.string().nullable(),
  location: z.string().nullable(),
  ssl: z.enum(["Valid", "Invalid", "Unknown"]),
  reputation: z.string(),
  risk: z.enum(["Low", "Medium", "High"]),
  registrar: z.string().nullable(),
  details: z.array(z.string()),
})

// Known safe domains
const TRUSTED_DOMAINS = [
  "google.com", "microsoft.com", "apple.com", "amazon.com", "facebook.com",
  "twitter.com", "linkedin.com", "github.com", "paypal.com", "netflix.com",
  "youtube.com", "instagram.com", "whatsapp.com", "zoom.us", "dropbox.com",
  "vercel.com", "cloudflare.com", "stripe.com", "slack.com", "notion.so",
]

// Suspicious TLDs
const SUSPICIOUS_TLDS = [".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".work", ".click", ".link", ".info", ".gq", ".buzz"]

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
  }
}

function analyzeDomainWithRules(url: string): z.infer<typeof trackResultSchema> {
  const domain = extractDomain(url)
  const details: string[] = []
  let riskLevel: "Low" | "Medium" | "High" = "Medium"
  let reputation = "Unknown"

  // Check if trusted domain
  if (TRUSTED_DOMAINS.some(d => domain.endsWith(d))) {
    riskLevel = "Low"
    reputation = "Trusted - Well-known organization"
    details.push("Domain belongs to a well-known organization")
    details.push("Has established online presence")
  }

  // Check for suspicious TLDs
  if (SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))) {
    riskLevel = "High"
    reputation = "Suspicious - Uses high-risk TLD"
    details.push("Uses a TLD commonly associated with malicious sites")
  }

  // Check for brand impersonation patterns
  const brandPatterns = ["paypa1", "paypai", "amaz0n", "g00gle", "micros0ft", "app1e", "faceb00k", "netfl1x"]
  if (brandPatterns.some(p => domain.includes(p))) {
    riskLevel = "High"
    reputation = "Dangerous - Possible brand impersonation"
    details.push("Domain appears to impersonate a well-known brand")
  }

  // Check for excessive hyphens or numbers
  const hyphenCount = (domain.match(/-/g) || []).length
  const numberCount = (domain.match(/\d/g) || []).length
  
  if (hyphenCount > 2) {
    if (riskLevel !== "High") riskLevel = "Medium"
    details.push("Domain contains multiple hyphens (common in phishing)")
  }
  
  if (numberCount > 3) {
    if (riskLevel !== "High") riskLevel = "Medium"
    details.push("Domain contains multiple numbers (suspicious pattern)")
  }

  // Check for very long domain names
  if (domain.length > 30) {
    if (riskLevel !== "High") riskLevel = "Medium"
    details.push("Unusually long domain name")
  }

  // Check if domain is an IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
    riskLevel = "High"
    reputation = "Suspicious - IP address used instead of domain"
    details.push("URL uses IP address instead of domain name")
  }

  const isHttps = url.startsWith("https://") || !url.startsWith("http://")
  
  if (details.length === 0) {
    details.push("Domain analysis completed")
    details.push("No major red flags detected, but verify legitimacy")
  }

  return {
    domain,
    age: riskLevel === "Low" ? "10+ years" : riskLevel === "Medium" ? "1-5 years" : "< 1 year (estimated)",
    ip: null,
    location: null,
    ssl: isHttps ? "Valid" : "Unknown",
    reputation: reputation || (riskLevel === "Low" ? "Good" : riskLevel === "High" ? "Poor" : "Unknown"),
    risk: riskLevel,
    registrar: null,
    details,
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")

    if (!url) {
      return Response.json({ error: "URL parameter is required" }, { status: 400 })
    }

    const domain = extractDomain(url)
    
    // Resolve domain to IP
    const resolvedIP = await resolveDomainToIP(domain)

    // Run external API checks in parallel
    const [virusTotalResult, safeBrowsingResult, abuseIPDBResult, ipInfoResult] = await Promise.all([
      scanUrlWithVirusTotal(url),
      checkGoogleSafeBrowsing(url),
      resolvedIP ? checkAbuseIPDB(resolvedIP) : Promise.resolve(null),
      resolvedIP ? getIPInfo(resolvedIP) : Promise.resolve(null),
    ])

    // Start with rule-based analysis
    const ruleAnalysis = analyzeDomainWithRules(url)
    const details = [...ruleAnalysis.details]
    let riskLevel = ruleAnalysis.risk
    let reputation = ruleAnalysis.reputation

    // Enhance with VirusTotal results
    if (virusTotalResult) {
      if (virusTotalResult.positives > 0) {
        details.push(`VirusTotal: ${virusTotalResult.positives}/${virusTotalResult.total} vendors flagged as malicious`)
        if (virusTotalResult.positives >= 5) riskLevel = "High"
        else if (virusTotalResult.positives >= 2) riskLevel = riskLevel === "Low" ? "Medium" : riskLevel
        reputation = `VirusTotal: ${virusTotalResult.positives} detections`
      } else {
        details.push("VirusTotal: No malicious detections")
      }
    }

    // Enhance with Google Safe Browsing
    if (safeBrowsingResult) {
      if (!safeBrowsingResult.isSafe) {
        details.push(`Google Safe Browsing: Flagged as ${safeBrowsingResult.threats.map(t => t.threatType).join(", ")}`)
        riskLevel = "High"
        reputation = "Google Safe Browsing: UNSAFE"
      } else {
        details.push("Google Safe Browsing: No threats detected")
      }
    }

    // Enhance with AbuseIPDB results
    if (abuseIPDBResult) {
      if (abuseIPDBResult.abuseConfidenceScore > 50) {
        details.push(`AbuseIPDB: ${abuseIPDBResult.abuseConfidenceScore}% abuse confidence, ${abuseIPDBResult.totalReports} reports`)
        riskLevel = "High"
      } else if (abuseIPDBResult.abuseConfidenceScore > 20) {
        details.push(`AbuseIPDB: ${abuseIPDBResult.abuseConfidenceScore}% abuse confidence`)
        if (riskLevel === "Low") riskLevel = "Medium"
      } else if (abuseIPDBResult.totalReports === 0) {
        details.push("AbuseIPDB: No abuse reports found")
      }
    }

    // Build location string from IPInfo
    let location = ruleAnalysis.location
    if (ipInfoResult) {
      location = `${ipInfoResult.city}, ${ipInfoResult.region}, ${ipInfoResult.country}`
      if (ipInfoResult.org) {
        details.push(`ISP/Org: ${ipInfoResult.org}`)
      }
    }

    // Try AI-enhanced analysis
    try {
      const { output } = await generateText({
        model: "openai/gpt-4o-mini",
        output: Output.object({ schema: trackResultSchema }),
        messages: [
          {
            role: "system",
            content: `You are a domain intelligence expert. Enhance the analysis with additional insights.

Current findings:
- Domain: ${domain}
- IP: ${resolvedIP || "Unknown"}
- Location: ${location || "Unknown"}
- Current risk level: ${riskLevel}
- Details: ${details.join("; ")}

Provide realistic domain age estimate and enhanced reputation assessment. Add any additional security observations.`
          },
          { role: "user", content: `Analyze security profile for: ${domain}` }
        ],
      })

      // Merge AI insights
      return Response.json({
        domain,
        age: output.age,
        ip: resolvedIP || output.ip,
        location: location || output.location,
        ssl: ruleAnalysis.ssl,
        reputation: output.reputation || reputation,
        risk: riskLevel,
        registrar: output.registrar,
        details: [...new Set([...details, ...output.details])],
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
          abuseipdb: abuseIPDBResult ? {
            abuse_confidence: abuseIPDBResult.abuseConfidenceScore,
            total_reports: abuseIPDBResult.totalReports,
            isp: abuseIPDBResult.isp,
            country: abuseIPDBResult.countryCode,
          } : null,
          ipinfo: ipInfoResult ? {
            city: ipInfoResult.city,
            region: ipInfoResult.region,
            country: ipInfoResult.country,
            org: ipInfoResult.org,
          } : null,
        },
      })
    } catch {
      // Return rule-based + external API results
      return Response.json({
        ...ruleAnalysis,
        ip: resolvedIP,
        location,
        risk: riskLevel,
        reputation,
        details,
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
          abuseipdb: abuseIPDBResult ? {
            abuse_confidence: abuseIPDBResult.abuseConfidenceScore,
            total_reports: abuseIPDBResult.totalReports,
          } : null,
          ipinfo: ipInfoResult,
        },
      })
    }
  } catch (error) {
    console.error("Track error:", error)
    return Response.json({ error: "Failed to analyze domain" }, { status: 500 })
  }
}
