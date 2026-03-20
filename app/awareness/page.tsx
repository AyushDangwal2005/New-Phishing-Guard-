"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Target,
  Mail,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"

interface QuizQuestion {
  id: number
  type: "email" | "sms" | "url"
  content: string
  isPhishing: boolean
  explanation: string
  redFlags?: string[]
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: "email",
    content: `From: security@paypa1-support.com
Subject: Urgent: Your Account Has Been Limited

Dear Valued Customer,

We have noticed some unusual activity on your account. Your account has been temporarily limited until you verify your identity.

Click here to restore your account: http://paypa1-verify.com/restore

If you don't verify within 24 hours, your account will be permanently suspended.

PayPal Security Team`,
    isPhishing: true,
    explanation: "This is a phishing email. Notice the misspelled domain 'paypa1' (with number 1), the generic greeting, urgency tactics, and suspicious link.",
    redFlags: ["Misspelled domain (paypa1)", "Generic greeting", "Urgency/threats", "Suspicious URL", "Pressure tactics"],
  },
  {
    id: 2,
    type: "sms",
    content: `AMAZON: Your order #4829-2847 for $849.99 has been confirmed. If you didn't make this purchase, call immediately: 1-800-555-0123 to cancel and get a refund.`,
    isPhishing: true,
    explanation: "This is a smishing attempt. Scammers create urgency about a fake large purchase to get you to call and provide personal information.",
    redFlags: ["Unsolicited message", "Large amount to create panic", "Phone number not official Amazon", "Urgency tactics"],
  },
  {
    id: 3,
    type: "email",
    content: `From: noreply@linkedin.com
Subject: John Smith has endorsed you for React.js

Hi Sarah,

John Smith has endorsed you for the skill React.js on your LinkedIn profile.

See your endorsements: https://www.linkedin.com/in/sarah-developer

— The LinkedIn Team`,
    isPhishing: false,
    explanation: "This is a legitimate LinkedIn notification. The sender domain is correct, the link goes to the official LinkedIn domain, and there's no request for sensitive information.",
    redFlags: [],
  },
  {
    id: 4,
    type: "sms",
    content: `Your Apple ID was used to sign in to iCloud on a new device. If this wasn't you, visit: appie-id-verify.com/security`,
    isPhishing: true,
    explanation: "This is a phishing SMS. Notice the misspelled domain 'appie-id-verify.com' which is not an official Apple domain.",
    redFlags: ["Misspelled/fake domain", "Creates urgency", "Unofficial URL"],
  },
  {
    id: 5,
    type: "email",
    content: `From: support@microsoft.com
Subject: Password changed successfully

Hi Michael,

Your Microsoft account password was changed on March 15, 2024 at 3:42 PM EST.

If you made this change, you can ignore this email.

If you didn't make this change, please secure your account at https://account.microsoft.com/security

Thanks,
The Microsoft account team`,
    isPhishing: false,
    explanation: "This is a legitimate Microsoft security notification. The domain is correct, the link points to the official Microsoft domain, and it doesn't demand immediate action.",
    redFlags: [],
  },
  {
    id: 6,
    type: "email",
    content: `From: admin@your-bank-secure.com
Subject: ACTION REQUIRED: Verify Your Account NOW

URGENT SECURITY ALERT!

Your online banking access will be SUSPENDED unless you verify your account details IMMEDIATELY!

Enter your username, password, and social security number here: 
http://your-bank-secure.com/verify-now

DO NOT DELAY - ACT NOW TO PREVENT ACCOUNT CLOSURE!

Bank Security Department`,
    isPhishing: true,
    explanation: "This is clearly a phishing email. Multiple red flags: generic bank name, excessive urgency, requests for sensitive info including SSN, suspicious URL, and threatening language.",
    redFlags: ["Excessive urgency", "Asks for password and SSN", "Suspicious domain", "Threatening language", "Generic bank name"],
  },
  {
    id: 7,
    type: "sms",
    content: `Netflix: Your payment method is expiring soon. Update it at netflix.com/payment to avoid service interruption.`,
    isPhishing: false,
    explanation: "This appears to be a legitimate Netflix notification. The link points to the official Netflix domain and doesn't request sensitive information in the message.",
    redFlags: [],
  },
  {
    id: 8,
    type: "email",
    content: `From: winner@international-lottery.net
Subject: CONGRATULATIONS! You've Won $5,000,000!

CONGRATULATIONS!!!

Your email was randomly selected in our International Email Lottery!

You have won $5,000,000 USD!!!

To claim your prize, simply pay the $99 processing fee via wire transfer and send us your full name, address, and bank details.

Reply within 48 hours or your prize will be forfeited!

Lottery Commission`,
    isPhishing: true,
    explanation: "This is a classic lottery scam. You can't win a lottery you didn't enter, legitimate lotteries never ask for fees to claim prizes, and they don't request bank details via email.",
    redFlags: ["Won lottery you didn't enter", "Asks for payment to claim prize", "Requests bank details", "Urgency tactics", "Too good to be true"],
  },
]

