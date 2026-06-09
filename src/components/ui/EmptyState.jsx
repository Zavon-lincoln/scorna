import { Inbox } from 'lucide-react'

/**
 * Centered empty placeholder inside a glass card.
 * Props: icon (Lucide component), title, message, actionLabel, onAction, card.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  card = true,
}) {
  const content = (
    <div className="empty-state">
      <Icon size={36} className="es-icon" />
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
  if (!card) return content
  return <div className="glass">{content}</div>
}
