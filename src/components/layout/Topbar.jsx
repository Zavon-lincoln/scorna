import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Settings, LogOut } from 'lucide-react'

const TITLES = [
  { match: /^\/dashboard\/leads/, title: 'Leads' },
  { match: /^\/dashboard\/schedule/, title: 'Schedule' },
  { match: /^\/dashboard\/team/, title: 'Team' },
  { match: /^\/dashboard\/content/, title: 'Content' },
  { match: /^\/dashboard\/marketing/, title: 'Marketing' },
  { match: /^\/dashboard\/notifications/, title: 'Notifications' },
  { match: /^\/dashboard\/admin/, title: 'Admin' },
  { match: /^\/dashboard\/?$/, title: 'Overview' },
]

function titleFor(pathname) {
  return TITLES.find((t) => t.match.test(pathname))?.title || 'Dashboard'
}

/**
 * Dashboard top bar with page title and global actions.
 * Props: unreadCount, onSignOut.
 */
export default function Topbar({ unreadCount = 0, onSignOut }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <header className="topbar glass-base">
      <h2>{titleFor(pathname)}</h2>
      <div className="topbar-actions">
        <button
          className="icon-btn"
          onClick={() => navigate('/dashboard/notifications')}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="dot" />}
        </button>
        <button
          className="icon-btn"
          aria-label="Settings"
          title="Settings (coming soon)"
          disabled
          style={{ opacity: 0.4, cursor: 'default' }}
        >
          <Settings size={18} />
        </button>
        <button
          className="icon-btn"
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
