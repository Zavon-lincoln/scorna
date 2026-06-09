import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/** Appointments for a client, with CRUD + recurrence generation. */
export function useAppointments(clientId) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    if (!clientId) {
      setAppointments([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('appointments')
        .select('*, team_members(id, full_name, initials, color)')
        .eq('client_id', clientId)
        .order('start_time', { ascending: true })
      if (err) throw err
      setAppointments(data || [])
    } catch (err) {
      console.error('useAppointments fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  /**
   * Create one appointment, or a series when recurring.
   * `recurrence` = { frequency: 'Daily'|'Weekly'|'Monthly', end: 'YYYY-MM-DD' }.
   */
  const createAppointment = useCallback(
    async (payload, recurrence) => {
      const rows = []
      const baseStart = new Date(payload.start_time)
      const baseEnd = new Date(payload.end_time)

      if (recurrence?.frequency && recurrence?.end) {
        const endDate = new Date(recurrence.end + 'T23:59:59')
        let cursorStart = new Date(baseStart)
        let cursorEnd = new Date(baseEnd)
        let guard = 0
        while (cursorStart <= endDate && guard < 366) {
          rows.push({
            ...payload,
            client_id: clientId,
            start_time: cursorStart.toISOString(),
            end_time: cursorEnd.toISOString(),
            is_recurring: true,
            recurrence_rule: recurrence.frequency,
            recurrence_end: recurrence.end,
          })
          // Advance.
          if (recurrence.frequency === 'Daily') {
            cursorStart = addTime(cursorStart, { days: 1 })
            cursorEnd = addTime(cursorEnd, { days: 1 })
          } else if (recurrence.frequency === 'Weekly') {
            cursorStart = addTime(cursorStart, { days: 7 })
            cursorEnd = addTime(cursorEnd, { days: 7 })
          } else {
            cursorStart = addTime(cursorStart, { months: 1 })
            cursorEnd = addTime(cursorEnd, { months: 1 })
          }
          guard++
        }
      } else {
        rows.push({ ...payload, client_id: clientId })
      }

      const { data, error: err } = await supabase
        .from('appointments')
        .insert(rows)
        .select('*, team_members(id, full_name, initials, color)')
      if (err) throw err
      setAppointments((prev) =>
        [...prev, ...(data || [])].sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time)
        )
      )
      return data
    },
    [clientId]
  )

  const updateAppointment = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase
      .from('appointments')
      .update(patch)
      .eq('id', id)
      .select('*, team_members(id, full_name, initials, color)')
      .single()
    if (err) throw err
    setAppointments((prev) =>
      prev
        .map((a) => (a.id === id ? data : a))
        .sort((x, y) => new Date(x.start_time) - new Date(y.start_time))
    )
    return data
  }, [])

  const deleteAppointment = useCallback(async (id) => {
    const { error: err } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    if (err) throw err
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  }
}

// Local helper that preserves wall-clock time across day/month shifts.
function addTime(date, { days = 0, months = 0 }) {
  const d = new Date(date)
  if (days) d.setDate(d.getDate() + days)
  if (months) d.setMonth(d.getMonth() + months)
  return d
}
