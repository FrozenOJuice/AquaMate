'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'
import SettingsHeader from './components/SettingsHeader'
import SettingsSection from './components/SettingsSection'
import SettingsGroup from './components/SettingsGroup'
import { PaletteGrid, FavoriteList, ColorMaker, PreviewPanel, type PaletteCardItem } from './colors'

const placeholderSettings = [
  { label: 'Email alerts', description: 'Weekly digest and incident notifications.', value: 'Enabled' },
  { label: '2FA', description: 'Two-factor authentication on login.', value: 'Recommended' },
  { label: 'Auto-save', description: 'Persist dashboard layout changes automatically.', value: 'On' },
  { label: 'Data region', description: 'Where files and logs are stored.', value: 'US-East (pending multi-region)' },
]

export default function SettingsPage() {
  const {
    paletteKey,
    setPalette,
    palettes,
    styleKey,
    setStyle,
    styles,
    setCustomPalette,
    customColors,
    favorites,
    addFavorite,
    removeFavorite,
    userLibrary,
    addUserColor,
    activePalette,
  } = useTheme()
  const [accentInput, setAccentInput] = useState(customColors.accent)
  const [accent2Input, setAccent2Input] = useState(customColors.accent2 || customColors.accent)
  const [accent3Input, setAccent3Input] = useState(customColors.accent3 || customColors.accent2 || customColors.accent)
  const [favoriteName, setFavoriteName] = useState('')

  useEffect(() => {
    setAccentInput(activePalette.accent)
    setAccent2Input(activePalette.accent2)
    setAccent3Input(activePalette.accent3 || activePalette.accent2)
  }, [activePalette])

  const paletteItems: PaletteCardItem[] = useMemo(
    () => [
      ...palettes.map((p) => ({
        id: p.key,
        name: p.name,
        colors: {
          accent: p.values.accent,
          accent2: p.values.accent2,
          accent3: p.values.accent3 || p.values.accent2,
        },
        type: 'premade' as const,
        sourceKey: p.key,
      })),
      ...userLibrary.map((u) => ({
        id: u.id,
        name: u.name,
        colors: u.colors,
        type: 'user' as const,
        sourceKey: u.sourceKey || u.id,
      })),
    ],
    [palettes, userLibrary],
  )

  const favoriteItems: PaletteCardItem[] = useMemo(
    () =>
      favorites.map((fav) => ({
        id: fav.id,
        name: fav.name,
        colors: fav.colors,
        type: fav.type,
        sourceKey: fav.sourceKey,
      })),
    [favorites],
  )

  const isSameColors = (a: PaletteCardItem['colors'], b: PaletteCardItem['colors']) =>
    a.accent === b.accent && a.accent2 === b.accent2 && (a.accent3 || a.accent2) === (b.accent3 || b.accent2)

  const findFavoriteForItem = (item: PaletteCardItem) =>
    favorites.find((fav) => {
      const sameType = fav.type === item.type
      const sameSource = item.type === 'premade' ? fav.sourceKey === item.sourceKey : true
      const samePalette = isSameColors(
        { accent: fav.colors.accent, accent2: fav.colors.accent2, accent3: fav.colors.accent3 },
        item.colors,
      )
      return sameType && sameSource && samePalette
    })

  const handleApply = (item: PaletteCardItem) => {
    if (item.type === 'premade' && item.sourceKey) {
      setPalette(item.sourceKey as typeof paletteKey)
    } else {
      setCustomPalette(item.colors)
    }
  }

  const handleToggleFavorite = (item: PaletteCardItem) => {
    const existing = findFavoriteForItem(item)
    if (existing) {
      removeFavorite(existing.id)
    } else {
      addFavorite(item.name, item.colors, item.type, item.sourceKey)
    }
  }

  const isActive = (item: PaletteCardItem) =>
    (item.type === 'premade' && item.sourceKey === paletteKey) ||
    (item.type === 'user' &&
      paletteKey === 'custom' &&
      isSameColors(item.colors, {
        accent: customColors.accent,
        accent2: customColors.accent2 || customColors.accent,
        accent3: customColors.accent3 || customColors.accent2 || customColors.accent,
      }))

  const isFavorite = (item: PaletteCardItem) => Boolean(findFavoriteForItem(item))

  return (
    <div className="space-y-4">
      <SettingsHeader
        eyebrow="Dashboard · Settings"
        title="Settings"
        description="Tune the look of AquaMate and keep the basics handy."
        actions={
          <>
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
          </>
        }
      />

      <SettingsSection
        eyebrow="Theme"
        title="Color palette"
        description="Favourites, premade palettes, and your own colors — pick what feels right."
        actions={
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold">
            Live preview
          </span>
        }
      >
        <div className="space-y-4">
          <SettingsGroup title="Surface style" description="Choose between solid surfaces or glass effects.">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
              {styles.map((style) => {
                const active = style.key === styleKey
                return (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => setStyle(style.key)}
                    className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-accent/60 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
                        : 'border-white/10 bg-white/5 hover:border-accent/30'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      {style.name}
                      {active ? (
                        <span className="rounded-full bg-accent px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted">{style.description}</span>
                  </button>
                )
              })}
            </div>
          </SettingsGroup>

          <SettingsGroup title="Favourites" eyebrow="Saved">
            <FavoriteList
              items={favoriteItems}
              onApply={handleApply}
              onRemove={(id) => removeFavorite(id)}
            />
          </SettingsGroup>

          <PaletteGrid
            title="All colors"
            badge="Mixed"
            items={paletteItems}
            isActive={isActive}
            isFavorite={isFavorite}
            onApply={handleApply}
            onToggleFavorite={handleToggleFavorite}
          />

          <SettingsGroup title="Color maker" description="Create a palette and save it to your library.">
            <ColorMaker
              accent={accentInput}
              accent2={accent2Input}
              accent3={accent3Input}
              favoriteName={favoriteName}
              onChangeAccent={setAccentInput}
              onChangeAccent2={setAccent2Input}
              onChangeAccent3={setAccent3Input}
              onChangeFavoriteName={setFavoriteName}
              onApply={(colors) => setCustomPalette(colors)}
              onSaveToLibrary={(name, colors) => {
                addUserColor({ name, colors, type: 'user' })
                setFavoriteName('')
              }}
              onSaveFavorite={(name, colors) => {
                addFavorite(name, colors, 'user')
                setFavoriteName('')
              }}
            />
          </SettingsGroup>
        </div>
      </SettingsSection>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-3">
        <SettingsSection
          eyebrow="General"
          title="Account & org"
          description="Placeholder settings you can wire later."
        >
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
        </SettingsSection>

        <SettingsSection
          eyebrow="Preview"
          title="Style snapshot"
          description="A quick look at how cards will render with your picks."
        >
          <PreviewPanel />
        </SettingsSection>
      </div>
    </div>
  )
}
