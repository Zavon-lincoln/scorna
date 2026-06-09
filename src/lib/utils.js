// ── Date & time helpers ──────────────────────────────────────────────

const MS_DAY = 1000 * 60 * 60 * 24

/** Parse a value into a Date, tolerating null/undefined. */
function toDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/** "Jun 3, 2026" */
export function formatDate(value) {
  const d = toDate(value)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "Jun 3" (no year) */
export function formatDateShort(value) {
  const d = toDate(value)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "3:30 PM" */
export function formatTime(value) {
  const d = toDate(value)
  if (!d) return '—'
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** "Jun 3, 3:30 PM" */
export function formatDateTime(value) {
  const d = toDate(value)
  if (!d) return '—'
  return `${formatDateShort(d)}, ${formatTime(d)}`
}

/** Relative time: "Just now", "2h ago", "Yesterday", "Jun 3". */
export function relativeTime(value) {
  const d = toDate(value)
  if (!d) return ''
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.round(diffMs / 60000)
  const diffHr = Math.round(diffMs / 3600000)

  if (diffMs < 0) return formatDateShort(d) // future date
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`

  // Compare calendar days for "Yesterday".
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfToday - startOfThat) / MS_DAY)
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return `${dayDiff}d ago`
  return formatDateShort(d)
}

/** Days since a date as a compact label: "Today", "1d", "12d". */
export function daysSince(value) {
  const d = toDate(value)
  if (!d) return ''
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfToday - startOfThat) / MS_DAY)
  if (dayDiff <= 0) return 'Today'
  return `${dayDiff}d`
}

/** YYYY-MM-DD for the given date (local), for <input type=date>. */
export function toDateInput(value) {
  const d = toDate(value) || new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY-MM-DDTHH:mm for <input type=datetime-local>. */
export function toDateTimeInput(value) {
  const d = toDate(value) || new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

/** Today's date as YYYY-MM-DD (local). */
export function todayStr() {
  return toDateInput(new Date())
}

/** Monday of the week containing `value` (local), as a Date at midnight. */
export function startOfWeek(value) {
  const d = toDate(value) || new Date()
  const day = d.getDay() // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day // shift back to Monday
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff)
  return monday
}

/** Add n days to a date, returning a new Date. */
export function addDays(value, n) {
  const d = toDate(value) || new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** True if two date-ish values fall on the same calendar day. */
export function isSameDay(a, b) {
  const da = toDate(a)
  const db = toDate(b)
  if (!da || !db) return false
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Currency & numbers ───────────────────────────────────────────────

/** "$1,250" — no cents for whole dollars; "—" for empty. */
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (isNaN(num)) return '—'
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  })
}

/** Compact integer with thousands separators. */
export function formatNumber(value) {
  const num = Number(value || 0)
  return num.toLocaleString('en-US')
}

/** Percentage from a 0..1 (or already-percent) ratio. */
export function formatPercent(value, digits = 1) {
  const num = Number(value || 0)
  return `${num.toFixed(digits)}%`
}

// ── People helpers ───────────────────────────────────────────────────

/** "Jane Doe" → "JD". Single word → first two letters. */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** URL-safe slug from a title. */
export function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Random alphanumeric password (default 12 chars). */
export function generatePassword(length = 12) {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  let out = ''
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length]
  return out
}

/** Minutes between two timestamps. */
export function durationMinutes(start, end) {
  const s = toDate(start)
  const e = toDate(end)
  if (!s || !e) return 0
  return Math.max(0, Math.round((e - s) / 60000))
}

/** "1h 30m" / "45m" from minutes. */
export function formatDuration(minutes) {
  const m = Number(minutes || 0)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h}h ${rem}m` : `${h}h`
}

/** Clamp a number between min and max. */
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}
