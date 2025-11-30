'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { paletteOptions, styleOptions, type PaletteKey, type PaletteOption, type StyleOption } from './presets'
import {
  buildPaletteFromCustom,
  CustomColors,
  loadJson,
  saveJson,
  withAlpha,
} from './usePaletteUtils'

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
  setCustomPalette: (colors: CustomColors) => void
  palettes: PaletteOption[]
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
  palettes: paletteOptions,
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
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('aurora')
  const [customColors, setCustomColors] = useState<CustomColors>({ accent: '#8b5cf6', accent2: '#7c3aed', accent3: '#a78bfa' })
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
  const style = styles[0]

  // Restore persisted choices from previous sessions
  useEffect(() => {
    const storedPalette = (loadJson<string>('aquamate:palette') as PaletteKey | null) ?? null
    const storedCustom = loadJson<CustomColors>('aquamate:custom-colors')
    const storedFavorites = loadJson<FavoritePalette[]>('aquamate:favorites')
    const storedUserLib = loadJson<FavoritePalette[]>('aquamate:user-library')

    if (storedPalette === 'custom') {
      setPaletteKey('custom')
    } else if (storedPalette && palettes.find((p) => p.key === storedPalette)) {
      setPaletteKey(storedPalette)
    }
    if (storedCustom?.accent) {
      setCustomColors({
        accent: storedCustom.accent,
        accent2: storedCustom.accent2 || storedCustom.accent,
        accent3: storedCustom.accent3 || storedCustom.accent2 || storedCustom.accent,
      })
    }
    if (Array.isArray(storedFavorites)) {
      const normalized = storedFavorites.map((f) => ({
        id: f.id || crypto.randomUUID(),
        name: f.name || 'Saved palette',
        colors: {
          accent: f.colors.accent,
          accent2: f.colors.accent2,
          accent3: f.colors.accent3 || f.colors.accent2,
        },
        type: f.type === 'premade' ? 'premade' : 'user',
        sourceKey: f.sourceKey,
      }))
      setFavorites(normalized)
    }
    if (Array.isArray(storedUserLib)) {
      const normalized = storedUserLib.map((f) => ({
        id: f.id || crypto.randomUUID(),
        name: f.name || 'User color',
        colors: {
          accent: f.colors.accent,
          accent2: f.colors.accent2,
          accent3: f.colors.accent3 || f.colors.accent2,
        },
        type: 'user',
        sourceKey: f.sourceKey || f.id,
        isUserLibrary: true,
      }))
      setUserLibrary(normalized)
    }
  }, [palettes])

  useEffect(() => {
    // Derive surfaces and write them to CSS vars whenever palette/custom colors change
    const headerGlass = `linear-gradient(180deg, ${withAlpha(palette.values.bg1, 'cc')}, ${withAlpha(palette.values.bg1, '99')})`
    const sidebarGlass = `linear-gradient(180deg, ${withAlpha(palette.values.accent, '26')}, ${withAlpha(
      palette.values.bg2,
      'd9',
    )})`

    const headerBg = headerGlass
    const sidebarBg = sidebarGlass

    const softSurface = 'rgba(255,255,255,0.05)'
    const softBorder = style.values.glassBorder

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
    saveJson('aquamate:palette', palette.key)
    saveJson('aquamate:custom-colors', customColors)
    saveJson('aquamate:user-library', userLibrary)
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
    saveJson('aquamate:favorites', updated)
  }

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id)
    setFavorites(updated)
    saveJson('aquamate:favorites', updated)
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
    saveJson('aquamate:user-library', updated)
  }

  return (
    <ThemeContext.Provider
      value={{
        paletteKey,
        setPalette: setPaletteKey,
        setCustomPalette,
        palettes,
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
