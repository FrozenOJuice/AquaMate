'use client'

// Hook that owns theme state, favorites, and CSS variable updates.

import { useEffect, useMemo, useState } from 'react'
import { paletteOptions, type PaletteKey, type PaletteOption } from './palettes'
import { styleOptions, type StyleKey, type StyleOption } from './styles'
import { buildPaletteFromCustom, CustomColors } from './usePaletteUtils'
import { buildCssVariables, applyCssVariables } from './cssVars'
import { type FavoritePalette, type ThemeContextValue } from './themeTypes'

const defaultCustom: CustomColors = { accent: '#2563eb', accent2: '#1e3a8a', accent3: '#3b82f6' }

export function useThemeState(): ThemeContextValue {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('custom')
  const [styleKey, setStyleKey] = useState<StyleKey>('solid')
  const [customColors, setCustomColors] = useState<CustomColors>(defaultCustom)
  const [favorites, setFavorites] = useState<FavoritePalette[]>([])
  const [userLibrary, setUserLibrary] = useState<FavoritePalette[]>([])

  const palettes = useMemo(() => paletteOptions, [])
  const styles = useMemo(() => styleOptions, [])

  const palette = useMemo(() => {
    if (paletteKey === 'custom') return { key: 'custom', values: buildPaletteFromCustom(customColors) }
    const match = palettes.find((p) => p.key === paletteKey) ?? palettes[0]
    return match
  }, [paletteKey, palettes, customColors])

  const style = styles.find((s) => s.key === styleKey) ?? styles[0]

  useEffect(() => {
    const cssVars = buildCssVariables(palette.values, style.values)
    applyCssVariables(cssVars)
  }, [palette, style])

  const setCustomPalette = (colors: CustomColors) => {
    setCustomColors(colors)
    setPaletteKey('custom')
  }

  const addFavorite = (name: string, colors: CustomColors, type: FavoritePalette['type'] = 'user', sourceKey?: PaletteKey) => {
    const newFav: FavoritePalette = { id: crypto.randomUUID(), name: name || 'Custom palette', colors, type, sourceKey }
    setFavorites((prev) => [...prev, newFav])
  }

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id))
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
    setUserLibrary((prev) => [...prev, newEntry])
  }

  return {
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
  }
}
