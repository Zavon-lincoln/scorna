import BookingForm from '../components/BookingForm'

export default function Book() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(48px,8vw,80px) 24px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Poiret One, cursive', fontSize: 40, color: 'var(--bone)', letterSpacing: '0.12em' }}><span style={{ color: 'var(--ember)' }}>S</span>CORNA</span>
        </div>

        {/* Ember rule */}
        <div style={{ height: 1, background: 'var(--ember)', marginBottom: 40 }} />

        {/* Heading */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 400, color: 'var(--bone)', marginBottom: 12, lineHeight: 1.2, textAlign: 'center' }}>
          Book Your Free AI Audit
        </h1>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--ash)', textAlign: 'center', marginBottom: 48, lineHeight: 1.7 }}>
          45 minutes. We'll show you exactly where your leads are dying and what it would take to fix it.
        </p>

        <BookingForm />
      </div>
    </div>
  )
}
