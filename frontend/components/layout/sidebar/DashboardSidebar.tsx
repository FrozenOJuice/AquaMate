'use client'

import React from 'react'
import Link from 'next/link'
import { navItems } from './navItems'
import { useSidebar } from './useSidebar'

export default function DashboardSidebar() {
  const { isExpanded, toggle } = useSidebar()

  return (
    <aside
      className={`fixed left-0 top-[72px] z-30 flex h-[calc(100vh-72px)] flex-col overflow-y-auto border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] backdrop-blur-lg transition-all duration-300 ${
        isExpanded ? 'w-[240px] px-3' : 'w-20 px-2'
      }`}
    >
      <button
        className="mb-2 flex h-10 w-full items-center justify-center rounded-lg border border-accent/20 bg-[linear-gradient(135deg,rgba(139,92,246,0.05),rgba(124,58,237,0.02))] text-xs font-bold text-accent transition hover:border-accent/50 hover:bg-[linear-gradient(135deg,rgba(139,92,246,0.15),rgba(124,58,237,0.1))] hover:shadow-[0_4px_12px_rgba(139,92,246,0.15)] active:scale-[0.98]"
        onClick={toggle}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg className="h-[18px] w-[18px] transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={isExpanded ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
        </svg>
      </button>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/10 hover:text-accent ${
              isExpanded ? 'justify-start gap-3' : 'justify-center'
            }`}
            title={!isExpanded ? item.label : undefined}
          >
            <span className="flex h-6 w-6 items-center justify-center text-lg text-inherit transition group-hover:scale-110">
              {item.icon}
            </span>
            <span
              className={`overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-200 ${
                isExpanded ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0 -translate-x-1 pointer-events-none'
              }`}
              aria-hidden={!isExpanded}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
