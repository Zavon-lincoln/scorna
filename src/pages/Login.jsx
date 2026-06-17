import { useState } from 'react'
import { supabase } from '../lib/supabase'
import FormField from '../components/ui/FormField'
import { Loader2 } from 'lucide-react'

/**
 * Login screen. No signup — accounts are created by admins.
 * On success the auth state change in useAuth flips the app to the dashboard.
 */
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (err) throw err
      // useAuth's onAuthStateChange handles navigation.
    } catch (err) {
      console.error('Login failed:', err)
      setError(err.message || 'Unable to sign in. Check your credentials.')
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen zone-fade">
      <div className="glass-elevated login-card">
        <div className="wordmark">
          <em>S</em>CORNA
        </div>
        <div className="login-tagline">Execution. Clarity. Growth.</div>

        <form className="login-form" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={setEmail}
            placeholder="you@business.com"
            required
          />
          <FormField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ justifyContent: 'center', padding: '11px' }}
            disabled={submitting || !email || !password}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="spin" /> Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
