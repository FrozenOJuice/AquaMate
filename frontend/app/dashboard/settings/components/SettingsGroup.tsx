import React from 'react'

type Props = {
  title: string
  eyebrow?: string
  description?: string
  children: React.ReactNode
}

export default function SettingsGroup({ title, eyebrow, description, children }: Props) {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          {eyebrow ? <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-white/70">{eyebrow}</p> : null}
          <p className="m-0 text-sm font-semibold text-white">{title}</p>
          {description ? <p className="m-0 text-xs text-muted">{description}</p> : null}
        </div>
      </div>
      {children}
    </div>
  )
}
