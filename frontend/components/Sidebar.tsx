'use client'

import React, { useState, createContext } from 'react'
import Link from 'next/link'
import styles from './sidebar.module.css'

export const SidebarContext = createContext<{ isExpanded: boolean }>({ isExpanded: true })

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
      </svg>
    ),
    href: '/dashboard',
  },
  {
    label: 'Lifeguards',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    href: '/dashboard/lifeguards',
  },
  {
    label: 'Certifications',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18l-3-3H5V4h14v14h-5z" />
      </svg>
    ),
    href: '/dashboard/certifications',
  },
  {
    label: 'Incidents',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    href: '/dashboard/incidents',
  },
  {
    label: 'Rosters',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M16 18H8v-2h8v2zm0-4H8v-2h8v2z" />
      </svg>
    ),
    href: '/dashboard/rosters',
  },
  {
    label: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
    href: '/dashboard/reports',
  },
  {
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.23-.39-.31-.61-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.42-.49-.42h-3.84c-.25 0-.45.18-.49.42l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.09-.49 0-.61.22L2.74 8.87c-.13.23-.07.5.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.23.39.31.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.42.49.42h3.84c.25 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.09.49 0 .61-.22l1.92-3.32c.12-.23.07-.5-.12-.64l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
    href: '/dashboard/settings',
  },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <SidebarContext.Provider value={{ isExpanded }}>
      <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}>
        <button
          className={styles.toggleBtn}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            className={styles.toggleIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d={isExpanded ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
          </svg>
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navItem}
              title={!isExpanded ? item.label : undefined}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label} aria-hidden={!isExpanded}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </SidebarContext.Provider>
  )
}
