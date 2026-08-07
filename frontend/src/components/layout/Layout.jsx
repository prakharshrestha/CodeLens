import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useThemeStore } from '../../store/themeStore'

const pageTitles = {
  '/': 'Dashboard',
  '/github': 'GitHub Analytics',
  '/docker': 'Docker Manager',
  '/jenkins': 'Jenkins CI/CD',
  '/monitor': 'API Monitor',
  '/settings': 'Settings',
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { initTheme } = useThemeStore()

  useEffect(() => { initTheme() }, [])

  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar pageTitle={pageTitle} />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
