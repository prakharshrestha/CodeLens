import { Bell, Sun, Moon, Search, RefreshCw } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ pageTitle }) {
  const { theme, toggleTheme } = useThemeStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
    window.location.reload()
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-breadcrumb">
          DevOps Command Center / <span>{pageTitle}</span>
        </div>
      </div>
      <div className="navbar-right">
        <button
          onClick={handleRefresh}
          className="btn btn-ghost btn-icon"
          title="Refresh"
        >
          <RefreshCw size={18} style={{ animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none' }} />
        </button>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
