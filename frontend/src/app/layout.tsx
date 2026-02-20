import type { Metadata } from 'next'
import { Syne, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { LayoutClient } from '@/components/LayoutClient'
import QueryProvider from '@/components/QueryProvider'
import { AuthContextProvider } from '@/components/AuthContextProvider'
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
  title: 'PrepGenius AI - Master Your Exams with AI-Powered Learning',
  description: 'AI-powered study and exam preparation platform for Nigerian students. Personalized learning for JAMB, WAEC, NECO, and more.',
  keywords: ['JAMB', 'WAEC', 'NECO', 'exam preparation', 'AI tutor', 'Nigeria', 'education'],
  authors: [{ name: 'PrepGenius AI' }],
  openGraph: {
    title: 'PrepGenius AI - Master Your Exams with AI-Powered Learning',
    description: 'Personalized AI-powered exam preparation for Nigerian students',
    type: 'website',
    locale: 'en_NG',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PrepGenius',
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
              <LayoutClient>{children}</LayoutClient>
            </AuthContextProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
