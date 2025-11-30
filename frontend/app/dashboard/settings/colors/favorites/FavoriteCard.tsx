import React from 'react'
import { PaletteCardItem } from '../palettes/PaletteCard'

type Props = {
  item: PaletteCardItem
  onApply: (item: PaletteCardItem) => void
  onRemove: (id: string) => void
}

export default function FavoriteCard({ item, onApply, onRemove }: Props) {
  const swatches = [
    { label: 'Primary', value: item.colors.accent },
    { label: 'Secondary', value: item.colors.accent2 || item.colors.accent },
    { label: 'Tertiary', value: item.colors.accent3 || item.colors.accent2 || item.colors.accent },
  ]
  const cardLabel = item.type === 'premade' ? 'Premade' : 'User made'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onApply(item)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onApply(item)}
      className="group flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-3 transition hover:-translate-y-0.5 hover:border-accent/40"
    >
      <div className="relative w-full rounded-lg border border-[var(--panel-border)] p-1">
        <div
          className="w-full rounded-md"
          style={{
            background: `linear-gradient(135deg, ${item.colors.accent}, ${item.colors.accent2 || item.colors.accent})`,
            minHeight: '110px',
            maxHeight: '130px',
          }}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-base font-semibold">{item.name}</p>
          <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white">{cardLabel}</span>
        </div>
        {swatches.map((sw, idx) => (
          <div key={`${sw.value}-${idx}`} className="flex items-center gap-2 text-xs text-muted">
            <span className="h-4 w-4 rounded border border-white/20" style={{ background: sw.value }} />
            <span className="text-white/80">{sw.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="m-0 text-[11px] uppercase tracking-[0.08em] text-muted">Click to apply</p>
        <button
          className="rounded-lg border border-white/15 px-3 py-1 text-[11px] font-semibold text-muted transition hover:border-red-400/60 hover:text-white"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item.id)
          }}
        >
          Unfavourite
        </button>
      </div>
    </div>
  )
}
