export type StyleKey = 'solid' | 'glass'

export type StyleOption = {
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
    headerBg?: string
    sidebarBg?: string
    surfaceWeak?: string
    surfaceWeakBorder?: string
  }
}

export const styleOptions: StyleOption[] = [
  {
    key: 'solid',
    name: 'Solid',
    description: 'Opaque surfaces, minimal blur — default look.',
    values: {
      glass: 'rgba(255,255,255,0.02)',
      glassBorder: 'rgba(255,255,255,0.08)',
      glassShadow: '0 8px 24px rgba(0,0,0,0.35)',
      panel: 'rgba(22,24,30,1)',
      panelBorder: 'rgba(255,255,255,0.08)',
      blur: '0px',
      headerBg: 'rgba(12,13,16,0.96)',
      sidebarBg: 'rgba(12,13,16,0.94)',
      surfaceWeak: 'rgba(255,255,255,0.04)',
      surfaceWeakBorder: 'rgba(255,255,255,0.08)',
    },
  },
  {
    key: 'glass',
    name: 'Glass',
    description: 'Frosted glass, glows, and soft gradients.',
    values: {
      glass: 'rgba(255,255,255,0.06)',
      glassBorder: 'rgba(255,255,255,0.14)',
      glassShadow: '0 8px 30px rgba(11,7,23,0.45)',
      panel: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      panelBorder: 'rgba(255,255,255,0.12)',
      blur: '12px',
      headerBg: undefined,
      sidebarBg: undefined,
      surfaceWeak: 'rgba(255,255,255,0.05)',
      surfaceWeakBorder: 'rgba(255,255,255,0.1)',
    },
  },
]
