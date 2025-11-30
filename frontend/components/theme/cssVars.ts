// Helpers that build and apply CSS variables to the document root.

import { withAlpha } from './usePaletteUtils'
import { type PaletteOption } from './palettes'
import { type StyleOption } from './styles'

type PaletteValues = PaletteOption['values']
type StyleValues = StyleOption['values']

export const buildCssVariables = (palette: PaletteValues, style: StyleValues) => {
  const headerGlass = `linear-gradient(180deg, ${withAlpha(palette.bg1, 'cc')}, ${withAlpha(palette.bg1, '99')})`
  const sidebarGlass = `linear-gradient(180deg, ${withAlpha(palette.accent, '26')}, ${withAlpha(palette.bg2, 'd9')})`

  const headerBg = style.headerBg || headerGlass
  const sidebarBg = style.sidebarBg || sidebarGlass
  const softSurface = style.surfaceWeak || 'rgba(255,255,255,0.05)'
  const softBorder = style.surfaceWeakBorder || style.glassBorder

  return {
    'bg-1': palette.bg1,
    'bg-2': palette.bg2,
    'glass': style.glass,
    'glass-border': style.glassBorder,
    'accent': palette.accent,
    'accent-2': palette.accent2,
    'accent-3': palette.accent3 || palette.accent2,
    'muted': palette.muted,
    'glass-shadow': style.glassShadow,
    'panel-bg': style.panel,
    'panel-border': style.panelBorder,
    'panel-blur': style.blur,
    'panel-shadow': style.glassShadow,
    'header-bg': headerBg,
    'header-border': style.glassBorder,
    'sidebar-bg': sidebarBg,
    'sidebar-border': style.glassBorder,
    'logo-fill-start': palette.accent,
    'logo-fill-end': palette.accent2,
    'surface-weak': softSurface,
    'surface-weak-border': softBorder,
  }
}

export const applyCssVariables = (variables: Record<string, string>) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}