const exampleComparisons = [
  {
    title: "Email Sender Addresses",
    real: "support@amazon.com",
    fake: "support@amaz0n-help.com",
    tip: "Always check for misspellings, extra characters, or suspicious domains",
  },
  {
    title: "Website URLs",
    real: "https://www.paypal.com/login",
    fake: "http://paypal-login.com/verify",
    tip: "Legitimate sites use HTTPS and their official domain name",
  },
  {
    title: "Message Tone",
    real: "Please update your payment method at your convenience",
    fake: "UPDATE NOW OR YOUR ACCOUNT WILL BE DELETED!!!",
    tip: "Real companies rarely use threatening language or excessive urgency",
  },
]

export default function AwarenessPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const question = quizQuestions[currentQuestion]

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answer)
    setShowExplanation(true)
    setQuestionsAnswered(prev => prev + 1)

    const isCorrect = answer === question.isPhishing
    if (isCorrect) {
      setScore(prev => prev + 1)
      toast.success("Correct!")
    } else {
      toast.error("Incorrect")
    }
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setQuestionsAnswered(0)
    setQuizCompleted(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return Mail
      case "sms": return MessageSquare
      default: return HelpCircle
    }
  }

  const TypeIcon = getTypeIcon(question.type)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            Interactive Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Security <span className="gradient-text">Awareness</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your ability to identify phishing attempts with our interactive quiz 
            and learn to spot the difference between real and fake messages.
          </p>
        </div>

        {/* Real vs Fake Comparisons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Real vs Fake: Spot the Difference
          </h2>
          <div className="grid gap-4">
            {exampleComparisons.map((comparison, index) => (
              <Card key={index} className="glass">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">{comparison.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                      <div className="flex items-center gap-2 mb-2 text-success font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Legitimate
                      </div>
                      <code className="text-sm break-all">{comparison.real}</code>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <div className="flex items-center gap-2 mb-2 text-destructive font-medium">
                        <XCircle className="h-4 w-4" />
                        Phishing
                      </div>
                      <code className="text-sm break-all">{comparison.fake}</code>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                    {comparison.tip}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quiz Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Phishing Detection Quiz
          </h2>

          {!quizCompleted ? (
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Question {currentQuestion + 1} of {quizQuestions.length}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{question.type} Message</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{score}/{questionsAnswered}</div>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Message Content */}
                <div className="p-4 bg-background/50 rounded-lg border border-border font-mono text-sm whitespace-pre-wrap">
                  {question.content}
                </div>

                {/* Question */}
                <div className="text-center">
                  <p className="text-lg font-medium mb-4">Is this message phishing?</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      variant={selectedAnswer === true ? "default" : "outline"}
                      onClick={() => handleAnswer(true)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "min-w-32 gap-2",
                        selectedAnswer !== null && question.isPhishing && "bg-success text-success-foreground",
                        selectedAnswer === true && !question.isPhishing && "bg-destructive text-destructive-foreground"
                      )}
                    >
                      <XCircle className="h-4 w-4" />
                      Yes, Phishing
                    </Button>
                    <Button
                      size="lg"
                      variant={selectedAnswer === false ? "default" : "outline"}
                      onClick={() => handleAnswer(false)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "min-w-32 gap-2",
                        selectedAnswer !== null && !question.isPhishing && "bg-success text-success-foreground",
                        selectedAnswer === false && question.isPhishing && "bg-destructive text-destructive-foreground"
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      No, Legitimate
                    </Button>
                  </div>
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className={cn(
                    "p-4 rounded-lg",
                    selectedAnswer === question.isPhishing ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
                  )}>
                    <div className="flex items-center gap-2 mb-2 font-medium">
                      {selectedAnswer === question.isPhishing ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-success">Correct!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">Incorrect</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{question.explanation}</p>
                    
                    {question.redFlags && question.redFlags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          Red Flags:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {question.redFlags.map((flag, i) => (
                            <span key={i} className="px-2 py-1 bg-warning/20 text-warning rounded-md text-xs">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Button */}
                {showExplanation && (
                  <div className="flex justify-center">
                    <Button onClick={handleNext} className="gap-2">
                      {currentQuestion < quizQuestions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          See Results
                          <Trophy className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass text-center py-12">
              <CardContent>
                <Trophy className={cn(
                  "h-16 w-16 mx-auto mb-4",
                  score / quizQuestions.length >= 0.8 ? "text-success" :
                  score / quizQuestions.length >= 0.5 ? "text-warning" : "text-destructive"
                )} />
                <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                <p className="text-4xl font-bold mb-4">
                  <span className={cn(
                    score / quizQuestions.length >= 0.8 ? "text-success" :
                    score / quizQuestions.length >= 0.5 ? "text-warning" : "text-destructive"
                  )}>
                    {score}
                  </span>
                  <span className="text-muted-foreground">/{quizQuestions.length}</span>
                </p>
                <p className="text-muted-foreground mb-6">
                  {score / quizQuestions.length >= 0.8 
                    ? "Excellent! You have strong phishing detection skills."
                    : score / quizQuestions.length >= 0.5 
                    ? "Good effort! Keep learning to improve your detection skills."
                    : "Keep practicing! Review the prevention guide to improve."}
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={resetQuiz} variant="outline" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Button asChild className="gap-2">
                    <a href="/prevention">
                      <ShieldCheck className="h-4 w-4" />
                      Learn More
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
