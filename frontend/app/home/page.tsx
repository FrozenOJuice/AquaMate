'use client'

import React, { useEffect } from 'react'
import Hero from './Hero'
import Features from './Features'

export default function HomePage() {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [])

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-5 py-16">
      <section className="grid w-full max-w-5xl grid-cols-1 gap-8 rounded-2xl border border-panel bg-panel p-10 shadow-[var(--panel-shadow)] backdrop-blur-[var(--panel-blur)] lg:grid-cols-[1.1fr_360px]">
        <Hero />
        <Features />
      </section>
    </main>
  )
}
