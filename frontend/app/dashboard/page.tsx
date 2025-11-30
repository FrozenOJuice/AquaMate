import React from 'react'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      <div className="col-span-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-12 text-center text-muted shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
        <h2>Dashboard Widgets</h2>
        <p className="text-sm">Widget grid will go here — user can arrange and customize</p>
      </div>
    </div>
  )
}
