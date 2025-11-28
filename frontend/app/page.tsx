"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import styles from './homepage.module.css'

export default function Home() {
	useEffect(() => {
		const prevHtml = document.documentElement.style.overflow
		const prevBody = document.body.style.overflow
		// disable scrolling while this page is mounted
		document.documentElement.style.overflow = 'hidden'
		document.body.style.overflow = 'hidden'

		return () => {
			// restore previous values
			document.documentElement.style.overflow = prevHtml
			document.body.style.overflow = prevBody
		}
	}, [])

	return (
		<main className={styles.hero}>
			<div className={styles.container} />
			<section className={styles.glassCard + ' container'}>
				<div className={styles.heroLeft}>
					<span className={styles.badge}>Supervisor Portal</span>
					<h2 className={styles.title}>AquaMate - Command your aquatic teams with clarity.</h2>
					<p className={styles.subtitle}>
						Manage lifeguard rosters, track incidents, coordinate certifications, and handle administrative tasks
						from a single, secure dashboard. Built for aquatic supervisors overseeing multiple sites and teams.
					</p>

					<div className={styles.ctaRow}>
						<Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
							Create Account
						</Link>
						<Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>
							Sign In
						</Link>
					</div>
				</div>

				<aside className={styles.heroRight}>
					<nav className={styles.navLinks} aria-label="Primary">
						<Link href="/dashboard" className={`${styles.navLink} ${styles.navLinkPrimary}`}>Dashboard</Link>
					</nav>

					<div className={styles.cardAction}>
						<h4 style={{ margin: '0 0 8px 0' }}>Quick overview</h4>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
							<div>
								<div style={{ fontSize: 14, color: 'var(--muted)' }}>On duty</div>
								<div style={{ fontWeight: 800, fontSize: 20 }}>24</div>
							</div>
							<div>
								<div style={{ fontSize: 14, color: 'var(--muted)' }}>Incidents today</div>
								<div style={{ fontWeight: 800, fontSize: 20 }}>1</div>
							</div>
						</div>
					</div>

					<div className={styles.cardAction} style={{ marginTop: 8 }}>
						<small style={{ color: 'var(--muted)' }}>Need a roster or incident report template? Create one in your dashboard.</small>
					</div>
				</aside>
			</section>
		</main>
	)
}

