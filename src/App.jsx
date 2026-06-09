import { useState, useEffect } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { isConfigured } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { useNotifications } from './hooks/useNotifications'
import { ToastProvider } from './components/ui/Toast'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Leads from './pages/Leads'
import Schedule from './pages/Schedule'
import Team from './pages/Team'
import Content from './pages/Content'
import Marketing from './pages/Marketing'
import Notifications from './pages/Notifications'
import Admin from './pages/admin/Admin'
import './App.css'

function FullPageLoader() {
  return (
    <div className="grid-surface full-loader">
      <div className="ember-orb-tl" />
      <div className="ember-orb-br" />
      <div className="wordmark">
        <em>S</em>CORNA
      </div>
      <Loader2 size={22} className="spin" color="var(--ash)" />
    </div>
  )
}

/** Authenticated dashboard shell. */
function Dashboard({ auth }) {
  const { user, role, clientId, clientName, signOut } = auth
  const [page, setPage] = useState('overview')
  const [openLeadId, setOpenLeadId] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  // Unread badge — only meaningful for client-scoped users.
  const { unreadCount } = useNotifications(clientId)

  // Guard: non-admins can never land on the admin page.
  useEffect(() => {
    if (page === 'admin' && role !== 'admin') setPage('overview')
  }, [page, role])

  const navigate = (next) => {
    setOpenLeadId(null)
    setPage(next)
  }

  // Jump straight to a lead's detail panel from anywhere.
  const openLead = (leadId) => {
    setPage('leads')
    setOpenLeadId(leadId)
  }

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return (
          <Overview
            clientId={clientId}
            onOpenLead={openLead}
            onNavigate={navigate}
          />
        )
      case 'leads':
        return (
          <Leads
            clientId={clientId}
            userId={user?.id}
            openLeadId={openLeadId}
            onOpenLead={setOpenLeadId}
          />
        )
      case 'schedule':
        return <Schedule clientId={clientId} />
      case 'team':
        return <Team clientId={clientId} />
      case 'content':
        return <Content clientId={clientId} />
      case 'marketing':
        return <Marketing clientId={clientId} />
      case 'notifications':
        return <Notifications clientId={clientId} onNavigate={navigate} />
      case 'admin':
        return role === 'admin' ? <Admin /> : null
      default:
        return <Overview clientId={clientId} onOpenLead={openLead} onNavigate={navigate} />
    }
  }

  return (
    <div className="grid-surface">
      <div className="ember-orb-tl" />
      <div className="ember-orb-br" />
      <div className="app-shell">
        <Sidebar
          page={page}
          onNavigate={navigate}
          role={role}
          clientName={clientName}
          unreadCount={unreadCount}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div className="app-main">
          <Topbar
            page={page}
            unreadCount={unreadCount}
            onBell={() => navigate('notifications')}
            onSignOut={signOut}
          />
          <main className="page-scroll">{renderPage()}</main>
        </div>
      </div>
    </div>
  )
}

function ConfigScreen() {
  return (
    <div className="grid-surface login-screen">
      <div className="ember-orb-tl" />
      <div className="ember-orb-br" />
      <div className="glass login-card">
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
  )
}

export default function App() {
  const auth = useAuth()

  if (!isConfigured) return <ConfigScreen />

  return (
    <ToastProvider>
      {auth.loading ? (
        <FullPageLoader />
      ) : !auth.session ? (
        <Login />
      ) : (
        <Dashboard auth={auth} />
      )}
    </ToastProvider>
  )
}
