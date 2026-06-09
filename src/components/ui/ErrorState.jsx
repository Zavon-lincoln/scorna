import { AlertTriangle, RotateCw } from 'lucide-react'

/**
 * Error placeholder with a retry action. Logs the error to the console.
 * Props: error, onRetry, title.
 */
export default function ErrorState({
  error,
  onRetry,
  title = 'Something went wrong',
}) {
  if (error) console.error('ErrorState:', error)
  const message =
    (typeof error === 'string' ? error : error?.message) ||
    'We could not load this data. Please try again.'

  return (
    <div className="glass error-state">
      <div className="row gap-sm" style={{ marginBottom: 8 }}>
        <AlertTriangle size={18} color="var(--ember)" />
        <span className="err-title">{title}</span>
      </div>
      <p>{message}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          <RotateCw size={13} /> Retry
        </button>
      )}
    </div>
  )
}
