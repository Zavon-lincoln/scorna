import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { isConfigured } from './lib/supabase'
import { useAuthContext } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import { ProtectedRoute, AdminRoute } from './components/routing/RouteGuards'
import PublicLayout from './zones/public/PublicLayout'
import Home from './zones/public/Home'
import Components from './zones/public/Components'
import Login from './pages/Login'
import DashboardLayout from './zones/dashboard/DashboardLayout'
import {
  OverviewRoute,
  LeadsRoute,
  ScheduleRoute,
  TeamRoute,
  ContentRoute,
  MarketingRoute,
  NotificationsRoute,
} from './zones/dashboard/pageRoutes'
import Admin from './pages/admin/Admin'
import BlueprintLayout from './zones/blueprint/BlueprintLayout'

/** Shown when Supabase env vars are absent so the app never blanks out. */
function ConfigScreen() {
  return (
    <div className="app-bg">
      <div className="login-screen">
        <div className="glass-elevated login-card">
          <div className="wordmark">
            <em>S</em>CORNA
          </div>
          <div className="login-tagline">Execution. Clarity. Growth.</div>
          <div
            className="row gap-sm"
            style={{ color: 'var(--ember)', marginBottom: 10 }}
          >
            <AlertTriangle size={18} />
            <strong>Configuration needed</strong>
          </div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
            Supabase environment variables are missing. Copy{' '}
            <code>.env.example</code> to <code>.env.local</code> and fill in your{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>,
            then restart the dev server. See the README for full setup.
          </p>
        </div>
      </div>
    </div>
  )
}

/** /login — redirects already-authenticated users into the app. */
function LoginRoute() {
  const { session } = useAuthContext()
  const location = useLocation()
  if (session) {
    const dest = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={dest} replace />
  }
  return <Login />
}

export default function App() {
  if (!isConfigured) return <ConfigScreen />

  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public zone */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Auth gate */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Internal component library — admin only, unlinked */}
        <Route
          path="/components"
          element={
            <AdminRoute>
              <Components />
            </AdminRoute>
          }
        />

        {/* Client zone */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewRoute />} />
          <Route path="leads" element={<LeadsRoute />} />
          <Route path="leads/:id" element={<LeadsRoute />} />
          <Route path="schedule" element={<ScheduleRoute />} />
          <Route path="team" element={<TeamRoute />} />
          <Route path="content" element={<ContentRoute />} />
          <Route path="marketing" element={<MarketingRoute />} />
          <Route path="notifications" element={<NotificationsRoute />} />
          <Route
            path="admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Route>

        {/* Internal zone — admin only */}
        <Route
          path="/blueprint/*"
          element={
            <AdminRoute>
              <BlueprintLayout />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
