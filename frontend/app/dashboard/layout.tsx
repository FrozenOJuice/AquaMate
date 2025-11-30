'use client'

import React from 'react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import DashboardSidebar from '@/components/layout/DashboardSidebar/Sidebar'
import { SidebarProvider, useSidebar } from '@/components/layout/DashboardSidebar/SidebarContext'

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar()
  const offset = isExpanded ? 'ml-[240px]' : 'ml-20'

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <DashboardSidebar />
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${offset}`}>
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  )
}
