import {
  Users,
  Calendar,
  Star,
  CheckCircle,
  Bell,
  CheckCheck,
} from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useToast } from '../components/ui/Toast'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { relativeTime } from '../lib/utils'

const ICONS = {
  new_lead: Users,
  appointment_confirmed: Calendar,
  new_review: Star,
  content_approved: CheckCircle,
  system: Bell,
}

/**
 * Notifications page. Props: clientId, onNavigate(page).
 * Clicking a notification marks it read and navigates to its linked page.
 */
export default function Notifications({ clientId, onNavigate }) {
  const {
    notifications,
    loading,
    error,
    refetch,
    markRead,
    markAllRead,
    unreadCount,
  } = useNotifications(clientId)
  const toast = useToast()

  const handleClick = async (n) => {
    if (!n.read) {
      try {
        await markRead(n.id)
      } catch {
        toast.error('Failed to mark as read')
      }
    }
    if (n.link_page) onNavigate(n.link_page)
  }

  const handleMarkAll = async () => {
    try {
      await markAllRead()
      toast.success('All notifications marked read')
    } catch {
      toast.error('Failed to mark all read')
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <div className="sub">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </div>
        </div>
        {unreadCount > 0 && (
          <button className="btn" onClick={handleMarkAll}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState lines={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="You're all caught up. New activity will show up here."
        />
      ) : (
        <div className="glass card" style={{ padding: 0 }}>
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell
            return (
              <div
                key={n.id}
                className={`notif-row${n.read ? '' : ' unread'}`}
                onClick={() => handleClick(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick(n)}
              >
                <div className="notif-icon">
                  <Icon size={18} />
                </div>
                <div className="notif-body">
                  <div className="n-title">{n.title}</div>
                  {n.body && <div className="n-text">{n.body}</div>}
                  <div className="n-time">{relativeTime(n.created_at)}</div>
                </div>
                {!n.read && <span className="notif-unread-dot" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
