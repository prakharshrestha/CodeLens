import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, Container, Wrench, Radio,
  Settings, ChevronLeft, ChevronRight, LogOut, Activity
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'OVERVIEW' },
  { path: '/github', icon: GitBranch, label: 'GitBranch Analytics', section: 'MODULES' },
  { path: '/docker', icon: Container, label: 'Docker Manager', section: 'MODULES' },
  { path: '/jenkins', icon: Wrench, label: 'Jenkins CI/CD', section: 'MODULES' },
  { path: '/monitor', icon: Radio, label: 'API Monitor', section: 'MODULES' },
  { path: '/settings', icon: Settings, label: 'Settings', section: 'ACCOUNT' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const sections = [...new Set(navItems.map(i => i.section))]

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Activity size={20} color="#fff" />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              Code<span>Lens</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-icon"
          style={{ padding: '6px', minWidth: '32px' }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {navItems
              .filter(item => item.section === section)
              .map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          {!collapsed && (
            <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'DEVELOPER'}</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost w-full"
          style={{ marginTop: '8px', justifyContent: collapsed ? 'center' : 'flex-start' }}
          title="Logout"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
