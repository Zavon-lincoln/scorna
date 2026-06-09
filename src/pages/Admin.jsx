import { useState, useEffect } from 'react'
import BookingsTable from '../components/BookingsTable'
import StatsPanel from '../components/StatsPanel'

function exportCSV(bookings) {
  const headers = ['Name','Business','Vertical','Email','Phone','Spend','Challenge','Preferred Time','Submitted','Status','Notes']
  const rows = bookings.map(b => [
    b.full_name, b.business_name, b.business_type, b.email, b.phone,
    b.marketing_spend, (b.biggest_challenge || '').replace(/\n/g,' '),
    b.preferred_time, b.created_at, b.status, b.notes,
  ].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scorna-bookings-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function fetchBookings(token) {
  const res = await fetch('/api/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(res.status)
  return res.json()
}

export default function Admin() {
  const [authed, setAuthed]   = useState(() => !!sessionStorage.getItem('scorna_admin_token'))
  const [pw, setPw]           = useState('')
  const [shake, setShake]     = useState(false)
  const [pwError, setPwError] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView]       = useState('all')

  useEffect(() => {
    if (!authed) return
    const token = sessionStorage.getItem('scorna_admin_token')
    setLoading(true)
    fetchBookings(token)
      .then(data => { setBookings(data); setLoading(false) })
      .catch(() => {
        sessionStorage.removeItem('scorna_admin_token')
        setAuthed(false)
        setLoading(false)
      })
  }, [authed])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const data = await fetchBookings(pw)
      sessionStorage.setItem('scorna_admin_token', pw)
      setBookings(data)
      setAuthed(true)
    } catch {
      setPwError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const updateBooking = (id, patch) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  const token = sessionStorage.getItem('scorna_admin_token') ?? ''

  const filteredBookings = view === 'all' ? bookings : bookings.filter(b => b.type === view)
  const verticals = [...new Set(bookings.map(b => b.type).filter(Boolean))]

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontFamily: 'Poiret One, cursive', fontSize: 36, color: 'var(--bone)', letterSpacing: '0.12em' }}><span style={{ color: 'var(--ember)' }}>S</span>CORNA</span>
          </div>
          <form
            onSubmit={handleLogin}
            className="admin-login-form"
            style={{
              border: '1px solid var(--ash)',
              padding: '40px 32px',
              animation: shake ? 'shake 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}
          >
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 400, color: 'var(--bone)', marginBottom: 28, textAlign: 'center' }}>
              Admin Access
            </h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'var(--ash)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(false) }}
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'var(--obsidian)',
                  border: `1px solid ${pwError ? 'var(--ember)' : 'var(--ash)'}`,
                  color: 'var(--bone)',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--ember)'}
                onBlur={e => e.target.style.borderColor = pwError ? 'var(--ember)' : 'var(--ash)'}
              />
              {pwError && <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', marginTop: 8 }}>Incorrect password.</p>}
            </div>
            <button type="submit" className="btn-scorna" style={{ width: '100%', textAlign: 'center', padding: 14 }}>
              ENTER
            </button>
          </form>
        </div>
      </div>
    )
  }

  const navItems = [
    { id: 'all', label: 'All Bookings' },
    { id: 'stats', label: 'Stats' },
    ...verticals.map(v => ({ id: v, label: v })),
  ]

  const signOut = () => { sessionStorage.removeItem('scorna_admin_token'); setAuthed(false); setBookings([]) }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span style={{ fontFamily: 'Poiret One, cursive', fontSize: 24, color: 'var(--bone)', letterSpacing: '0.1em' }}><span style={{ color: 'var(--ember)' }}>S</span>CORNA</span>
          {/* Sign-out only visible on mobile (desktop uses sidebar footer) */}
          <button
            className="admin-signout-mobile"
            onClick={signOut}
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
          >
            Sign out
          </button>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`admin-nav-btn${view === item.id ? ' active' : ''}`}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '11px 24px',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
                color: view === item.id ? 'var(--bone)' : 'var(--ash)',
                background: view === item.id ? 'var(--void)' : 'transparent',
                border: 'none', cursor: 'pointer',
                borderLeft: view === item.id ? '2px solid var(--ember)' : '2px solid transparent',
                letterSpacing: '0.04em',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-signout">
          <button
            onClick={signOut}
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'var(--ash)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Booking Dashboard</span>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 600,
              padding: '3px 10px', border: '1px solid var(--ash)', color: 'var(--bone)',
              letterSpacing: '0.06em',
            }}>
              {bookings.length}
            </span>
          </div>
          <button
            className="btn-scorna"
            style={{ fontSize: 11, padding: '8px 20px' }}
            onClick={() => exportCSV(bookings)}
          >
            Export CSV
          </button>
        </div>

        {/* Content */}
        <div className="admin-content">
          {loading ? (
            <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 22, color: 'var(--ash)' }}>
              Loading…
            </div>
          ) : view === 'stats' ? (
            <StatsPanel bookings={bookings} />
          ) : (
            <BookingsTable
              bookings={filteredBookings}
              onUpdate={updateBooking}
              token={token}
            />
          )}
        </div>
      </main>
    </div>
  )
}
