'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type PaletteKey = 'aurora' | 'lagoon' | 'coral' | 'citrus' | 'midnight' | 'custom'

type PaletteOption = {
  key: PaletteKey
  name: string
  description: string
  swatch: [string, string, string]
  values: {
    accent: string
    accent2: string
    accent3?: string
    bg1: string
    bg2: string
    muted: string
  }
}

type CustomColors = {
  accent: string
  accent2?: string
  accent3?: string
}

type FavoritePalette = {
  id: string
  name: string
  colors: CustomColors
  type: 'premade' | 'user'
  sourceKey?: PaletteKey
  isUserLibrary?: boolean
}

type StyleOption = {
  values: {
    glass: string
    glassBorder: string
    glassShadow: string
    panel: string
    panelBorder: string
    blur: string
  }
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

const paletteOptions: PaletteOption[] = [
  {
    key: 'aurora',
    name: 'Aurora',
    description: 'Purple-blue glow with soft neon edges.',
    swatch: ['#8b5cf6', '#7c3aed', '#0f0520'],
    values: {
      accent: '#8b5cf6',
      accent2: '#7c3aed',
      accent3: '#a78bfa',
      bg1: '#0f0520',
      bg2: '#2b1048',
      muted: 'rgba(255,255,255,0.78)',
    },
  },
  {
    key: 'lagoon',
    name: 'Lagoon',
    description: 'Cool teals inspired by twilight water.',
    swatch: ['#22d3ee', '#0ea5e9', '#04121f'],
    values: {
      accent: '#22d3ee',
      accent2: '#0ea5e9',
      accent3: '#38bdf8',
      bg1: '#04121f',
      bg2: '#09253a',
      muted: 'rgba(226,248,255,0.78)',
    },
  },
  {
    key: 'coral',
    name: 'Coral',
    description: 'Warm corals with sunset gradients.',
    swatch: ['#fb7185', '#f97316', '#1b0c0f'],
    values: {
      accent: '#fb7185',
      accent2: '#f97316',
      accent3: '#fda4af',
      bg1: '#1b0c0f',
      bg2: '#2b0f1a',
      muted: 'rgba(255,231,231,0.8)',
    },
  },
  {
    key: 'citrus',
    name: 'Citrus',
    description: 'Bright lime gradients with crisp contrast.',
    swatch: ['#a3e635', '#34d399', '#0c1507'],
    values: {
      accent: '#a3e635',
      accent2: '#34d399',
      accent3: '#bef264',
      bg1: '#0c1507',
      bg2: '#10220c',
      muted: 'rgba(230,255,214,0.8)',
    },
  },
  {
    key: 'midnight',
    name: 'Midnight',
    description: 'Deep navy with electric cyan highlights.',
    swatch: ['#38bdf8', '#0ea5e9', '#050814'],
    values: {
      accent: '#38bdf8',
      accent2: '#0ea5e9',
      accent3: '#67e8f9',
      bg1: '#050814',
      bg2: '#0a1225',
      muted: 'rgba(214,233,255,0.82)',
    },
  },
]

const styleOptions: StyleOption[] = [
  {
    values: {
      glass: 'rgba(255,255,255,0.06)',
      glassBorder: 'rgba(255,255,255,0.14)',
      glassShadow: '0 8px 30px rgba(11,7,23,0.45)',
      panel: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      panelBorder: 'rgba(255,255,255,0.12)',
      blur: '12px',
    },
  },
]

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

const withAlpha = (hex: string, alpha: string) => {
  if (!hex.startsWith('#')) return hex
  return `${hex}${alpha}`
}

const applyCssVariables = (variables: Record<string, string>) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

const clampHex = (value: number) => Math.max(0, Math.min(255, value))

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '')
  if (![3, 6].includes(clean.length)) return { r: 0, g: 0, b: 0 }
  const normalized = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const intVal = parseInt(normalized, 16)
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  }
}

const rgbToHex = (r: number, g: number, b: number) =>
  `#${clampHex(r).toString(16).padStart(2, '0')}${clampHex(g).toString(16).padStart(2, '0')}${clampHex(b)
    .toString(16)
    .padStart(2, '0')}`

