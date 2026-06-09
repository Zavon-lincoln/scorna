import {
  LayoutGrid,
  Users,
  Calendar,
  UserCircle,
  FileEdit,
  BarChart2,
  Bell,
  Shield,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'team', label: 'Team', icon: UserCircle },
  { key: 'content', label: 'Content', icon: FileEdit },
  { key: 'marketing', label: 'Marketing', icon: BarChart2 },
  { key: 'notifications', label: 'Notifications', icon: Bell, badge: true },
]

/**
 * Left navigation rail.
 * Props: page, onNavigate, role, clientName, unreadCount, collapsed, onToggle.
 */
export default function Sidebar({
  page,
  onNavigate,
  role,
  clientName,
  unreadCount = 0,
  collapsed = false,
  onToggle,
}) {
  const isAdmin = role === 'admin'

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="wordmark">
          <em>S</em>CORNA
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = page === item.key
          return (
            <button
              key={item.key}
              className={`nav-item${active ? ' active' : ''}`}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} />
              <span className="nav-label">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="nav-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )
        })}

        {isAdmin && (
          <button
            className={`nav-item${page === 'admin' ? ' active' : ''}`}
            onClick={() => onNavigate('admin')}
            title={collapsed ? 'Admin' : undefined}
          >
            <Shield size={18} />
            <span className="nav-label">Admin</span>
          </button>
        )}
      </nav>

      <div className={`sidebar-foot${isAdmin ? ' admin' : ''}`}>
        {isAdmin ? (
          <div className="client-name">
            <span className="wordmark" style={{ fontSize: 16 }}>
              <em>S</em>CORNA
            </span>{' '}
            <span style={{ color: 'var(--ember)' }}>ADMIN</span>
          </div>
        ) : (
          <>
            <div className="role">Client</div>
            <div className="client-name">{clientName || '—'}</div>
          </>
        )}
      </div>
    </aside>
  )
}
