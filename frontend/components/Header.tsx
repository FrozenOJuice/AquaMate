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
    <header className="site-header">
      <nav className="site-nav container">
        <Link href={destination} className="logo" aria-label="AquaMate dashboard">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2C12 2 6 9 6 13a6 6 0 0012 0c0-4-6-11-6-11z" fill="url(#g)" transform="translate(0 1.5)" />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          <h1 className="site-title">AquaMate</h1>
        </Link>
      </nav>
    </header>
  )
}