const mix = (hexA: string, hexB: string, ratio: number) => {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  const r = Math.round(a.r * ratio + b.r * (1 - ratio))
  const g = Math.round(a.g * ratio + b.g * (1 - ratio))
  const bl = Math.round(a.b * ratio + b.b * (1 - ratio))
  return rgbToHex(r, g, bl)
}

const buildPaletteFromCustom = (colors: CustomColors): PaletteOption['values'] => {
  const accent = colors.accent || '#8b5cf6'
  const accent2 = colors.accent2 || mix(accent, '#ffffff', 0.8)
  const accent3 = colors.accent3 || mix(accent2, '#ffffff', 0.6)
  const bg1 = mix(accent, '#05050a', 0.12)
  const bg2 = mix(accent2, '#0a1120', 0.25)
  return {
    accent,
    accent2,
    accent3,
    bg1,
    bg2,
    muted: 'rgba(255,255,255,0.78)',
  }
}

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('aurora')
  const [customColors, setCustomColors] = useState<CustomColors>({ accent: '#8b5cf6', accent2: '#7c3aed', accent3: '#a78bfa' })
  const [favorites, setFavorites] = useState<FavoritePalette[]>([])
  const [userLibrary, setUserLibrary] = useState<FavoritePalette[]>([])

  const palettes = useMemo(() => paletteOptions, [])
  const styles = useMemo(() => styleOptions, [])
  const palette = useMemo(() => {
    if (paletteKey === 'custom') return { key: 'custom', values: buildPaletteFromCustom(customColors) }
    const match = palettes.find((p) => p.key === paletteKey) ?? palettes[0]
    return match
  }, [paletteKey, palettes, customColors])
  const style = styles[0]

  useEffect(() => {
    const storedPalette = window.localStorage.getItem('aquamate:palette') as PaletteKey | null
    const storedCustom = window.localStorage.getItem('aquamate:custom-colors')
    const storedFavorites = window.localStorage.getItem('aquamate:favorites')
    const storedUserLib = window.localStorage.getItem('aquamate:user-library')

    if (storedPalette === 'custom') {
      setPaletteKey('custom')
    } else if (storedPalette && palettes.find((p) => p.key === storedPalette)) {
      setPaletteKey(storedPalette)
    }
    if (storedCustom) {
      try {
        const parsed = JSON.parse(storedCustom) as CustomColors
        if (parsed.accent) {
          setCustomColors(parsed)
        }
      } catch {
        /* ignore */
      }
    }
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites) as FavoritePalette[]
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((f) => ({
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
      } catch {
        /* ignore */
      }
    }
    if (storedUserLib) {
      try {
        const parsed = JSON.parse(storedUserLib) as FavoritePalette[]
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((f) => ({
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
      } catch {
        /* ignore */
      }
    }
  }, [palettes])

  useEffect(() => {
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
    window.localStorage.setItem('aquamate:palette', palette.key)
    window.localStorage.setItem('aquamate:custom-colors', JSON.stringify(customColors))
    window.localStorage.setItem('aquamate:user-library', JSON.stringify(userLibrary))
  }, [palette, style, customColors, userLibrary])

  const setCustomPalette = (colors: CustomColors) => {
    setCustomColors(colors)
    setPaletteKey('custom')
  }

  const addFavorite = (name: string, colors: CustomColors, type: FavoritePalette['type'] = 'user', sourceKey?: PaletteKey) => {
    const newFav: FavoritePalette = { id: crypto.randomUUID(), name: name || 'Custom palette', colors, type, sourceKey }
    const updated = [...favorites, newFav]
    setFavorites(updated)
    window.localStorage.setItem('aquamate:favorites', JSON.stringify(updated))
  }

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id)
    setFavorites(updated)
    window.localStorage.setItem('aquamate:favorites', JSON.stringify(updated))
  }

  const applyFavorite = (fav: FavoritePalette) => {
    if (fav.type === 'premade' && fav.sourceKey && palettes.find((p) => p.key === fav.sourceKey)) {
      setPaletteKey(fav.sourceKey)
    } else {
      setCustomPalette(fav.colors)
    }
  }

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
    window.localStorage.setItem('aquamate:user-library', JSON.stringify(updated))
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
