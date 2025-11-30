import React from 'react'
import Link from 'next/link'

const featureCards = [
  {
    title: 'Command center',
    body: 'Live rosters, status badges, and quick actions for every site.',
  },
  {
    title: 'Safety playbooks',
    body: 'Template incident workflows and ensure reports stay consistent.',
  },
  {
    title: 'Staff readiness',
    body: 'Certification tracking keeps expirations surfaced before they block shifts.',
  },
]

export default function Features() {
  return (
    <aside className="flex flex-col gap-3">
      <nav className="flex justify-end gap-2" aria-label="Primary">
        <Link
          href="/dashboard"
          className="rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-2 text-sm font-semibold text-accent transition hover:border-accent/50 hover:text-white"
        >
          Go to dashboard
        </Link>
      </nav>

      <div className="rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-4">
        <h4 className="m-0 mb-2 text-base font-semibold">Quick overview</h4>
        <div className="mt-1 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
          <div>
            <p className="m-0 text-sm text-muted">On duty</p>
            <p className="m-0 text-2xl font-extrabold">24</p>
          </div>
          <div>
            <p className="m-0 text-sm text-muted">Incidents today</p>
            <p className="m-0 text-2xl font-extrabold">1</p>
          </div>
          <div>
            <p className="m-0 text-sm text-muted">Sites</p>
            <p className="m-0 text-2xl font-extrabold">6</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-4">
        {featureCards.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="m-0 text-sm font-semibold">{item.title}</p>
            <p className="m-0 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-4">
        <small className="text-muted">
          Need a roster or incident report template? Start one in your dashboard and save it to your playbook.
        </small>
      </div>
    </aside>
  )
}
