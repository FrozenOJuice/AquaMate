'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { paletteOptions, type PaletteKey, type PaletteOption } from './palettes'
import { styleOptions, type StyleKey, type StyleOption } from './styles'
import { buildPaletteFromCustom, CustomColors, withAlpha } from './usePaletteUtils'

type FavoritePalette = {
  id: string
  name: string
  colors: CustomColors
  type: 'premade' | 'user'
  sourceKey?: PaletteKey
  isUserLibrary?: boolean
}

type ThemeContextValue = {
  paletteKey: PaletteKey
  setPalette: (key: PaletteKey) => void
  styleKey: StyleKey
  setStyle: (key: StyleKey) => void
  setCustomPalette: (colors: CustomColors) => void
  palettes: PaletteOption[]
  styles: StyleOption[]
  favorites: FavoritePalette[]
  addFavorite: (name: string, colors: CustomColors, type?: FavoritePalette['type'], sourceKey?: PaletteKey) => void
  removeFavorite: (id: string) => void
  applyFavorite: (fav: FavoritePalette) => void
  addUserColor: (entry: Omit<FavoritePalette, 'id'>) => void
  userLibrary: FavoritePalette[]
  customColors: CustomColors
  activePalette: PaletteOption['values']
}

const ThemeContext = createContext<ThemeContextValue>({
  paletteKey: 'aurora',
  setPalette: () => undefined,
  styleKey: 'solid',
  setStyle: () => undefined,
  palettes: paletteOptions,
  styles: styleOptions,
  setCustomPalette: () => undefined,
  favorites: [],
  addFavorite: () => undefined,
  removeFavorite: () => undefined,
  applyFavorite: () => undefined,
  addUserColor: () => undefined,
  userLibrary: [],
  customColors: { accent: '#8b5cf6', accent2: '#7c3aed', accent3: '#a78bfa' },
  activePalette: paletteOptions[0].values,
})

// Write CSS variables to :root so the theme applies globally
const applyCssVariables = (variables: Record<string, string>) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // paletteKey drives which preset or custom palette is active
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('custom')
  const [styleKey, setStyleKey] = useState<StyleKey>('solid')
  const [customColors, setCustomColors] = useState<CustomColors>({ accent: '#2563eb', accent2: '#1e3a8a', accent3: '#3b82f6' })
  const [favorites, setFavorites] = useState<FavoritePalette[]>([])
  const [userLibrary, setUserLibrary] = useState<FavoritePalette[]>([])

  const palettes = useMemo(() => paletteOptions, [])
  const styles = useMemo(() => styleOptions, [])
  // Resolve the active palette values (preset or custom)
  const palette = useMemo(() => {
    if (paletteKey === 'custom') return { key: 'custom', values: buildPaletteFromCustom(customColors) }
    const match = palettes.find((p) => p.key === paletteKey) ?? palettes[0]
    return match
  }, [paletteKey, palettes, customColors])
  const style = styles.find((s) => s.key === styleKey) ?? styles[0]

  useEffect(() => {
    // Derive surfaces and write them to CSS vars whenever palette/custom colors change
    const headerGlass = `linear-gradient(180deg, ${withAlpha(palette.values.bg1, 'cc')}, ${withAlpha(palette.values.bg1, '99')})`
    const sidebarGlass = `linear-gradient(180deg, ${withAlpha(palette.values.accent, '26')}, ${withAlpha(
      palette.values.bg2,
      'd9',
    )})`

    const headerBg = style.values.headerBg || headerGlass
    const sidebarBg = style.values.sidebarBg || sidebarGlass

    const softSurface = style.values.surfaceWeak || 'rgba(255,255,255,0.05)'
    const softBorder = style.values.surfaceWeakBorder || style.values.glassBorder

    applyCssVariables({
      accent: palette.values.accent,
      'accent-2': palette.values.accent2,
      'accent-3': palette.values.accent3 || palette.values.accent2,
      'bg-1': palette.values.bg1,
      'bg-2': palette.values.bg2,
      muted: palette.values.muted,
      glass: style.values.glass,
      'glass-border': style.values.glassBorder,
      'glass-shadow': style.values.glassShadow,
      'panel-bg': style.values.panel,
      'panel-border': style.values.panelBorder,
      'panel-blur': style.values.blur,
      'panel-shadow': style.values.glassShadow,
      'header-bg': headerBg,
      'header-border': style.values.glassBorder,
      'sidebar-bg': sidebarBg,
      'sidebar-border': style.values.glassBorder,
      'logo-fill-start': palette.values.accent,
      'logo-fill-end': palette.values.accent2,
      'surface-weak': softSurface,
      'surface-weak-border': softBorder,
    })
  }, [palette, style, customColors, userLibrary])

  const setCustomPalette = (colors: CustomColors) => {
    setCustomColors(colors)
    setPaletteKey('custom')
  }

  // Favourite helpers
  const addFavorite = (name: string, colors: CustomColors, type: FavoritePalette['type'] = 'user', sourceKey?: PaletteKey) => {
    const newFav: FavoritePalette = { id: crypto.randomUUID(), name: name || 'Custom palette', colors, type, sourceKey }
    const updated = [...favorites, newFav]
    setFavorites(updated)
  }

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id)
    setFavorites(updated)
  }

  const applyFavorite = (fav: FavoritePalette) => {
    if (fav.type === 'premade' && fav.sourceKey && palettes.find((p) => p.key === fav.sourceKey)) {
      setPaletteKey(fav.sourceKey)
    } else {
      setCustomPalette(fav.colors)
    }
  }

  // User color library (not automatically favourited)
  const addUserColor = (entry: Omit<FavoritePalette, 'id'>) => {
    const newEntry: FavoritePalette = {
      ...entry,
      id: crypto.randomUUID(),
      isUserLibrary: true,
      type: 'user',
      sourceKey: entry.sourceKey || crypto.randomUUID(),
    }
    const updated = [...userLibrary, newEntry]
    setUserLibrary(updated)
  }

  return (
    <ThemeContext.Provider
      value={{
        paletteKey,
        setPalette: setPaletteKey,
        styleKey,
        setStyle: setStyleKey,
        setCustomPalette,
        palettes,
        styles,
        favorites,
        addFavorite,
        removeFavorite,
        applyFavorite,
        addUserColor,
        userLibrary,
        customColors,
        activePalette: palette.values,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
