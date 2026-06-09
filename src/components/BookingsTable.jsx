import { useState } from 'react'

const STATUS_COLORS = {
  'New':            'var(--ash)',
  'Contacted':      'var(--bone)',
  'Meeting Booked': 'var(--ember)',
  'Closed':         '#2E7D32',
  'Dead':           'var(--dried-blood)',
}

const STATUSES = ['New','Contacted','Meeting Booked','Closed','Dead']

const cellStyle = {
  padding: '12px 14px',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 13,
  color: 'var(--bone)',
  borderBottom: '1px solid var(--ash)',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
}

const headStyle = {
  ...cellStyle,
  color: 'var(--ash)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 500,
  background: 'var(--obsidian)',
  borderBottom: '1px solid var(--ash)',
}

export default function BookingsTable({ bookings, onUpdate, token }) {
  const [hoveredRow, setHoveredRow] = useState(null)

  const patchBooking = (id, patch) => {
    onUpdate(id, patch)
    fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    })
  }

  if (bookings.length === 0) {
    return (
      <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 22, color: 'var(--ash)' }}>
        No bookings yet.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
        <thead>
          <tr>
            {['Name','Business','Vertical','Email','Phone','Spend','Pref. Time','Submitted','Status','Notes'].map(h => (
              <th key={h} style={headStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr
              key={b.id}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{ background: hoveredRow === i ? 'var(--obsidian)' : 'var(--void)', transition: 'background 0.15s ease' }}
            >
              <td style={cellStyle}>{b.name}</td>
              <td style={cellStyle}>{b.business}</td>
              <td style={cellStyle}>{b.type || '—'}</td>
              <td style={cellStyle}><a href={`mailto:${b.email}`} style={{ color: 'var(--ash)' }}>{b.email}</a></td>
              <td style={cellStyle}>{b.phone}</td>
              <td style={cellStyle}>{b.spend || '—'}</td>
              <td style={cellStyle}>{b.call_time || '—'}</td>
              <td style={cellStyle}>{new Date(b.submitted_at).toLocaleDateString()}</td>
              <td style={cellStyle}>
                <select
                  value={b.status}
                  onChange={e => patchBooking(b.id, { status: e.target.value })}
                  style={{
                    background: 'var(--void)',
                    border: '1px solid var(--ash)',
                    color: STATUS_COLORS[b.status] || 'var(--bone)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 12,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td style={{ ...cellStyle, minWidth: 160 }}>
                <input
                  key={b.id}
                  type="text"
                  defaultValue={b.notes || ''}
                  placeholder="Add note…"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--ash)',
                    color: 'var(--bone)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 12,
                    width: '100%',
                    outline: 'none',
                    padding: '2px 0',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--ember)'}
                  onBlur={e => {
                    e.target.style.borderBottomColor = 'var(--ash)'
                    if (e.target.value !== (b.notes || '')) {
                      patchBooking(b.id, { notes: e.target.value })
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
