import './globals.css'
import type { Metadata } from 'next'
import ThemeProvider from '@/components/theme/ThemeProvider'
import AppShell from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'AquaMate',
  description: 'A simple root layout for the AquaMate app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
