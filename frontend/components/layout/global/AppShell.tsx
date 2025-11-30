'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'

type Props = {
  children: React.ReactNode
}

export default function AppShell({ children }: Props) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <div className="flex min-h-screen flex-col">
      {!isDashboard && <AppHeader />}
      <main className={`flex-1 ${!isDashboard ? 'pt-[72px]' : ''}`}>{children}</main>
      {!isDashboard && <AppFooter />}
    </div>
  )
}
