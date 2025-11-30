import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="space-y-5 text-white">
      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent2 px-3 py-1 text-sm font-semibold">
        Supervisor Portal
        <span className="rounded-full bg-white/15 px-2 py-[2px] text-[11px] font-bold uppercase tracking-[0.08em]">Live</span>
      </span>
      <h2 className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
        AquaMate — command your aquatic teams with clarity.
      </h2>
      <p className="max-w-3xl text-base text-muted">
        Manage lifeguard rosters, track incidents, coordinate certifications, and handle administrative tasks from a single, secure dashboard.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent2 px-4 py-3 font-bold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Create Account
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-muted transition hover:border-white/25 hover:text-white"
        >
          Sign In
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-4 py-3 text-sm font-semibold text-accent transition hover:border-accent/50 hover:text-white"
        >
          View dashboard
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {[
          { label: 'Multi-site coverage', value: '6 pools', hint: 'Roster templates & rotations' },
          { label: 'Incidents resolved', value: '1 today', hint: 'Live logging & follow-up' },
          { label: 'Certifications', value: '92%', hint: 'Expirations tracked automatically' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-4 shadow-[var(--panel-shadow)]"
          >
            <p className="m-0 text-xs uppercase tracking-[0.08em] text-muted">{item.label}</p>
            <p className="m-0 text-2xl font-extrabold">{item.value}</p>
            <p className="m-0 text-xs text-muted">{item.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
