import React from 'react'
import FavoriteCard from './FavoriteCard'
import { PaletteCardItem } from '../palettes/PaletteCard'

type Props = {
  items: PaletteCardItem[]
  onApply: (item: PaletteCardItem) => void
  onRemove: (id: string) => void
}

export default function FavoriteList({ items, onApply, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-4 text-sm text-muted">
        No favourites yet. Save a premade or your own colors to reuse them quickly.
      </div>
    )
  }

  return (
    <div className="grid grid-flow-col auto-cols-[220px] gap-3 overflow-x-auto pb-2">
      {items.map((fav) => (
        <FavoriteCard key={fav.id} item={fav} onApply={onApply} onRemove={onRemove} />
      ))}
    </div>
  )
}
