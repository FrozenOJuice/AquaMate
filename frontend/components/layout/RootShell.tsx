'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import ThemeProvider from '@/components/theme/ThemeProvider'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        {!isDashboard && <AppHeader />}
        <main className={`flex-1 ${!isDashboard ? 'pt-[72px]' : ''}`}>{children}</main>
        {!isDashboard && <AppFooter />}
      </div>
    </ThemeProvider>
  )
}
