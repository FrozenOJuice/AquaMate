// Shared type definitions for theme state, favorites, and context value.

import { type PaletteKey, type PaletteOption } from './palettes'
import { type StyleKey, type StyleOption } from './styles'
import { type CustomColors } from './usePaletteUtils'

export type FavoritePalette = {
  id: string
  name: string
  colors: CustomColors
  type: 'premade' | 'user'
  sourceKey?: PaletteKey
  isUserLibrary?: boolean
}

export type ThemeContextValue = {
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
