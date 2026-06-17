import { Link } from 'react-router-dom'
import {
  ArrowRight,
  PhoneOff,
  Snowflake,
  UserCog,
  Globe,
  MessageSquare,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react'

/**
 * Scorna marketing homepage. Single scrolling page on the glass system.
 * Phase 1 lays out the full structure; the contact form is wired to the
 * Supabase leads table in the public-zone phase.
 */
const PROBLEMS = [
  {
    icon: Snowflake,
    title: 'Leads go cold',
    body: 'Enquiries land in an inbox and sit there. By the time anyone follows up, the prospect has already booked with someone faster.',
  },
  {
    icon: PhoneOff,
    title: 'No reactivation system',
    body: 'Past customers and dead leads are a goldmine you never mine. There is no system bringing them back — so they never come back.',
  },
  {
    icon: UserCog,
    title: 'You are the bottleneck',
    body: 'Every decision, every follow-up, every quote runs through you. The business cannot grow faster than your calendar allows.',
  },
]

const DELIVERABLES = [
  { icon: Globe, title: 'Conversion site', body: 'A site built to turn visitors into booked calls — not just look good.' },
  { icon: MessageSquare, title: 'Lead capture & reactivation', body: 'Instant response to new leads and automated win-back for old ones.' },
  { icon: Calendar, title: 'Booking & scheduling', body: 'Self-serve booking that fills your calendar without the back-and-forth.' },
  { icon: BarChart3, title: 'Pipeline dashboard', body: 'Every lead, appointment, and follow-up in one place you can act on.' },
  { icon: Sparkles, title: 'Content engine', body: 'A steady stream of on-brand content that keeps you top of mind.' },
]

const PROCESS = ['Cold Call', 'Discovery', 'Audit', 'Blueprint', 'Retainer']

export default function Home() {
  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="home-hero">
        <p className="text-label">Done-for-you growth systems</p>
        <h1 className="text-display home-hero-title">
          Your business shouldn&rsquo;t need you to run it.
        </h1>
        <p className="text-body home-hero-sub">
          Scorna builds the lead capture, follow-up, and booking systems that
          turn your business into something that runs — and grows — without
          living on your shoulders.
        </p>
        <div className="home-hero-cta">
          <a href="#process" className="btn btn-default">
            See how it works
          </a>
          <a href="#contact" className="btn btn-primary">
            Get a free audit <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────── */}
      <section className="home-section">
        <h2 className="text-h1 home-section-title">Why good businesses stall</h2>
        <div className="home-grid-3">
          {PROBLEMS.map((p) => {
            const Icon = p.icon
            return (
              <article key={p.title} className="glass-card glass-ember home-card">
                <Icon size={22} color="var(--ember-glow)" />
                <h3 className="text-h3">{p.title}</h3>
                <p className="text-body">{p.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── What we build ────────────────────────────────────────── */}
      <section className="home-section">
        <h2 className="text-h1 home-section-title">What we build</h2>
        <div className="home-grid-5">
          {DELIVERABLES.map((d) => {
            const Icon = d.icon
            return (
              <article key={d.title} className="glass-card home-card">
                <Icon size={20} color="var(--bone)" />
                <h3 className="text-h3">{d.title}</h3>
                <p className="text-body">{d.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────── */}
      <section id="process" className="home-section">
        <h2 className="text-h1 home-section-title">The path</h2>
        <ol className="home-process">
          {PROCESS.map((step, i) => (
            <li key={step} className="home-process-step">
              <span className="home-process-num">{i + 1}</span>
              <span className="home-process-label">{step}</span>
              {i < PROCESS.length - 1 && <span className="home-process-line" />}
            </li>
          ))}
        </ol>
      </section>

      {/* ── CTA / contact ────────────────────────────────────────── */}
      <section id="contact" className="home-section home-cta">
        <div className="glass-elevated home-cta-card">
          <h2 className="text-h1">Start with a free audit</h2>
          <p className="text-body">
            We&rsquo;ll map exactly where your business is leaking revenue and
            what it would take to fix it — no cost, no obligation.
          </p>
          <Link to="/login" className="btn btn-primary">
            Get my free audit <ArrowRight size={14} />
          </Link>
          <p className="text-meta">Contact form wiring lands in the next phase.</p>
        </div>
      </section>
    </div>
  )
}
