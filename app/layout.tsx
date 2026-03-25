import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'RoastMyCode — AI Code Review',
    template: '%s | RoastMyCode',
  },
  description: 'Get brutally honest, senior-engineer-level AI code reviews instantly. Detect bugs, security vulnerabilities, performance issues, and get refactored code.',
  keywords: ['code review', 'AI', 'programming', 'security audit', 'code quality'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://roastmycode.dev'),
  openGraph: {
    title: 'RoastMyCode — AI Code Review',
    description: 'Get brutally honest AI code reviews instantly.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}