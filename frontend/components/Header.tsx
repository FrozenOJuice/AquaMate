'use client'

import React from 'react'
import Link from 'next/link'

export default function Header() {
  // TODO: Wire up auth state here. Change destination based on login status:
  // const isLoggedIn = useAuth() or similar
  // const destination = isLoggedIn ? '/dashboard' : '/login'
  const isLoggedIn = true // Placeholder: currently always logged in
  const destination = isLoggedIn ? '/dashboard' : '/login'

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[72px] border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-6xl items-center gap-4 px-7">
        <Link href={destination} className="inline-flex h-full items-center gap-3 text-accent" aria-label="AquaMate dashboard">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2C12 2 6 9 6 13a6 6 0 0012 0c0-4-6-11-6-11z" fill="url(#g)" transform="translate(0 1.5)" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="var(--logo-fill-start)" />
                <stop offset="1" stopColor="var(--logo-fill-end)" />
              </linearGradient>
            </defs>
          </svg>

          <h1 className="m-0 text-lg font-bold leading-tight tracking-tight text-accent">AquaMate</h1>
        </Link>
      </nav>
    </header>
  )
}
