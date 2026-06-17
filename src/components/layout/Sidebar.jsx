import { NavLink } from 'react-router-dom'
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
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/leads', label: 'Leads', icon: Users },
  { to: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { to: '/dashboard/team', label: 'Team', icon: UserCircle },
  { to: '/dashboard/content', label: 'Content', icon: FileEdit },
  { to: '/dashboard/marketing', label: 'Marketing', icon: BarChart2 },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: true },
]

/**
 * Dashboard left navigation rail (router-driven).
 * Props: role, clientName, unreadCount, collapsed, onToggle.
 */
export default function Sidebar({
  role,
  clientName,
  unreadCount = 0,
  collapsed = false,
  onToggle,
}) {
  const isAdmin = role === 'admin'

  return (
    <aside className={`sidebar glass-base${collapsed ? ' collapsed' : ''}`}>
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
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} />
              <span className="nav-label">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <span className="nav-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}

        {isAdmin && (
          <NavLink
            to="/dashboard/admin"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            title={collapsed ? 'Admin' : undefined}
          >
            <Shield size={18} />
            <span className="nav-label">Admin</span>
          </NavLink>
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
