import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--obsidian)',
  border: '1px solid var(--ash)',
  color: 'var(--bone)',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s ease',
}

function Field({ label, required, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <label style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ash)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: 'var(--ember)', marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </motion.div>
  )
}

const focusHandler = e => { e.target.style.borderColor = 'var(--ember)' }
const blurHandler  = e => { e.target.style.borderColor = 'var(--ash)' }

export default function BookingForm() {
  const [form, setForm] = useState({
    name: '', business: '', type: '', email: '', phone: '',
    spend: '', challenge: '', callTime: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name = true
    if (!form.business.trim()) e.business = true
    if (!form.email.trim())    e.email = true
    if (!form.phone.trim())    e.phone = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(false)

    const { error } = await supabase.from('bookings').insert([{
      name:      form.name,
      business:  form.business,
      type:      form.type,
      email:     form.email,
      phone:     form.phone,
      spend:     form.spend,
      challenge: form.challenge,
      call_time: form.callTime,
      status:    'New',
      notes:     '',
    }])

    setSubmitting(false)
    if (error) {
      setSubmitError(true)
    } else {
      setSubmitted(true)
    }
  }

  const sharedInput = (key) => ({
    style: { ...inputStyle, ...(errors[key] ? { borderColor: 'var(--ember)' } : {}) },
    onFocus: focusHandler,
    onBlur: blurHandler,
    value: form[key],
    onChange: set(key),
  })

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ textAlign: 'center', padding: '48px 0' }}
      >
        <div style={{ width: '100%', height: 1, background: 'var(--ember)', marginBottom: 40 }} />
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 32, color: 'var(--bone)', marginBottom: 20 }}>
          Request received.
        </p>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--ash)', lineHeight: 1.7 }}>
          We'll confirm your time within 24 hours. Check your email.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Field label="Full Name" required delay={0.05}><input type="text" {...sharedInput('name')} /></Field>
      <Field label="Business Name" required delay={0.13}><input type="text" {...sharedInput('business')} /></Field>
      <Field label="Business Type" delay={0.21}>
        <select {...sharedInput('type')} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
          <option value="">Select…</option>
          {['Med Spa','Dental','Law Firm','Gym','Cosmetic Surgery','Financial','Contractor','Other'].map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Email Address" required delay={0.29}><input type="email" {...sharedInput('email')} /></Field>
      <Field label="Phone Number" required delay={0.37}><input type="tel" {...sharedInput('phone')} /></Field>
      <Field label="Monthly Marketing Spend" delay={0.45}>
        <select {...sharedInput('spend')} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
          <option value="">Select…</option>
          {['Under $1K','$1K–$3K','$3K–$7K','$7K+'].map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Biggest Challenge" delay={0.53}>
        <textarea rows={3} {...sharedInput('challenge')} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
      <Field label="Preferred Call Time" delay={0.61}>
        <select {...sharedInput('callTime')} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
          <option value="">Select…</option>
          {['Morning 8–11am','Midday 11am–2pm','Afternoon 2–5pm','Evening 5–7pm'].map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>

      {submitError && (
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--ember)' }}>
          Something went wrong. Please try again.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.69, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          type="submit"
          className="btn-scorna"
          disabled={submitting}
          style={{ width: '100%', textAlign: 'center', padding: '16px', fontSize: 13, opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'SENDING…' : 'REQUEST AUDIT'}
        </button>
      </motion.div>
    </form>
  )
}
