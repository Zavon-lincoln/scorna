import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ParticleCanvas from '../components/ParticleCanvas'

/* ── Scroll reveal hook ── */
function useReveal(threshold = 0.18) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ── Counter animation ── */
function useCounter(target, visible, duration = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!visible) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(pct * target))
      if (pct < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target, duration])
  return val
}

/* ── Glitch wordmark ── */
function GlitchWordmark({ children, plain, style }) {
  const ref = useRef(null)
  useEffect(() => {
    let timeout
    const schedule = () => {
      const delay = (Math.random() * 4000) + 4000
      timeout = setTimeout(() => {
        const el = ref.current
        if (!el) return
        el.classList.add('glitching')
        setTimeout(() => { el && el.classList.remove('glitching') }, 180)
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [])
  return (
    <>
      <style>{`
        .glitch-wrap { position: relative; display: inline-block; }
        .glitch-wrap::before, .glitch-wrap::after {
          content: attr(data-text);
          position: absolute; inset: 0;
          font-family: 'Poiret One', cursive;
          color: var(--bone);
          opacity: 0;
          pointer-events: none;
        }
        .glitch-wrap.glitching::before {
          animation: glitch 0.18s steps(2) forwards;
          opacity: 0.7;
          color: var(--ember);
          left: 2px;
        }
        .glitch-wrap.glitching::after {
          animation: glitch 0.18s steps(2) 0.04s forwards;
          opacity: 0.5;
          color: var(--ash);
          left: -2px;
        }
      `}</style>
      <span ref={ref} className="glitch-wrap" data-text={plain ?? children} style={style}>
        {children}
      </span>
    </>
  )
}

/* ── Line draw ember rule ── */
function EmberLineRule({ visible }) {
  return (
    <div style={{
      height: 1,
      background: 'var(--ember)',
      transform: visible ? 'scaleX(1)' : 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.9s cubic-bezier(0.4,0,0.2,1)',
    }} />
  )
}

/* ── Stats strip ── */
function StatItem({ value, suffix, label, visible }) {
  const num = useCounter(value, visible, 1600)
  return (
    <div className="stat-item" style={{ textAlign: 'center', flex: 1, padding: '40px 24px' }}>
      <div style={{ fontFamily: 'Poiret One, cursive', fontSize: 'clamp(40px, 6vw, 72px)', color: 'var(--bone)', lineHeight: 1 }}>
        {suffix === 'prefix' ? '< ' : ''}{num}{suffix !== 'prefix' ? suffix : ''}
      </div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'var(--ash)', marginTop: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  const [heroRef, heroVisible] = useReveal(0.1)
  const [problemRef, problemVisible] = useReveal(0.15)
  const [servicesRef, servicesVisible] = useReveal(0.12)
  const [statsRef, statsVisible] = useReveal(0.25)
  const [stepsRef, stepsVisible] = useReveal(0.15)
  const [whoRef, whoVisible] = useReveal(0.2)
  const [ctaRef, ctaVisible] = useReveal(0.2)

  const stagger = (i) => ({ transitionDelay: `${i * 150}ms` })

  const services = [
    { title: 'AI Lead Response Systems', body: 'Respond to every inbound lead in under 60 seconds — automatically, every time, 24/7.' },
    { title: 'Automated Nurture & Reactivation', body: 'Re-engage cold leads and past clients with intelligent follow-up sequences.' },
    { title: 'Content & Ad Systems', body: 'Build content engines and paid ad frameworks that generate demand on autopilot.' },
    { title: 'CRM & Pipeline Buildout', body: 'Clean, configured, and automated pipelines so nothing slips through the cracks.' },
  ]

  const steps = [
    { n: '01', title: 'Free AI Audit', body: 'We map your current system and find exactly where leads are dying.' },
    { n: '02', title: 'Blueprint', body: 'A documented 90-day implementation roadmap, specific to your business.' },
    { n: '03', title: 'Execution', body: 'We build and run the systems. You close the leads.' },
  ]

  const marqueeText = 'MED SPAS · LAW FIRMS · GYMS · DENTAL · COSMETIC SURGERY · FINANCIAL ADVISORS · LUXURY CONTRACTORS · '

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 24px' }}>
        <ParticleCanvas />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <GlitchWordmark plain="SCORNA" style={{ fontFamily: 'Poiret One, cursive', fontSize: 'clamp(52px, 13.5vw, 120px)', color: 'var(--bone)', letterSpacing: '0.12em', display: 'block', lineHeight: 1 }}>
              <span style={{ color: 'var(--ember)' }}>S</span>CORNA
            </GlitchWordmark>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(18px, 3vw, 26px)', color: 'var(--bone)', marginTop: 28, lineHeight: 1.5, opacity: 0.85 }}
          >
            AI infrastructure for businesses that refuse to be average.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ marginTop: 48 }}
          >
            <button className="btn-scorna" onClick={() => navigate('/book')}>
              BOOK YOUR AUDIT
            </button>
          </motion.div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
          <EmberLineRule visible={heroVisible} />
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section ref={problemRef} style={{ padding: 'clamp(64px,10vw,120px) clamp(24px,8vw,120px)' }}>
        <h2 className={`reveal ${problemVisible ? 'visible' : ''}`}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,5vw,52px)', fontWeight: 400, lineHeight: 1.2, marginBottom: 64, maxWidth: 700 }}>
          You're losing leads you already paid for.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
          {[
            "Your ads are running. Your form is filling. Your phone isn't ringing.",
            'The follow-up gap is costing you clients every single day.',
            'Your last agency promised results. You got reports.',
          ].map((text, i) => (
            <div key={i}
              className={`reveal ${problemVisible ? 'visible' : ''}`}
              style={{ ...stagger(i + 1), borderLeft: '1px solid var(--ash)', paddingLeft: 24 }}>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'var(--bone)', lineHeight: 1.7, opacity: 0.8 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What We Do ── */}
      <section ref={servicesRef} style={{ padding: 'clamp(64px,10vw,120px) clamp(24px,8vw,120px)', background: 'var(--obsidian)' }}>
        <div className={`reveal ${servicesVisible ? 'visible' : ''}`} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <EmberLineRule visible={servicesVisible} />
        </div>
        <div className={`reveal ${servicesVisible ? 'visible' : ''}`} style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'var(--ash)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>WHAT WE BUILD</span>
        </div>
        <h2 className={`reveal ${servicesVisible ? 'visible' : ''}`}
          style={{ fontFamily: 'Poiret One, cursive', fontSize: 'clamp(32px,5vw,56px)', color: 'var(--bone)', marginBottom: 56, letterSpacing: '0.05em' }}>
          Growth infrastructure.<br />Not marketing fluff.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {services.map((s, i) => (
            <div key={i}
              className={`reveal ${servicesVisible ? 'visible' : ''}`}
              style={{
                ...stagger(i),
                border: '1px solid var(--ash)',
                boxShadow: '3px 3px 0 var(--ash)',
                padding: '36px 28px',
                background: 'var(--void)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--ember)'
                e.currentTarget.style.boxShadow = '3px 3px 0 var(--ember)'
                e.currentTarget.style.transform = 'translate(-1px,-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--ash)'
                e.currentTarget.style.boxShadow = '3px 3px 0 var(--ash)'
                e.currentTarget.style.transform = 'translate(0,0)'
              }}
            >
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, color: 'var(--bone)', marginBottom: 14, lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--ash)', lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section ref={statsRef} style={{ background: 'var(--obsidian)', borderTop: '1px solid var(--ash)', borderBottom: '1px solid var(--ash)' }}>
        <div className="stats-strip-wrap">
          <StatItem value={60} suffix="s" label="Average lead response time we build" visible={statsVisible} />
          <div className="stats-divider" />
          <StatItem value={5} suffix="×" label="Typical improvement in lead conversion" visible={statsVisible} />
          <div className="stats-divider" />
          <StatItem value={90} suffix=" days" label="To measurable, documented ROI" visible={statsVisible} />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={stepsRef} style={{ padding: 'clamp(64px,10vw,120px) clamp(24px,8vw,120px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, position: 'relative' }}>
          {/* Connecting ember line */}
          <div className="steps-connector" style={{
            position: 'absolute', top: 38, left: '16.7%', right: '16.7%', height: 1,
            background: 'var(--ember)',
            transform: stepsVisible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 1s cubic-bezier(0.4,0,0.2,1) 0.4s',
            pointerEvents: 'none',
          }} />
          {steps.map((s, i) => (
            <div key={i}
              className={`reveal step-item ${stepsVisible ? 'visible' : ''}`}
              style={{ ...stagger(i), padding: '0 32px 0 0', position: 'relative' }}>
              <div style={{ fontFamily: 'Poiret One, cursive', fontSize: 72, color: 'var(--ash)', opacity: 0.25, lineHeight: 1, marginBottom: 8 }}>{s.n}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 500, color: 'var(--bone)', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--ash)', lineHeight: 1.7 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section ref={whoRef} style={{ padding: 'clamp(48px,8vw,96px) clamp(24px,8vw,120px) 0', background: 'var(--obsidian)' }}>
        <h2 className={`reveal ${whoVisible ? 'visible' : ''}`}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, color: 'var(--bone)', marginBottom: 48 }}>
          Built for operators, not marketers.
        </h2>
        <div style={{ overflow: 'hidden', padding: '28px 0', borderTop: '1px solid var(--ash)', borderBottom: '1px solid var(--ash)' }}>
          <div style={{ display: 'flex', animation: 'marquee 28s linear infinite', width: 'max-content' }}>
            {[marqueeText, marqueeText].map((t, i) => (
              <span key={i} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'var(--ash)', letterSpacing: '0.14em', whiteSpace: 'nowrap', paddingRight: 0 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section ref={ctaRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--void)', padding: '80px 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={ctaVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{
            border: '1px solid var(--ember)',
            padding: 'clamp(48px,8vw,96px) clamp(32px,6vw,80px)',
            animation: ctaVisible ? 'pulseEmber 3s ease-in-out infinite' : 'none',
            maxWidth: 680,
            width: '100%',
          }}
        >
          <h2 style={{ fontFamily: 'Poiret One, cursive', fontSize: 'clamp(36px,6vw,72px)', color: 'var(--bone)', letterSpacing: '0.06em', marginBottom: 24 }}>
            Your leads are leaking.
          </h2>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(18px,2.5vw,24px)', color: 'var(--bone)', opacity: 0.8, marginBottom: 48, lineHeight: 1.5 }}>
            We fix that. Free audit. No pitch deck.
          </p>
          <button className="btn-scorna" onClick={() => navigate('/book')}>
            BOOK THE AUDIT
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer" style={{ padding: '28px clamp(24px,6vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: 'Poiret One, cursive', fontSize: 22, color: 'var(--bone)', letterSpacing: '0.1em' }}><span style={{ color: 'var(--ember)' }}>S</span>CORNA</span>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', letterSpacing: '0.06em' }}>© 2025 Scorna</span>
        <a href="mailto:von@scorna.co" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', letterSpacing: '0.06em' }}>von@scorna.co</a>
      </footer>
    </div>
  )
}
