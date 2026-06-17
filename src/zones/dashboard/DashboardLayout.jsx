import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import Sidebar from '../../components/layout/Sidebar'
import Topbar from '../../components/layout/Topbar'

/**
 * Authenticated client/admin dashboard shell. Provides the sidebar + topbar
 * chrome and exposes auth-derived values to nested page routes via the
 * Outlet context ({ clientId, userId, role }).
 */
export default function DashboardLayout() {
  const { user, role, clientId, clientName, signOut } = useAuthContext()
  const [collapsed, setCollapsed] = useState(false)

  // Unread badge — only meaningful for client-scoped users.
  const { unreadCount } = useNotifications(clientId)

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        clientName={clientName}
        unreadCount={unreadCount}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="app-main">
        <Topbar unreadCount={unreadCount} onSignOut={signOut} />
        <main className="page-scroll zone-fade">
          <Outlet context={{ clientId, userId: user?.id, role }} />
        </main>
      </div>
    </div>
  )
}
