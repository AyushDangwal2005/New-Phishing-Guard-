"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  HelpCircle,
  Link2,
  Key,
  MessageSquare,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Phone,
  CreditCard,
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  ExternalLink,
} from "lucide-react"

interface RecoveryGuide {
  id: string
  icon: React.ElementType
  title: string
  description: string
  steps: {
    title: string
    description: string
    action?: string
    link?: string
  }[]
  urgentActions: string[]
}

const recoveryGuides: RecoveryGuide[] = [
  {
    id: "clicked-link",
    icon: Link2,
    title: "I clicked a suspicious link",
    description: "What to do if you accidentally clicked on a phishing link",
    urgentActions: [
      "Disconnect from the internet immediately",
      "Do NOT enter any information on the page",
      "Close the browser tab/window",
    ],
    steps: [
      {
        title: "Close and disconnect",
        description: "Close the browser immediately. If the page asked for downloads, disconnect from the internet to prevent malware from communicating.",
      },
      {
        title: "Scan for malware",
        description: "Run a full antivirus/antimalware scan on your device. Use reputable software like Windows Defender, Malwarebytes, or your security suite.",
        action: "Download Malwarebytes",
        link: "https://www.malwarebytes.com",
      },
      {
        title: "Check for unauthorized activity",
        description: "Review your accounts for any unauthorized activity. Check your email sent folder, bank accounts, and social media accounts.",
      },
      {
        title: "Change passwords if concerned",
        description: "If you entered any information or are worried about keyloggers, change passwords for your important accounts from a different, clean device.",
      },
      {
        title: "Enable 2FA everywhere",
        description: "Add two-factor authentication to all your important accounts as an extra layer of protection.",
      },
      {
        title: "Monitor accounts",
        description: "Keep an eye on your financial accounts and credit reports for the next few months for any suspicious activity.",
      },
    ],
  },
  {
    id: "shared-otp",
    icon: Key,
    title: "I shared my OTP or password",
    description: "Immediate steps if you gave away your credentials",
    urgentActions: [
      "Change your password IMMEDIATELY",
      "Log out of all devices/sessions",
      "Contact the service provider",
    ],
    steps: [
      {
        title: "Change the password NOW",
        description: "Go directly to the official website (not through any links) and change your password immediately. Use a strong, unique password.",
      },
      {
        title: "Sign out all sessions",
        description: "Most services have an option to sign out of all devices. Find this in your security settings and activate it.",
      },
      {
        title: "Enable two-factor authentication",
        description: "Set up 2FA using an authenticator app (not SMS) to prevent future unauthorized access even if password is compromised.",
      },
      {
        title: "Check account activity",
        description: "Review recent account activity, login history, and any changes made to your account settings, recovery emails, or phone numbers.",
      },
      {
        title: "Contact the provider",
        description: "Report the incident to the service provider. They may have additional recovery steps or can flag your account for monitoring.",
      },
      {
        title: "Check other accounts",
        description: "If you reuse passwords, change them on all other accounts. Consider using a password manager to create unique passwords.",
        action: "Try Bitwarden",
        link: "https://bitwarden.com",
      },
      {
        title: "For banking/financial accounts",
        description: "Contact your bank immediately. They can freeze your account, reverse unauthorized transactions, and issue new cards if needed.",
      },
    ],
  },
  {
    id: "scam-message",
    icon: MessageSquare,
    title: "I received a scam message",
    description: "How to handle and report suspicious messages",
    urgentActions: [
      "Do NOT reply to the message",
      "Do NOT click any links",
      "Take screenshots for evidence",
    ],
    steps: [
      {
        title: "Don't engage",
        description: "Do not reply, click links, or call any numbers in the message. Engaging confirms your contact info is active.",
      },
      {
        title: "Document the scam",
        description: "Take screenshots of the message, including sender information. This helps with reporting and warns others.",
      },
      {
        title: "Report the message",
        description: "Report to your email provider (mark as spam/phishing), or forward SMS scams to 7726 (SPAM) in most countries.",
      },
      {
        title: "Block the sender",
        description: "Block the phone number or email address to prevent future contact from this scammer.",
      },
      {
        title: "Report to authorities",
        description: "Report to relevant authorities like the FTC (reportfraud.ftc.gov), IC3 (ic3.gov), or your country's cybercrime unit.",
        action: "Report to FTC",
        link: "https://reportfraud.ftc.gov",
      },
      {
        title: "Warn others",
        description: "Share the scam with friends, family, or on community platforms to help others avoid falling victim.",
      },
    ],
  },
]

