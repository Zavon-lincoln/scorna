import { useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import FormField from '../../components/ui/FormField'

const BUSINESS_TYPES = [
  'Med Spa', 'Dental', 'Law Firm', 'Gym', 'Cosmetic Surgery',
  'Financial', 'Contractor', 'Other',
]
const SPEND_BANDS = ['Under $1K', '$1K–$3K', '$3K–$7K', '$7K+']
const CALL_TIMES = [
  'Morning 8–11am', 'Midday 11am–2pm', 'Afternoon 2–5pm', 'Evening 5–7pm',
]

const EMPTY = {
  name: '', business: '', type: '', email: '', phone: '',
  spend: '', challenge: '', callTime: '',
}

/**
 * Public free-audit request form. Inserts an anonymous booking request into
 * the Supabase `bookings` table (anon-insert RLS); admins triage it in the
 * dashboard. No mock data — a real insert, with success + error states.
 */
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: false }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = true
    if (!form.business.trim()) e.business = true
    if (!form.email.trim()) e.email = true
    if (!form.phone.trim()) e.phone = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          full_name: form.name.trim(),
          business_name: form.business.trim(),
          business_type: form.type || null,
          email: form.email.trim(),
          phone: form.phone.trim(),
          marketing_spend: form.spend || null,
          biggest_challenge: form.challenge.trim() || null,
          preferred_time: form.callTime || null,
          status: 'New',
          notes: '',
        },
      ])
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      console.error('Booking submit failed:', err)
      setSubmitError(
        'Something went wrong sending your request. Please try again, or email hello@scorna.com.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="contact-success">
        <CheckCircle2 size={36} color="var(--ember-glow)" />
        <h3 className="text-h2">Request received.</h3>
        <p className="text-body">
          We&rsquo;ll review your business and reach out within 24 hours to book
          your free audit. Keep an eye on your inbox.
        </p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-grid">
        <FormField
          label="Full name" name="name" value={form.name} onChange={set('name')}
          placeholder="Jane Doe" required error={errors.name && 'Required'}
        />
        <FormField
          label="Business name" name="business" value={form.business}
          onChange={set('business')} placeholder="Acme Co."
          required error={errors.business && 'Required'}
        />
        <FormField
          label="Email" type="email" name="email" value={form.email}
          onChange={set('email')} placeholder="you@business.com"
          required error={errors.email && 'Required'}
        />
        <FormField
          label="Phone" type="text" name="phone" value={form.phone}
          onChange={set('phone')} placeholder="(555) 123-4567"
          required error={errors.phone && 'Required'}
        />
        <FormField
          label="Business type" type="select" name="type" value={form.type}
          onChange={set('type')} placeholder="Select…" options={BUSINESS_TYPES}
        />
        <FormField
          label="Monthly marketing spend" type="select" name="spend"
          value={form.spend} onChange={set('spend')} placeholder="Select…"
          options={SPEND_BANDS}
        />
      </div>

      <FormField
        label="Biggest challenge" type="textarea" name="challenge"
        value={form.challenge} onChange={set('challenge')}
        placeholder="What's the one thing holding growth back right now?"
      />
      <FormField
        label="Preferred call time" type="select" name="callTime"
        value={form.callTime} onChange={set('callTime')} placeholder="Select…"
        options={CALL_TIMES}
      />

      {submitError && <div className="field-error">{submitError}</div>}

      <button
        type="submit"
        className="btn btn-primary contact-submit"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 size={14} className="spin" /> Sending…
          </>
        ) : (
          <>
            Request my free audit <ArrowRight size={14} />
          </>
        )}
      </button>
    </form>
  )
}
