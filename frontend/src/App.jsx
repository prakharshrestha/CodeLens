import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import GithubAnalytics from './pages/github/GithubAnalytics'
import DockerManager from './pages/docker/DockerManager'
import JenkinsDashboard from './pages/jenkins/JenkinsDashboard'
import ApiMonitor from './pages/apimonitor/ApiMonitor'
import Settings from './pages/Settings'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore()
  return !token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="github" element={<GithubAnalytics />} />
        <Route path="docker" element={<DockerManager />} />
        <Route path="jenkins" element={<JenkinsDashboard />} />
        <Route path="monitor" element={<ApiMonitor />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