const faqs = [
  {
    question: "How do I know if a website is legitimate?",
    answer: "Check for HTTPS (padlock icon), verify the domain name is spelled correctly, look for contact information and privacy policies, and research the company independently. Use our URL Tracker tool to analyze suspicious websites.",
  },
  {
    question: "What should I do if I think my email is compromised?",
    answer: "Change your password immediately from a secure device, enable two-factor authentication, check your email settings for forwarding rules or unauthorized changes, review sent emails, and notify contacts if spam was sent from your account.",
  },
  {
    question: "How can I verify if an email is really from my bank?",
    answer: "Banks never ask for passwords, PINs, or full card numbers via email. Check the sender's email domain carefully. When in doubt, don't click links - instead, call your bank using the number on your card or visit the official website directly.",
  },
  {
    question: "Are URL shorteners always dangerous?",
    answer: "Not always, but they can hide malicious destinations. Legitimate companies sometimes use branded shorteners. You can use URL expander tools to see the full destination before clicking, or simply avoid clicking shortened links from unknown sources.",
  },
  {
    question: "How do scammers get my phone number or email?",
    answer: "Through data breaches, purchased marketing lists, social media, public records, or random generation. Use haveibeenpwned.com to check if your data appeared in known breaches.",
  },
  {
    question: "What's the difference between phishing and spear phishing?",
    answer: "Regular phishing uses generic messages sent to many people. Spear phishing is targeted, using personal information about you to make the attack more convincing. Both are dangerous, but spear phishing is harder to detect.",
  },
  {
    question: "Should I use antivirus software?",
    answer: "Yes, always use reputable antivirus/antimalware software and keep it updated. Windows Defender is a solid free option. Consider additional tools like Malwarebytes for extra protection.",
  },
  {
    question: "How do I report phishing to a company being impersonated?",
    answer: "Most major companies have dedicated email addresses for reporting phishing (e.g., reportphishing@apple.com, phish@paypal.com). Search for '[company name] report phishing' to find their official reporting channels.",
  },
]

export default function SupportPage() {
  const [selectedGuide, setSelectedGuide] = useState<RecoveryGuide | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            Help & Recovery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="gradient-text">Support</span> Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get help recovering from phishing attacks, learn what steps to take, 
            and find answers to common security questions.
          </p>
        </div>

        {!selectedGuide ? (
          <>
            {/* Quick Help Buttons */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-warning" />
                I Need Help With...
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {recoveryGuides.map((guide) => (
                  <Card 
                    key={guide.id}
                    className="glass cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:scale-[1.02]"
                    onClick={() => setSelectedGuide(guide)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <guide.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{guide.title}</h3>
                          <p className="text-sm text-muted-foreground">{guide.description}</p>
                          <Button variant="ghost" size="sm" className="mt-2 gap-1 p-0 h-auto text-primary">
                            Get Help <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <Card className="glass border-destructive/30 mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Phone className="h-5 w-5" />
                  Emergency Financial Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 font-medium">
                      <CreditCard className="h-4 w-4 text-primary" />
                      If Credit Card Compromised
                    </div>
                    <p className="text-muted-foreground">
                      Call the number on the back of your card immediately to report fraud 
                      and request a new card.
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 font-medium">
                      <Lock className="h-4 w-4 text-primary" />
                      Credit Freeze
                    </div>
                    <p className="text-muted-foreground">
                      Freeze your credit at Equifax, Experian, and TransUnion to prevent 
                      new accounts being opened in your name.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Frequently Asked Questions
              </h2>
              <Accordion type="multiple" className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="glass rounded-xl px-6 border-0"
                  >
                    <AccordionTrigger className="hover:no-underline text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Report Links */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Report Phishing to Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { name: "Google", email: "phishing-report@us-cert.gov" },
                    { name: "Microsoft", email: "reportphishing@microsoft.com" },
                    { name: "Apple", email: "reportphishing@apple.com" },
                    { name: "PayPal", email: "spoof@paypal.com" },
                    { name: "Amazon", email: "stop-spoofing@amazon.com" },
                    { name: "FTC", email: "reportfraud.ftc.gov" },
                  ].map((org) => (
                    <div key={org.name} className="p-3 bg-background/50 rounded-lg text-sm">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-muted-foreground text-xs">{org.email}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Recovery Guide Detail */
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedGuide(null)}
              className="mb-6 gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Support
            </Button>

            <Card className="glass mb-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <selectedGuide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{selectedGuide.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedGuide.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Urgent Actions */}
            <Card className="glass border-destructive/30 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Do This First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedGuide.urgentActions.map((action, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Recovery Steps
              </h3>
              {selectedGuide.steps.map((step, index) => (
                <Card key={index} className="glass">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        {step.action && step.link && (
                          <Button variant="outline" size="sm" asChild className="gap-2">
                            <a href={step.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              {step.action}
                            </a>
                          </Button>
                        )}
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass mt-6 border-success/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-success mb-1">Prevention Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      Once you've recovered, visit our Prevention page to learn how to 
                      avoid similar attacks in the future. Enable 2FA on all important accounts.
                    </p>
                    <Button variant="outline" size="sm" asChild className="mt-3 gap-2">
                      <a href="/prevention">
                        <Shield className="h-4 w-4" />
                        View Prevention Guide
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
