'use client'

import React, { useContext } from 'react'
import Sidebar, { SidebarContext } from '@/components/Sidebar'

export default function Dashboard() {
  const { isExpanded } = useContext(SidebarContext)

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
          isExpanded ? 'ml-[240px]' : 'ml-20'
        }`}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          <div className="col-span-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-12 text-center text-muted shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
            <h2>Dashboard Widgets</h2>
            <p className="text-sm">Widget grid will go here — user can arrange and customize</p>
          </div>
        </div>
      </main>
    </div>
  )
}
