'use client'

import React, { useContext, useEffect, useState } from 'react'
import Sidebar, { SidebarContext } from '@/components/Sidebar'
import { useTheme } from '@/components/ThemeProvider'

const placeholderSettings = [
  { label: 'Email alerts', description: 'Weekly digest and incident notifications.', value: 'Enabled' },
  { label: '2FA', description: 'Two-factor authentication on login.', value: 'Recommended' },
  { label: 'Auto-save', description: 'Persist dashboard layout changes automatically.', value: 'On' },
  { label: 'Data region', description: 'Where files and logs are stored.', value: 'US-East (pending multi-region)' },
]

export default function SettingsPage() {
  const { isExpanded } = useContext(SidebarContext)
  const {
    paletteKey,
    setPalette,
    palettes,
    setCustomPalette,
    customColors,
    favorites,
    addFavorite,
    removeFavorite,
    applyFavorite,
    userLibrary,
    addUserColor,
    activePalette,
  } = useTheme()
  const [accentInput, setAccentInput] = useState(customColors.accent)
  const [accent2Input, setAccent2Input] = useState(customColors.accent2 || customColors.accent)
  const [accent3Input, setAccent3Input] = useState(customColors.accent3 || customColors.accent2 || customColors.accent)
  const [favoriteName, setFavoriteName] = useState('')
  const panelClass =
    'rounded-2xl border border-panel bg-panel p-5 shadow-glass backdrop-blur-[var(--panel-blur)]'

  useEffect(() => {
    setAccentInput(activePalette.accent)
    setAccent2Input(activePalette.accent2)
    setAccent3Input(activePalette.accent3 || activePalette.accent2)
  }, [activePalette])

  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <Sidebar />

      <main
        className={`flex-1 space-y-4 overflow-y-auto p-6 transition-all duration-300 ${
          isExpanded ? 'ml-[240px]' : 'ml-20'
        }`}
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">Dashboard · Settings</p>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted">Tune the look of AquaMate and keep the basics handy.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-muted transition hover:border-white/30 hover:text-white"
              type="button"
            >
              Reset
            </button>
            <button
              className="rounded-xl border border-white/10 bg-gradient-to-br from-accent to-accent2 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              type="button"
            >
              Save changes
            </button>
          </div>
        </header>

        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">Theme</p>
              <h3 className="text-xl font-semibold">Color palette</h3>
              <p className="text-sm text-muted">
                Favourites, premade palettes, and your own colors — pick what feels right.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold">
              Live preview
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="m-0 text-sm font-semibold text-white">Favourites</h4>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
                  Saved
                </span>
              </div>
              {favorites.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-4 text-sm text-muted">
                  No favourites yet. Save a premade or your own colors to reuse them quickly.
                </div>
              ) : (
                <div className="grid grid-flow-col auto-cols-[240px] gap-3 overflow-x-auto pb-2">
                  {favorites.map((fav) => {
                    const swatches = [
                      { label: 'Primary', value: fav.colors.accent },
                      { label: 'Secondary', value: fav.colors.accent2 || fav.colors.accent },
                      { label: 'Tertiary', value: fav.colors.accent3 || fav.colors.accent2 || fav.colors.accent },
                    ]
                    const cardLabel = fav.type === 'premade' ? 'Premade' : 'User made'
                    return (
                      <div
                        key={fav.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => applyFavorite(fav)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && applyFavorite(fav)}
                        className="group flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-3 transition hover:-translate-y-0.5 hover:border-accent/40"
                      >
                        <div className="relative w-full rounded-lg border border-[var(--panel-border)] p-1">
                          <div
                            className="w-full rounded-md"
                            style={{
                              background: `linear-gradient(135deg, ${fav.colors.accent}, ${fav.colors.accent2 || fav.colors.accent})`,
                              minHeight: '110px',
                              maxHeight: '130px',
                            }}
                          />
                          <span className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white">
                            {cardLabel}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="m-0 text-base font-semibold">{fav.name}</p>
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
                              removeFavorite(fav.id)
                            }}
                          >
                            Unfavourite
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="m-0 text-sm font-semibold text-white">All colors</h4>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
                  Mixed
                </span>
              </div>
              <div className="grid grid-flow-col auto-cols-[220px] gap-3 overflow-x-auto pb-2">
                {[...palettes.map((p) => ({
                  id: p.key,
                  name: p.name,
                  description: p.description,
                  colors: { accent: p.values.accent, accent2: p.values.accent2, accent3: p.values.accent3 || p.values.accent2 },
                  type: 'premade' as const,
                  sourceKey: p.key,
                })), ...userLibrary.map((u) => ({
                  id: u.id,
                  name: u.name,
                  description: 'User made palette',
                  colors: u.colors,
                  type: 'user' as const,
                  sourceKey: u.sourceKey || u.id,
                }))].map((item) => {
                  const swatches = [
                    { label: 'Primary', value: item.colors.accent },
                    { label: 'Secondary', value: item.colors.accent2 || item.colors.accent },
                    { label: 'Tertiary', value: item.colors.accent3 || item.colors.accent2 || item.colors.accent },
                  ]
                  const cardLabel = item.type === 'premade' ? 'Premade' : 'User made'
                  const isActive =
                    (item.type === 'premade' && item.sourceKey === paletteKey) ||
                    (item.type === 'user' &&
                      paletteKey === 'custom' &&
                      customColors.accent === item.colors.accent &&
                      customColors.accent2 === item.colors.accent2 &&
                      (customColors.accent3 || customColors.accent2) === (item.colors.accent3 || item.colors.accent2))
                  const fav = favorites.find(
                    (f) =>
                      f.type === item.type &&
                      (item.type === 'premade' ? f.sourceKey === item.sourceKey : true) &&
                      f.colors.accent === item.colors.accent &&
                      f.colors.accent2 === item.colors.accent2 &&
                      (f.colors.accent3 || f.colors.accent2) === (item.colors.accent3 || item.colors.accent2),
                  )
                  const handleApply = () =>
                    item.type === 'premade' && item.sourceKey ? setPalette(item.sourceKey) : setCustomPalette(item.colors)
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        role="button"
                        tabIndex={0}
                        onClick={handleApply}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleApply()}
                        className={`group flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-3 text-left transition hover:-translate-y-0.5 hover:border-accent/40 ${
                          isActive ? 'border-accent shadow-lg shadow-black/40' : ''
                        }`}
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
                        <span className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-[11px] font-semibold text-white">
                          {cardLabel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="m-0 text-base font-semibold">{item.name}</p>
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
                          className={`rounded-lg border px-3 py-1 text-[11px] font-semibold transition ${
                            fav ? 'border-red-400/60 text-red-200 hover:border-red-300' : 'border-white/15 text-muted hover:border-accent/40 hover:text-white'
                          }`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (fav) {
                              removeFavorite(fav.id)
                            } else {
                              addFavorite(item.name, item.colors, item.type, item.type === 'premade' ? item.sourceKey : undefined)
                            }
                          }}
                        >
                          {fav ? 'Unfavourite' : 'Favourite'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2 rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="m-0 text-sm font-semibold text-white">Color maker</p>
                    <p className="m-0 text-xs text-muted">Create a palette and save it to your library.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-2">
                    <div>
                      <p className="m-0 text-sm font-semibold">Primary accent</p>
                      <p className="m-0 text-xs text-muted">Buttons, highlights, gradients.</p>
                    </div>
                    <input
                      type="color"
                      value={accentInput}
                      onChange={(e) => setAccentInput(e.target.value)}
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
                      value={accent2Input}
                      onChange={(e) => setAccent2Input(e.target.value)}
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
                      value={accent3Input}
                      onChange={(e) => setAccent3Input(e.target.value)}
                      className="h-10 w-16 cursor-pointer rounded-md border border-white/20 bg-transparent p-1"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="rounded-xl border border-white/10 bg-gradient-to-br from-accent to-accent2 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-xl"
                    type="button"
                    onClick={() => setCustomPalette({ accent: accentInput, accent2: accent2Input, accent3: accent3Input })}
                  >
                    Apply custom colors
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Palette name"
                      value={favoriteName}
                      onChange={(e) => setFavoriteName(e.target.value)}
                      className="rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                    <button
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/40"
                      type="button"
                      onClick={() => {
                        const name = favoriteName || 'User palette'
                        addUserColor({ name, colors: { accent: accentInput, accent2: accent2Input, accent3: accent3Input }, type: 'user' })
                        setFavoriteName('')
                      }}
                    >
                      Save to colors
                    </button>
                    <button
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/40"
                      type="button"
                      onClick={() => {
                        addFavorite(favoriteName || 'Custom favourite', { accent: accentInput, accent2: accent2Input, accent3: accent3Input }, 'user')
                        setFavoriteName('')
                      }}
                    >
                      Save & favourite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3">
          <section className={panelClass}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">General</p>
                <h3 className="text-xl font-semibold">Account & org</h3>
                <p className="text-sm text-muted">Placeholder settings you can wire later.</p>
              </div>
            </div>
            <ul className="grid gap-2">
              {placeholderSettings.map((setting) => (
                <li
                  key={setting.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-3"
                >
                  <div>
                    <p className="m-0 font-semibold">{setting.label}</p>
                    <p className="m-0 text-sm text-muted">{setting.description}</p>
                  </div>
                  <span className="inline-flex items-center rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-1 text-xs text-muted">
                    {setting.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={panelClass}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/70">Preview</p>
                <h3 className="text-xl font-semibold">Style snapshot</h3>
                <p className="text-sm text-muted">A quick look at how cards will render with your picks.</p>
              </div>
            </div>

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
                <p className="m-0 text-sm text-muted">
                  Notice how the accent and borders change with your selections.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
