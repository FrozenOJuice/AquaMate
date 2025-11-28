'use client'

import React, { useContext } from 'react'
import Sidebar, { SidebarContext } from '@/components/Sidebar'
import styles from './dashboard.module.css'

export default function Dashboard() {
  const { isExpanded } = useContext(SidebarContext)

  return (
    <div className={`${styles.dashboardContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.widgetArea}>
          <div className={styles.placeholder}>
            <h2>Dashboard Widgets</h2>
            <p>Widget grid will go here — user can arrange and customize</p>
          </div>
        </div>
      </main>
    </div>
  )
}
