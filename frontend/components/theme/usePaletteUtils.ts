// Utility helpers for mixing colors and building derived theme palettes.

export const withAlpha = (hex: string, alpha: string) => {
  if (!hex.startsWith('#')) return hex
  return `${hex}${alpha}`
}

export const clampHex = (value: number) => Math.max(0, Math.min(255, value))

export const hexToRgb = (hex: string) => {
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

export const rgbToHex = (r: number, g: number, b: number) =>
  `#${clampHex(r).toString(16).padStart(2, '0')}${clampHex(g).toString(16).padStart(2, '0')}${clampHex(b)
    .toString(16)
    .padStart(2, '0')}`

export const mix = (hexA: string, hexB: string, ratio: number) => {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  const r = Math.round(a.r * ratio + b.r * (1 - ratio))
  const g = Math.round(a.g * ratio + b.g * (1 - ratio))
  const bl = Math.round(a.b * ratio + b.b * (1 - ratio))
  return rgbToHex(r, g, bl)
}

export type CustomColors = {
  accent: string
  accent2?: string
  accent3?: string
}

export const buildPaletteFromCustom = (colors: CustomColors) => {
  const accent = colors.accent || '#2563eb'
  const accent2 = colors.accent2 || mix(accent, '#ffffff', 0.8)
  const accent3 = colors.accent3 || mix(accent2, '#ffffff', 0.6)
  const bg1 = mix(accent, '#0a0b0f', 0.12)
  const bg2 = mix(accent2, '#131722', 0.2)
  return {
    accent,
    accent2,
    accent3,
    bg1,
    bg2,
    muted: 'rgba(255,255,255,0.78)',
  }
}
