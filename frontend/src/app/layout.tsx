import type { Metadata } from 'next'
import './globals.css'
import { LayoutClient } from '@/components/LayoutClient'
import QueryProvider from '@/components/QueryProvider'
import { AuthContextProvider } from '@/components/AuthContextProvider'
import Script from 'next/script'

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
}

import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeSync } from '@/components/theme/ThemeSync'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync />
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
