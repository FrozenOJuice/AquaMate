import React from 'react'

export default function PreviewPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-panel bg-panel p-4 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
        <div className="mb-1 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_6px_rgba(139,92,246,0.15)]" />
            <p className="m-0 font-semibold">Team status</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold">
            Live
          </span>
        </div>
        <p className="m-0 text-sm text-muted">Active lifeguards · Check-ins · Incident queue</p>
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
          <div>
            <p className="m-0 text-xs text-muted">On duty</p>
            <p className="m-0 text-2xl font-extrabold">24</p>
          </div>
          <div>
            <p className="m-0 text-xs text-muted">Incidents today</p>
            <p className="m-0 text-2xl font-extrabold">1</p>
          </div>
          <div>
            <p className="m-0 text-xs text-muted">Sites</p>
            <p className="m-0 text-2xl font-extrabold">6</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-panel bg-panel p-4 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 font-semibold">Primary action</p>
          <button
            className="rounded-xl border border-white/10 bg-gradient-to-br from-accent to-accent2 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            type="button"
          >
            Run workflow
          </button>
        </div>
        <p className="m-0 text-sm text-muted">Notice how the accent and borders change with your selections.</p>
      </div>
    </div>
  )
}
