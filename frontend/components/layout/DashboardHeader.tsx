import React from 'react'
import Link from 'next/link'

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--header-border)] bg-[var(--header-bg)]/80 px-6 py-4 backdrop-blur-md">
      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">Dashboard</p>
        <h1 className="text-xl font-semibold">Control center</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/incidents"
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-muted transition hover:border-white/30 hover:text-white"
        >
          New incident
        </Link>
        <Link
          href="/dashboard/rosters"
          className="rounded-lg border border-accent/30 bg-gradient-to-r from-accent to-accent2 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Invite staff
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.25)]" />
          Online
        </div>
      </div>
    </header>
  )
}
