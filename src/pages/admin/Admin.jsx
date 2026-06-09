import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { hasServiceRole } from '../../lib/supabase'
import AdminOverview from './AdminOverview'
import AdminClients from './AdminClients'
import AdminUsers from './AdminUsers'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'clients', label: 'Clients' },
  { key: 'users', label: 'Users' },
]

/** Admin God-mode container with sub-navigation tabs. */
export default function Admin() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1>Admin</h1>
          <div className="sub">God-mode — all clients, all data</div>
        </div>
      </div>

      {!hasServiceRole && (
        <div
          className="glass card"
          style={{
            borderLeft: '3px solid var(--ember)',
            marginBottom: 20,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={18} color="var(--ember)" style={{ marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Service role key not configured
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              Admin reads and user management require
              VITE_SUPABASE_SERVICE_ROLE_KEY. Some data may be limited by RLS
              until it is set.
            </div>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'clients' && <AdminClients />}
      {tab === 'users' && <AdminUsers />}
    </div>
  )
}
