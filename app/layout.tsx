import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'Phishing Guard AI | Intelligent Cybersecurity Protection',
  description: 'AI-powered phishing detection, scam prevention, and digital fraud protection. Analyze suspicious emails, URLs, and attachments with intelligent threat detection.',
  keywords: ['phishing detection', 'cybersecurity', 'scam prevention', 'AI security', 'fraud protection', 'email security'],
  authors: [{ name: 'Phishing Guard AI' }],
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="bottom-right" 
            richColors 
            toastOptions={{
              classNames: {
                toast: 'glass-strong',
              }
            }}
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
