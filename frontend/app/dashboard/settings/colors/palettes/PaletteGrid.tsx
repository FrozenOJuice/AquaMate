import React from 'react'
import PaletteCard, { PaletteCardItem } from './PaletteCard'

type Props = {
  title: string
  badge?: string
  items: PaletteCardItem[]
  isActive: (item: PaletteCardItem) => boolean
  isFavorite: (item: PaletteCardItem) => boolean
  onApply: (item: PaletteCardItem) => void
  onToggleFavorite: (item: PaletteCardItem) => void
}

export default function PaletteGrid({ title, badge, items, isActive, isFavorite, onApply, onToggleFavorite }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h4 className="m-0 text-sm font-semibold text-white">{title}</h4>
        {badge ? (
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
            {badge}
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-4 text-sm text-muted">
          No palettes yet. Add a custom palette below to get started.
        </div>
      ) : (
        <div className="grid grid-flow-col auto-cols-[220px] gap-3 overflow-x-auto pb-2">
          {items.map((item) => (
            <PaletteCard
              key={`${item.type}-${item.id}`}
              item={item}
              isActive={isActive(item)}
              isFavorite={isFavorite(item)}
              onApply={onApply}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}
