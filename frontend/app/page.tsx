"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
	useEffect(() => {
		const prevHtml = document.documentElement.style.overflow
		const prevBody = document.body.style.overflow
		// Disable scrolling while this landing page is mounted
		document.documentElement.style.overflow = 'hidden'
		document.body.style.overflow = 'hidden'

		return () => {
			// Restore previous values on unmount
			document.documentElement.style.overflow = prevHtml
			document.body.style.overflow = prevBody
		}
	}, [])

	return (
		<main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-5 py-16">
			<section className="grid w-full max-w-5xl grid-cols-1 gap-8 rounded-2xl border border-panel bg-panel p-10 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)] lg:grid-cols-[1.1fr_360px]">
				<div className="space-y-5 text-white">
					<span className="inline-block rounded-full bg-gradient-to-r from-accent to-accent2 px-3 py-1 text-sm font-semibold">Supervisor Portal</span>
					<h2 className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
						AquaMate - Command your aquatic teams with clarity.
					</h2>
					<p className="max-w-3xl text-base text-muted">
						Manage lifeguard rosters, track incidents, coordinate certifications, and handle administrative tasks
						from a single, secure dashboard. Built for aquatic supervisors overseeing multiple sites and teams.
					</p>

					<div className="flex gap-3">
						<Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent2 px-4 py-3 font-bold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:shadow-xl">
							Create Account
						</Link>
						<Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-muted transition hover:border-white/25 hover:text-white">
							Sign In
						</Link>
					</div>
				</div>

				<aside className="flex flex-col gap-3">
					<nav className="flex justify-end gap-2" aria-label="Primary">
						<Link href="/dashboard" className="rounded-lg border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] px-3 py-2 text-sm font-semibold text-accent">
							Dashboard
						</Link>
					</nav>

					<div className="rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-4">
						<h4 style={{ margin: '0 0 8px 0' }}>Quick overview</h4>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
							<div>
								<div className="text-sm text-muted">On duty</div>
								<div className="text-xl font-extrabold">24</div>
							</div>
							<div>
								<div className="text-sm text-muted">Incidents today</div>
								<div className="text-xl font-extrabold">1</div>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-[var(--surface-weak-border)] bg-[var(--surface-weak)] p-4">
						<small className="text-muted">Need a roster or incident report template? Create one in your dashboard.</small>
					</div>
				</aside>
			</section>
		</main>
	)
}
