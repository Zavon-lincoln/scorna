import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Leads for a client (or all leads when admin passes clientId = null and
 * relies on RLS being bypassed elsewhere — here we always scope by clientId
 * when provided). Provides CRUD + status change with activity logging.
 */
export function useLeads(clientId) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    if (!clientId) {
      setLeads([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('leads')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setLeads(data || [])
    } catch (err) {
      console.error('useLeads fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  /** Insert a lead + log the initial status activity. */
  const createLead = useCallback(
    async (payload, createdBy) => {
      const { data, error: err } = await supabase
        .from('leads')
        .insert({ ...payload, client_id: clientId })
        .select('*')
        .single()
      if (err) throw err

      await supabase.from('lead_activity').insert({
        lead_id: data.id,
        client_id: clientId,
        type: 'status_change',
        content: 'Lead created',
        to_status: data.status,
        created_by: createdBy || null,
      })

      setLeads((prev) => [data, ...prev])
      return data
    },
    [clientId]
  )

  const updateLead = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase
      .from('leads')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)))
    return data
  }, [])

  /**
   * Change a lead's status and log the transition.
   * Optimistic: caller updates UI first; this persists + logs.
   */
  const changeStatus = useCallback(
    async (lead, toStatus, createdBy) => {
      const fromStatus = lead.status
      if (fromStatus === toStatus) return lead
      const { data, error: err } = await supabase
        .from('leads')
        .update({ status: toStatus })
        .eq('id', lead.id)
        .select('*')
        .single()
      if (err) throw err

      await supabase.from('lead_activity').insert({
        lead_id: lead.id,
        client_id: lead.client_id,
        type: 'status_change',
        content: `Status changed from ${fromStatus} to ${toStatus}`,
        from_status: fromStatus,
        to_status: toStatus,
        created_by: createdBy || null,
      })

      setLeads((prev) => prev.map((l) => (l.id === lead.id ? data : l)))
      return data
    },
    []
  )

  const deleteLead = useCallback(async (id) => {
    const { error: err } = await supabase.from('leads').delete().eq('id', id)
    if (err) throw err
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }, [])

  // Local optimistic setter for drag-and-drop.
  const setLeadStatusLocal = useCallback((id, status) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }, [])

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    changeStatus,
    deleteLead,
    setLeadStatusLocal,
  }
}

/** Activity timeline + add-note for a single lead. */
export function useLeadActivity(leadId, clientId) {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchActivity = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('lead_activity')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      if (err) {
        // Table may not exist yet — treat as empty rather than crashing.
        if (err.message && (err.message.includes('does not exist') || err.message.includes('schema cache'))) {
          setActivity([])
          return
        }
        throw err
      }
      setActivity(data || [])
    } catch (err) {
      console.error('useLeadActivity fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const addNote = useCallback(
    async (content, createdBy) => {
      // lead_activity table may not exist yet
      const { data, error: err } = await supabase
        .from('lead_activity')
        .insert({
          lead_id: leadId,
          client_id: clientId,
          type: 'note',
          content,
          created_by: createdBy || null,
        })
        .select('*')
        .single()
      if (err) throw err
      setActivity((prev) => [data, ...prev])
      return data
    },
    [leadId, clientId]
  )

  return { activity, loading, error, refetch: fetchActivity, addNote }
}
