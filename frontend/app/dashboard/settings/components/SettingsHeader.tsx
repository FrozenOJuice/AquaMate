import React from 'react'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}

export default function SettingsHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  )
}
