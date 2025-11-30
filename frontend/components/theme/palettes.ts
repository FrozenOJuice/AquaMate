export type PaletteKey = 'aurora' | 'lagoon' | 'coral' | 'citrus' | 'midnight' | 'custom'

export type PaletteOption = {
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

// Built-in palette presets users can pick from the settings UI
export const paletteOptions: PaletteOption[] = [
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
