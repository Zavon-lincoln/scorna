import { Bell, Settings, LogOut } from 'lucide-react'

const TITLES = {
  overview: 'Overview',
  leads: 'Leads',
  schedule: 'Schedule',
  team: 'Team',
  content: 'Content',
  marketing: 'Marketing',
  notifications: 'Notifications',
  admin: 'Admin',
}

/**
 * Top bar with page title and global actions.
 * Props: page, unreadCount, onBell, onSignOut.
 */
export default function Topbar({ page, unreadCount = 0, onBell, onSignOut }) {
  return (
    <header className="topbar">
      <h2>{TITLES[page] || 'Dashboard'}</h2>
      <div className="topbar-actions">
        <button
          className="icon-btn"
          onClick={onBell}
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
