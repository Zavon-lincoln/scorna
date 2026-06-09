import { getInitials } from '../../lib/utils'

/**
 * Circular initials avatar.
 * Props: name, initials (override), color (background tint), size (px).
 */
export default function Avatar({ name, initials, color = '#7B0D0D', size = 36 }) {
  const text = initials || getInitials(name)
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `${color}33`, // ~20% alpha tint
        borderColor: `${color}66`,
        color: 'var(--bone)',
      }}
      title={name}
    >
      {text}
    </span>
  )
}
