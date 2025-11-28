'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type PaletteKey = 'aurora' | 'lagoon' | 'coral' | 'citrus' | 'midnight'
type StyleKey = 'glass' | 'minimal' | 'futuristic'

type PaletteOption = {
  key: PaletteKey
  name: string
  description: string
  swatch: [string, string, string]
  values: {
    accent: string
    accent2: string
    bg1: string
    bg2: string
    muted: string
  }
}

type StyleOption = {
  key: StyleKey
  name: string
  description: string
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
  styleKey: StyleKey
  setPalette: (key: PaletteKey) => void
  setStyle: (key: StyleKey) => void
  palettes: PaletteOption[]
  styles: StyleOption[]
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
      bg1: '#050814',
      bg2: '#0a1225',
      muted: 'rgba(214,233,255,0.82)',
    },
  },
]

const styleOptions: StyleOption[] = [
  {
    key: 'glass',
    name: 'Glass morphism',
    description: 'Blurry glass cards with frosted edges.',
    values: {
      glass: 'rgba(255,255,255,0.06)',
      glassBorder: 'rgba(255,255,255,0.14)',
      glassShadow: '0 8px 30px rgba(11,7,23,0.45)',
      panel: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      panelBorder: 'rgba(255,255,255,0.12)',
      blur: '12px',
    },
  },
  {
    key: 'minimal',
    name: 'Minimal',
    description: 'Clean, flat panels with soft borders.',
    values: {
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.1)',
      glassShadow: '0 6px 18px rgba(0,0,0,0.25)',
      panel: 'rgba(10,12,18,0.8)',
      panelBorder: 'rgba(255,255,255,0.06)',
      blur: '4px',
    },
  },
  {
    key: 'futuristic',
    name: 'Futuristic',
    description: 'High contrast edges with neon glows.',
    values: {
      glass: 'rgba(255,255,255,0.08)',
      glassBorder: 'rgba(255,255,255,0.18)',
      glassShadow: '0 14px 40px rgba(0,0,0,0.45), 0 0 24px rgba(124,58,237,0.25)',
      panel: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      panelBorder: 'rgba(255,255,255,0.22)',
      blur: '14px',
    },
  },
]

const ThemeContext = createContext<ThemeContextValue>({
  paletteKey: 'aurora',
  styleKey: 'glass',
  setPalette: () => undefined,
  setStyle: () => undefined,
  palettes: paletteOptions,
  styles: styleOptions,
})

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
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('aurora')
  const [styleKey, setStyleKey] = useState<StyleKey>('glass')

  const palettes = useMemo(() => paletteOptions, [])
  const styles = useMemo(() => styleOptions, [])

  useEffect(() => {
    const storedPalette = window.localStorage.getItem('aquamate:palette') as PaletteKey | null
    const storedStyle = window.localStorage.getItem('aquamate:style') as StyleKey | null

    if (storedPalette && palettes.find((p) => p.key === storedPalette)) {
      setPaletteKey(storedPalette)
    }
    if (storedStyle && styles.find((s) => s.key === storedStyle)) {
      setStyleKey(storedStyle)
    }
  }, [palettes, styles])

  useEffect(() => {
    const palette = palettes.find((p) => p.key === paletteKey) ?? palettes[0]
    applyCssVariables({
      accent: palette.values.accent,
      'accent-2': palette.values.accent2,
      'bg-1': palette.values.bg1,
      'bg-2': palette.values.bg2,
      muted: palette.values.muted,
    })
    window.localStorage.setItem('aquamate:palette', palette.key)
  }, [paletteKey, palettes])

  useEffect(() => {
    const style = styles.find((s) => s.key === styleKey) ?? styles[0]
    applyCssVariables({
      glass: style.values.glass,
      'glass-border': style.values.glassBorder,
      'glass-shadow': style.values.glassShadow,
      'panel-bg': style.values.panel,
      'panel-border': style.values.panelBorder,
      'panel-blur': style.values.blur,
      'panel-shadow': style.values.glassShadow,
    })
    window.localStorage.setItem('aquamate:style', style.key)
  }, [styleKey, styles])

  return (
    <ThemeContext.Provider
      value={{
        paletteKey,
        styleKey,
        setPalette: setPaletteKey,
        setStyle: setStyleKey,
        palettes,
        styles,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
