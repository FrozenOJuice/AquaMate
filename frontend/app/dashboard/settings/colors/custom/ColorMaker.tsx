import React from 'react'
import { CustomColors } from '@/components/theme/usePaletteUtils'

type Props = {
  accent: string
  accent2: string
  accent3: string
  favoriteName: string
  onChangeAccent: (value: string) => void
  onChangeAccent2: (value: string) => void
  onChangeAccent3: (value: string) => void
  onChangeFavoriteName: (value: string) => void
  onApply: (colors: CustomColors) => void
  onSaveToLibrary: (name: string, colors: CustomColors) => void
  onSaveFavorite: (name: string, colors: CustomColors) => void
}

export default function ColorMaker({
  accent,
  accent2,
  accent3,
  favoriteName,
  onChangeAccent,
  onChangeAccent2,
  onChangeAccent3,
  onChangeFavoriteName,
  onApply,
  onSaveToLibrary,
  onSaveFavorite,
}: Props) {
  const colors = { accent, accent2, accent3 }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-2">
          <div>
            <p className="m-0 text-sm font-semibold">Primary accent</p>
            <p className="m-0 text-xs text-muted">Buttons, highlights, gradients.</p>
          </div>
          <input
            type="color"
            value={accent}
            onChange={(e) => onChangeAccent(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent p-1"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-2">
          <div>
            <p className="m-0 text-sm font-semibold">Secondary accent</p>
            <p className="m-0 text-xs text-muted">Used in gradients and outlines.</p>
          </div>
          <input
            type="color"
            value={accent2}
            onChange={(e) => onChangeAccent2(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent p-1"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-2">
          <div>
            <p className="m-0 text-sm font-semibold">Tertiary accent</p>
            <p className="m-0 text-xs text-muted">Extra accent for gradients.</p>
          </div>
          <input
            type="color"
            value={accent3}
            onChange={(e) => onChangeAccent3(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent p-1"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-xl border border-white/10 bg-gradient-to-br from-accent to-accent2 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          type="button"
          onClick={() => onApply(colors)}
        >
          Apply custom colors
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Palette name"
            value={favoriteName}
            onChange={(e) => onChangeFavoriteName(e.target.value)}
            className="rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/40"
            type="button"
            onClick={() => onSaveToLibrary(favoriteName || 'User palette', colors)}
          >
            Save to colors
          </button>
          <button
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/40"
            type="button"
            onClick={() => onSaveFavorite(favoriteName || 'Custom favourite', colors)}
          >
            Save & favourite
          </button>
        </div>
      </div>
    </div>
  )
}
