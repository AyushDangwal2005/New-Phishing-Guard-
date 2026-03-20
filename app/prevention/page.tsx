"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Shield,
  Mail,
  Link2,
  Phone,
  CreditCard,
  Users,
  Gift,
  AlertTriangle,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
  Smartphone,
  Globe,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Lightbulb,
} from "lucide-react"

const scamTypes = [
  {
    icon: Mail,
    title: "Email Phishing",
    description: "Fraudulent emails impersonating legitimate organizations to steal credentials",
    signs: [
      "Generic greetings like 'Dear Customer'",
      "Urgent requests for immediate action",
      "Suspicious sender email addresses",
      "Grammar and spelling errors",
      "Requests for sensitive information",
    ],
    prevention: [
      "Verify sender email addresses carefully",
      "Don't click links - type URLs directly",
      "Enable two-factor authentication",
      "Report suspicious emails to IT/security teams",
    ],
  },
  {
    icon: MessageSquare,
    title: "SMS Phishing (Smishing)",
    description: "Text messages containing malicious links or requests for personal data",
    signs: [
      "Unknown sender numbers",
      "Links with shortened URLs",
      "Messages about prizes you didn't enter",
      "Banking alerts asking for verification",
    ],
    prevention: [
      "Never click links in unexpected texts",
      "Contact organizations directly via official apps",
      "Block and report spam numbers",
      "Don't respond to unknown senders",
    ],
  },
  {
    icon: Phone,
    title: "Voice Phishing (Vishing)",
    description: "Phone calls from scammers pretending to be from trusted organizations",
    signs: [
      "Caller ID spoofing trusted numbers",
      "Pressure to act immediately",
      "Requests for remote access to devices",
      "Threats of account suspension or legal action",
    ],
    prevention: [
      "Hang up and call the organization directly",
      "Never give passwords or PINs over phone",
      "Use official numbers from statements/cards",
      "Report scam calls to authorities",
    ],
  },
  {
    icon: Users,
    title: "Romance Scams",
    description: "Fake romantic interest to manipulate victims into sending money",
    signs: [
      "Quickly professes strong feelings",
      "Always has excuses not to meet or video chat",
      "Eventually asks for money for emergencies",
      "Claims to be overseas (military, oil rig, etc.)",
    ],
    prevention: [
      "Reverse image search profile photos",
      "Never send money to online-only contacts",
      "Be suspicious of fast emotional escalation",
      "Meet in person before any financial help",
    ],
  },
  {
    icon: Gift,
    title: "Lottery & Prize Scams",
    description: "Fake notifications claiming you've won money or prizes",
    signs: [
      "You won a contest you never entered",
      "Required to pay fees to claim prize",
      "Requests for bank account details",
      "Pressure to act quickly or lose prize",
    ],
    prevention: [
      "Remember: you can't win if you didn't enter",
      "Legitimate prizes never require payment",
      "Research the organization independently",
      "Ignore and delete such messages",
    ],
  },
  {
    icon: CreditCard,
    title: "Investment & Crypto Scams",
    description: "Fraudulent investment opportunities promising unrealistic returns",
    signs: [
      "Guaranteed high returns with no risk",
      "Pressure to invest immediately",
      "Unregistered or offshore investments",
      "Difficulty withdrawing your funds",
    ],
    prevention: [
      "Research before investing - verify registrations",
      "If it sounds too good to be true, it is",
      "Only use regulated investment platforms",
      "Never invest based on social media tips",
    ],
  },
]

const bestPractices = [
  {
    icon: Lock,
    title: "Use Strong, Unique Passwords",
    description: "Create complex passwords for each account and use a password manager to keep track of them securely.",
  },
  {
    icon: Smartphone,
    title: "Enable Two-Factor Authentication",
    description: "Add an extra layer of security by requiring a second verification method beyond just your password.",
  },
  {
    icon: Eye,
    title: "Verify Before Trusting",
    description: "Always independently verify requests for information by contacting organizations through official channels.",
  },
  {
    icon: Globe,
    title: "Keep Software Updated",
    description: "Regularly update your operating system, browsers, and apps to protect against known vulnerabilities.",
  },
  {
    icon: ShieldAlert,
    title: "Think Before You Click",
    description: "Hover over links to see actual URLs, and when in doubt, navigate directly to websites instead of clicking links.",
  },
  {
    icon: ShieldCheck,
    title: "Monitor Your Accounts",
    description: "Regularly check your financial accounts and credit reports for unauthorized activity.",
  },
]

export default function PreventionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Security Education
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="gradient-text">Prevention</span> Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to identify and protect yourself from various types of 
            phishing, scams, and digital fraud.
          </p>
        </div>

        {/* How Phishing Works */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              How Phishing Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Bait", desc: "Scammer creates convincing fake message" },
                { step: "2", title: "Hook", desc: "Victim clicks link or provides info" },
                { step: "3", title: "Catch", desc: "Credentials or data are stolen" },
                { step: "4", title: "Exploit", desc: "Stolen data used for fraud" },
              ].map((item) => (
                <div key={item.step} className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Scam Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Common Scam Types
          </h2>
          <Accordion type="multiple" className="space-y-4">
            {scamTypes.map((scam, index) => (
              <AccordionItem 
                key={index} 
                value={`scam-${index}`}
                className="glass rounded-xl px-6 border-0"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <scam.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{scam.title}</h3>
                      <p className="text-sm text-muted-foreground">{scam.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-destructive">
                        <XCircle className="h-4 w-4" />
                        Warning Signs
                      </h4>
                      <ul className="space-y-2">
                        {scam.signs.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        How to Protect Yourself
                      </h4>
                      <ul className="space-y-2">
                        {scam.prevention.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Best Practices */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-success" />
            Security Best Practices
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bestPractices.map((practice, index) => (
              <Card key={index} className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <practice.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{practice.title}</h3>
                      <p className="text-sm text-muted-foreground">{practice.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Reference */}
        <Card className="glass border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Quick Reference: Red Flags Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-destructive">In Emails & Messages</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    "Urgent language demanding immediate action",
                    "Requests for passwords, PINs, or OTPs",
                    "Links to unfamiliar or misspelled websites",
                    "Attachments from unknown senders",
                    "Offers that seem too good to be true",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-success">Safe Practices</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    "Verify sender through official channels",
                    "Type URLs directly instead of clicking links",
                    "Check for HTTPS and valid certificates",
                    "Use official apps for sensitive transactions",
                    "When in doubt, do not proceed",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
