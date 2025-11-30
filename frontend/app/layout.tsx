import './globals.css'
import type { Metadata } from 'next'
import RootShell from '@/components/layout/RootShell'

export const metadata: Metadata = {
  title: 'AquaMate',
  description: 'A simple root layout for the AquaMate app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  )
}
