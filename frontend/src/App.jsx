import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'

function Splash() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">Loading…</div>
}

function Protected({ children }) {
  const { profile, loading } = useAuth()
  if (loading) return <Splash />
  return profile ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  const { profile, loading } = useAuth()
  if (loading) return <Splash />
  return profile ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><AuthPage mode="signup" /></GuestOnly>} />

          {/* Workspace: no navbar, full screen */}
          <Route path="/lessons/:id" element={<Protected><Lesson /></Protected>} />

          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Catalog />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}