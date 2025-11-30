'use client'

import React from 'react'
import AppHeader from '@/components/layout/AppHeader'
import AppFooter from '@/components/layout/AppFooter'
import DashboardSidebar from '@/components/layout/sidebar/DashboardSidebar'
import { SidebarProvider, useSidebar } from '@/components/layout/sidebar/useSidebar'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar()

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <DashboardSidebar />
      <main
        className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${isExpanded ? 'ml-[240px]' : 'ml-20'}`}
      >
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppHeader />
      <DashboardShell>{children}</DashboardShell>
      <AppFooter />
    </SidebarProvider>
  )
}
