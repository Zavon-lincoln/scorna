const VERTICALS = ['Med Spa','Dental','Law Firm','Gym','Cosmetic Surgery','Financial','Contractor','Other']
const SPENDS    = ['Under $1K','$1K–$3K','$3K–$7K','$7K+']
const STATUSES  = ['New','Contacted','Meeting Booked','Closed','Dead']

function BarChart({ label, data }) {
  const max = Math.max(...Object.values(data), 1)
  const entries = Object.entries(data).filter(([,v]) => v > 0)
  if (entries.length === 0) return <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'var(--ash)', fontStyle: 'italic' }}>No data yet.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.sort((a,b) => b[1]-a[1]).map(([key, val]) => {
        const pct = (val / max) * 100
        const isTop = val === max
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 130, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', flexShrink: 0, textAlign: 'right' }}>{key}</div>
            <div style={{ flex: 1, background: 'var(--obsidian)', height: 18, position: 'relative' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: isTop ? 'var(--ember)' : 'var(--ash)', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ width: 24, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--bone)', textAlign: 'right' }}>{val}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function StatsPanel({ bookings }) {
  const total = bookings.length

  const byVertical = VERTICALS.reduce((acc, v) => ({ ...acc, [v]: 0 }), {})
  const bySpend    = SPENDS.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})
  const byStatus   = STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})

  bookings.forEach(b => {
    if (b.type  && byVertical[b.type]  !== undefined) byVertical[b.type]++
    if (b.spend && bySpend[b.spend]    !== undefined) bySpend[b.spend]++
    if (b.status) byStatus[b.status] = (byStatus[b.status] || 0) + 1
  })

  const sectionStyle = {
    marginBottom: 48,
    padding: '28px',
    border: '1px solid var(--ash)',
    background: 'var(--void)',
  }
  const headingStyle = {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 20,
    fontWeight: 500,
    color: 'var(--bone)',
    marginBottom: 24,
    letterSpacing: '0.03em',
  }

  return (
    <div>
      {/* Total */}
      <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
        <span style={{ fontFamily: 'Poiret One, cursive', fontSize: 72, color: 'var(--bone)', lineHeight: 1 }}>{total}</span>
        <div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'var(--ash)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Total Bookings</div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>By Vertical</h3>
        <BarChart label="Vertical" data={byVertical} />
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>By Marketing Spend</h3>
        <BarChart label="Spend" data={bySpend} />
      </div>

      <div style={sectionStyle}>
        <h3 style={headingStyle}>By Status</h3>
        <BarChart label="Status" data={byStatus} />
      </div>
    </div>
  )
}
