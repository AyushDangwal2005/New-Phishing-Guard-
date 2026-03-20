// External API Services for Phishing Guard AI

// ==================== VIRUSTOTAL ====================
export interface VirusTotalResult {
  positives: number
  total: number
  scanDate: string
  permalink: string
  categories: string[]
  lastAnalysisStats: {
    harmless: number
    malicious: number
    suspicious: number
    undetected: number
  }
}

export async function scanUrlWithVirusTotal(url: string): Promise<VirusTotalResult | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY
  if (!apiKey) return null

  try {
    // Submit URL for scanning
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(url)}`,
    })

    if (!submitResponse.ok) return null

    const submitData = await submitResponse.json()
    const analysisId = submitData.data?.id

    // Get analysis results
    const analysisResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: { 'x-apikey': apiKey },
      }
    )

    if (!analysisResponse.ok) return null

    const analysisData = await analysisResponse.json()
    const stats = analysisData.data?.attributes?.stats || {}

    return {
      positives: stats.malicious || 0,
      total: Object.values(stats).reduce((a: number, b) => a + (b as number), 0),
      scanDate: new Date().toISOString(),
      permalink: `https://www.virustotal.com/gui/url/${analysisId}`,
      categories: [],
      lastAnalysisStats: {
        harmless: stats.harmless || 0,
        malicious: stats.malicious || 0,
        suspicious: stats.suspicious || 0,
        undetected: stats.undetected || 0,
      },
    }
  } catch (error) {
    console.error('VirusTotal API error:', error)
    return null
  }
}

// ==================== GOOGLE SAFE BROWSING ====================
export interface SafeBrowsingResult {
  isSafe: boolean
  threats: Array<{
    threatType: string
    platformType: string
    threatEntryType: string
  }>
}

export async function checkGoogleSafeBrowsing(url: string): Promise<SafeBrowsingResult | null> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            clientId: 'phishing-guard-ai',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const threats = data.matches || []

    return {
      isSafe: threats.length === 0,
      threats: threats.map((t: { threatType: string; platformType: string; threatEntryType: string }) => ({
        threatType: t.threatType,
        platformType: t.platformType,
        threatEntryType: t.threatEntryType,
      })),
    }
  } catch (error) {
    console.error('Google Safe Browsing API error:', error)
    return null
  }
}

// ==================== ABUSEIPDB ====================
export interface AbuseIPDBResult {
  ipAddress: string
  isPublic: boolean
  abuseConfidenceScore: number
  countryCode: string
  usageType: string
  isp: string
  domain: string
  totalReports: number
  lastReportedAt: string | null
  isWhitelisted: boolean
}

export async function checkAbuseIPDB(ip: string): Promise<AbuseIPDBResult | null> {
  const apiKey = process.env.ABUSEIPDB_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      {
        headers: {
          Key: apiKey,
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const result = data.data

    return {
      ipAddress: result.ipAddress,
      isPublic: result.isPublic,
      abuseConfidenceScore: result.abuseConfidenceScore,
      countryCode: result.countryCode,
      usageType: result.usageType || 'Unknown',
      isp: result.isp || 'Unknown',
      domain: result.domain || 'Unknown',
      totalReports: result.totalReports,
      lastReportedAt: result.lastReportedAt,
      isWhitelisted: result.isWhitelisted || false,
    }
  } catch (error) {
    console.error('AbuseIPDB API error:', error)
    return null
  }
}

// ==================== IPINFO ====================
export interface IPInfoResult {
  ip: string
  hostname?: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal?: string
  timezone: string
}

export async function getIPInfo(ip: string): Promise<IPInfoResult | null> {
  const token = process.env.IPINFO_TOKEN
  if (!token) return null

  try {
    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`)

    if (!response.ok) return null

    const data = await response.json()

    return {
      ip: data.ip,
      hostname: data.hostname,
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      loc: data.loc || '0,0',
      org: data.org || 'Unknown',
      postal: data.postal,
      timezone: data.timezone || 'Unknown',
    }
  } catch (error) {
    console.error('IPInfo API error:', error)
    return null
  }
}

// ==================== ASSEMBLYAI ====================
export interface AssemblyAIResult {
  transcription: string
  confidence: number
  words: Array<{
    text: string
    start: number
    end: number
    confidence: number
  }>
}

export async function transcribeAudio(audioUrl: string): Promise<AssemblyAIResult | null> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) return null

  try {
    // Submit transcription request
    const submitResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio_url: audioUrl }),
    })

    if (!submitResponse.ok) return null

    const submitData = await submitResponse.json()
    const transcriptId = submitData.id

    // Poll for completion
    let status = 'queued'
    let transcriptData: Record<string, unknown> = {}

    while (status !== 'completed' && status !== 'error') {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: apiKey },
        }
      )

      transcriptData = await pollingResponse.json()
      status = transcriptData.status as string
    }

    if (status === 'error') return null

    return {
      transcription: transcriptData.text as string,
      confidence: transcriptData.confidence as number,
      words: ((transcriptData.words as Array<{ text: string; start: number; end: number; confidence: number }>) || []).map((w) => ({
        text: w.text,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
      })),
    }
  } catch (error) {
    console.error('AssemblyAI API error:', error)
    return null
  }
}

// ==================== HUGGINGFACE ====================
export interface HuggingFaceResult {
  label: string
  score: number
  allLabels: Array<{ label: string; score: number }>
}

export async function classifyTextWithHuggingFace(text: string): Promise<HuggingFaceResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  const modelEndpoint = process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-mnli'
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelEndpoint}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            candidate_labels: ['phishing', 'scam', 'spam', 'legitimate', 'suspicious'],
          },
        }),
      }
    )

    if (!response.ok) return null

    const data = await response.json()

    if (data.labels && data.scores) {
      const allLabels = data.labels.map((label: string, i: number) => ({
        label,
        score: data.scores[i],
      }))

      return {
        label: data.labels[0],
        score: data.scores[0],
        allLabels,
      }
    }

    return null
  } catch (error) {
    console.error('HuggingFace API error:', error)
    return null
  }
}

// ==================== NEWS API ====================
export interface NewsArticle {
  title: string
  description: string
  source: string
  url: string
  publishedAt: string
  urlToImage?: string
}

export async function fetchSecurityNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return []

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=cybersecurity+OR+phishing+OR+scam+OR+fraud&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`
    )

    if (!response.ok) return []

    const data = await response.json()
    const articles = data.articles || []

    return articles.map((article: { title: string; description: string; source: { name: string }; url: string; publishedAt: string; urlToImage?: string }) => ({
      title: article.title,
      description: article.description || '',
      source: article.source?.name || 'Unknown',
      url: article.url,
      publishedAt: article.publishedAt,
      urlToImage: article.urlToImage,
    }))
  } catch (error) {
    console.error('News API error:', error)
    return []
  }
}

// ==================== UTILITY FUNCTIONS ====================
export function extractIPFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    // Check if hostname is an IP address
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (ipv4Regex.test(hostname)) {
      return hostname
    }
    return null
  } catch {
    return null
  }
}

export async function resolveDomainToIP(domain: string): Promise<string | null> {
  try {
    // Use DNS lookup via public API
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`)
    if (!response.ok) return null
    
    const data = await response.json()
    if (data.Answer && data.Answer.length > 0) {
      return data.Answer[0].data
    }
    return null
  } catch {
    return null
  }
}
