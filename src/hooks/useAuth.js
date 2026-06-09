import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Auth state for the app.
 * Exposes: { session, user, role, clientId, clientName, loading, signOut, refresh }
 *
 * On mount we read the current session, then load the matching row from the
 * `users` table (role + client_id + profile) and the linked client name.
 * We re-run that load whenever the auth state changes.
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [clientName, setClientName] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (activeSession) => {
    if (!activeSession?.user) {
      setUser(null)
      setClientName(null)
      return
    }
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, role, client_id, full_name, email')
        .eq('id', activeSession.user.id)
        .single()

      if (error) throw error
      setUser(profile)

      if (profile?.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('name')
          .eq('id', profile.client_id)
          .single()
        setClientName(client?.name || null)
      } else {
        setClientName(null)
      }
    } catch (err) {
      console.error('Failed to load user profile:', err)
      // Fall back to a minimal profile so the app can still render
      // (e.g. auth user exists but no users-table row yet).
      setUser({
        id: activeSession.user.id,
        role: 'client',
        client_id: null,
        full_name: activeSession.user.email,
        email: activeSession.user.email,
      })
      setClientName(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Initial session.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await loadProfile(data.session)
      if (mounted) setLoading(false)
    })

    // Subscribe to changes (login / logout / token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      await loadProfile(newSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setClientName(null)
  }, [])

  const refresh = useCallback(() => loadProfile(session), [session, loadProfile])

  return {
    session,
    user,
    role: user?.role || null,
    clientId: user?.client_id || null,
    clientName,
    loading,
    signOut,
    refresh,
  }
}
