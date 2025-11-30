'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type SidebarContextValue = {
  isExpanded: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isExpanded: true,
  toggle: () => undefined,
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('aquamate:sidebar') : null
    if (stored === 'collapsed') setIsExpanded(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('aquamate:sidebar', isExpanded ? 'expanded' : 'collapsed')
  }, [isExpanded])

  const toggle = () => setIsExpanded((prev) => !prev)

  return <SidebarContext.Provider value={{ isExpanded, toggle }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  return useContext(SidebarContext)
}
