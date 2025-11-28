'use client'

import React, { useContext } from 'react'
import Sidebar, { SidebarContext } from '@/components/Sidebar'
import styles from './settings.module.css'
import { useTheme } from '@/components/ThemeProvider'

const placeholderSettings = [
  { label: 'Email alerts', description: 'Weekly digest and incident notifications.', value: 'Enabled' },
  { label: '2FA', description: 'Two-factor authentication on login.', value: 'Recommended' },
  { label: 'Auto-save', description: 'Persist dashboard layout changes automatically.', value: 'On' },
  { label: 'Data region', description: 'Where files and logs are stored.', value: 'US-East (pending multi-region)' },
]

export default function SettingsPage() {
  const { isExpanded } = useContext(SidebarContext)
  const { paletteKey, styleKey, setPalette, setStyle, palettes, styles: styleOptions } = useTheme()

  return (
    <div className={`${styles.settingsContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>Dashboard · Settings</p>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Tune the look of AquaMate and keep the basics handy.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.ghostButton} type="button">
              Reset
            </button>
            <button className={styles.primaryButton} type="button">
              Save changes
            </button>
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>Theme</p>
              <h3 className={styles.panelTitle}>Color palette</h3>
              <p className={styles.panelHint}>
                Pick the accent and background gradient you want across the dashboard.
              </p>
            </div>
            <span className={styles.badge}>Live preview</span>
          </div>

          <div className={styles.paletteGrid}>
            {palettes.map((palette) => (
              <button
                key={palette.key}
                type="button"
                className={`${styles.paletteCard} ${palette.key === paletteKey ? styles.active : ''}`}
                onClick={() => setPalette(palette.key)}
              >
                <div
                  className={styles.palettePreview}
                  style={{
                    background: `linear-gradient(135deg, ${palette.swatch[0]}, ${palette.swatch[1]})`,
                    boxShadow:
                      palette.key === paletteKey ? '0 0 0 2px rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.25)' : 'none',
                  }}
                >
                  <span className={styles.paletteGlow} style={{ background: palette.swatch[1] }} />
                  <span className={styles.paletteGlow} style={{ background: palette.swatch[2] }} />
                </div>
                <div className={styles.paletteMeta}>
                  <div>
                    <p className={styles.cardTitle}>{palette.name}</p>
                    <p className={styles.cardSub}>{palette.description}</p>
                  </div>
                  <div className={styles.swatches}>
                    {palette.swatch.map((color) => (
                      <span key={color} className={styles.swatch} style={{ background: color }} />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.kicker}>Style</p>
              <h3 className={styles.panelTitle}>Surface treatment</h3>
              <p className={styles.panelHint}>Glass morphism, minimal, or futuristic edges — pick your vibe.</p>
            </div>
          </div>

          <div className={styles.styleGrid}>
            {styleOptions.map((style) => (
              <button
                key={style.key}
                type="button"
                className={`${styles.styleCard} ${style.key === styleKey ? styles.active : ''}`}
                onClick={() => setStyle(style.key)}
              >
                <div
                  className={styles.stylePreview}
                  style={{
                    background: style.values.panel,
                    borderColor: style.values.panelBorder,
                    boxShadow: style.values.glassShadow,
                    backdropFilter: `blur(${style.values.blur})`,
                  }}
                >
                  <span className={styles.previewAccent} />
                  <span className={styles.previewLine} />
                </div>
                <div className={styles.paletteMeta}>
                  <div>
                    <p className={styles.cardTitle}>{style.name}</p>
                    <p className={styles.cardSub}>{style.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className={styles.splitGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.kicker}>General</p>
                <h3 className={styles.panelTitle}>Account & org</h3>
                <p className={styles.panelHint}>Placeholder settings you can wire later.</p>
              </div>
            </div>
            <ul className={styles.list}>
              {placeholderSettings.map((setting) => (
                <li key={setting.label} className={styles.listItem}>
                  <div>
                    <p className={styles.cardTitle}>{setting.label}</p>
                    <p className={styles.cardSub}>{setting.description}</p>
                  </div>
                  <span className={styles.badgeMuted}>{setting.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.kicker}>Preview</p>
                <h3 className={styles.panelTitle}>Style snapshot</h3>
                <p className={styles.panelHint}>A quick look at how cards will render with your picks.</p>
              </div>
            </div>
            <div className={styles.previewStack}>
              <div className={styles.previewCard}>
                <div className={styles.previewHeading}>
                  <span className={styles.previewDot} />
                  <p className={styles.cardTitle}>Team status</p>
                  <span className={styles.badge}>Live</span>
                </div>
                <p className={styles.cardSub}>Active lifeguards · Check-ins · Incident queue</p>
                <div className={styles.previewMetrics}>
                  <div>
                    <p className={styles.metricLabel}>On duty</p>
                    <p className={styles.metricValue}>24</p>
                  </div>
                  <div>
                    <p className={styles.metricLabel}>Incidents today</p>
                    <p className={styles.metricValue}>1</p>
                  </div>
                  <div>
                    <p className={styles.metricLabel}>Sites</p>
                    <p className={styles.metricValue}>6</p>
                  </div>
                </div>
              </div>

              <div className={styles.previewCardAlt}>
                <div className={styles.previewHeading}>
                  <p className={styles.cardTitle}>Primary action</p>
                  <button className={styles.primaryButton} type="button">
                    Run workflow
                  </button>
                </div>
                <p className={styles.cardSub}>Notice how the accent and borders change with your selections.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
