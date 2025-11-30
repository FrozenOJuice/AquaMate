'use client'

// ThemeProvider stitches together the theme context and hook so pages can access palettes/styles.

import React, { createContext, useContext } from 'react'
import { useThemeState } from './useThemeState'
import { type ThemeContextValue } from './themeTypes'
import { paletteOptions } from './palettes'
import { styleOptions } from './styles'

const ThemeContext = createContext<ThemeContextValue>({
  paletteKey: 'custom',
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
  customColors: { accent: '#2563eb', accent2: '#1e3a8a', accent3: '#3b82f6' },
  activePalette: paletteOptions[0].values,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useThemeState()

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
