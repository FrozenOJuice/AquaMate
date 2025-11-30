import React from 'react'

type Props = {
  title?: string
  eyebrow?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export default function SettingsSection({ title, eyebrow, description, actions, children }: Props) {
  return (
    <section className="rounded-2xl border border-panel bg-panel p-5 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)]">
      {(title || eyebrow || description || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            {eyebrow ? <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">{eyebrow}</p> : null}
            {title ? <h3 className="text-xl font-semibold">{title}</h3> : null}
            {description ? <p className="text-sm text-muted">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  )
}
