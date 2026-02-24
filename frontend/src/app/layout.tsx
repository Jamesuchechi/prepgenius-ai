import type { Metadata } from 'next'
import { Syne, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { LayoutClient } from '@/components/LayoutClient'
import QueryProvider from '@/components/QueryProvider'
import { AuthContextProvider } from '@/components/AuthContextProvider'
import { Toaster } from 'sonner'
import Script from 'next/script'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PrepGenius AI - Master Your Exams with AI-Tutors',
  description: 'The #1 AI-powered study platform for Nigerian students. Personalized learning for JAMB, WAEC, and NECO with real-time feedback.',
  keywords: ['JAMB 2026', 'WAEC prep', 'NECO past questions', 'AI Tutor Nigeria', 'PrepGenius', 'Exam Success'],
  authors: [{ name: 'PrepGenius AI Team' }],
  openGraph: {
    title: 'PrepGenius AI - Your Personal Exam Success Partner',
    description: 'Master any subject with our AI-powered tutoring system tailored for the Nigerian curriculum.',
    url: 'https://prepgenius.ai',
    siteName: 'PrepGenius AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrepGenius AI - Master Your Exams with AI',
    description: 'Join thousands of students using AI to ace their JAMB and WAEC exams.',
    images: ['/og-image.png'],
  },
}

export const viewport = {
  themeColor: '#0F52BA',
}

import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeSync } from '@/components/theme/ThemeSync'
import InstallPrompt from '@/components/pwa/InstallPrompt'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${syne.variable} ${bricolage.variable}`}>
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync />
          <InstallPrompt />
          <QueryProvider>
            <AuthContextProvider>
              <Toaster position="top-center" expand={false} richColors closeButton />
              <LayoutClient>{children}</LayoutClient>
            </AuthContextProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
