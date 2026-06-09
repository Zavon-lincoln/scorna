import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Glass modal with overlay.
 * Props: isOpen, onClose, title, children, size ('sm'|'md'|'lg'), footer.
 * Closes on overlay click and Escape; traps focus while open.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) {
  const cardRef = useRef(null)

  // Escape to close + focus trap.
  useEffect(() => {
    if (!isOpen) return

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key === 'Tab') {
        const focusable = cardRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const list = Array.from(focusable).filter((el) => !el.disabled)
        const first = list[0]
        const last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey, true)
    // Focus the first field when opening.
    const t = setTimeout(() => {
      const first = cardRef.current?.querySelector(
        'input, select, textarea, button'
      )
      first?.focus()
    }, 50)

    return () => {
      document.removeEventListener('keydown', onKey, true)
      clearTimeout(t)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className={`modal glass ${size}`}
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
