import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/** Team members for a client, with CRUD. */
export function useTeam(clientId) {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeam = useCallback(async () => {
    if (!clientId) {
      setTeam([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('team_members')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })
      if (err) throw err
      setTeam(data || [])
    } catch (err) {
      console.error('useTeam fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const createMember = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase
        .from('team_members')
        .insert({ ...payload, client_id: clientId })
        .select('*')
        .single()
      if (err) throw err
      setTeam((prev) => [...prev, data])
      return data
    },
    [clientId]
  )

  const updateMember = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase
      .from('team_members')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    setTeam((prev) => prev.map((m) => (m.id === id ? data : m)))
    return data
  }, [])

  const deleteMember = useCallback(async (id) => {
    const { error: err } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
    if (err) throw err
    setTeam((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return {
    team,
    loading,
    error,
    refetch: fetchTeam,
    createMember,
    updateMember,
    deleteMember,
  }
}
