import { useState } from 'react'
import { User, Lock, Bell, Palette, Globe, Save, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match'); return }
    if (pwForm.newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authService.changePassword(pwForm.currentPassword, pwForm.newPassword)
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px' }}>
        {/* Sidebar Tabs */}
        <div className="card" style={{ padding: '8px', height: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item w-full ${activeTab === tab.id ? 'active' : ''}`}
              style={{ marginBottom: '4px', border: 'none', background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent' }}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'profile' && (
            <div>
              <h2 className="section-title">Profile Information</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', padding: '20px', background: 'var(--color-bg-input)', borderRadius: '12px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.name}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{user?.email}</div>
                  <span className="badge badge-purple" style={{ marginTop: '6px' }}>{user?.role}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={profileForm.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <button className="btn btn-primary" style={{ width: 'fit-content' }}>
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="section-title">Change Password</h2>
              {error && <div className="alert alert-danger" style={{ marginBottom: '16px' }}><AlertCircle size={16} /><span>{error}</span></div>}
              <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={loading}>
                  <Lock size={16} /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 className="section-title">Appearance</h2>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
                <div className="card" style={{ cursor: 'pointer' }} onClick={toggleTheme}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>Theme</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Currently using {theme} mode</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--color-bg-input)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Palette size={20} />
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{theme}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
