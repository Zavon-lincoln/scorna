import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Appointments for a client.
 * DB column: appointment_time (not start_time), no end_time, staff_member (text, not staff_id FK).
 */
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
        .select('*')
        .eq('client_id', clientId)
        .order('appointment_time', { ascending: true })
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

  const createAppointment = useCallback(
    async (payload, recurrence) => {
      const rows = []
      const baseTime = new Date(payload.appointment_time)

      if (recurrence?.frequency && recurrence?.end) {
        const endDate = new Date(recurrence.end + 'T23:59:59')
        let cursor = new Date(baseTime)
        let guard = 0
        while (cursor <= endDate && guard < 366) {
          rows.push({
            ...payload,
            client_id: clientId,
            appointment_time: cursor.toISOString(),
          })
          if (recurrence.frequency === 'Daily') {
            cursor = addTime(cursor, { days: 1 })
          } else if (recurrence.frequency === 'Weekly') {
            cursor = addTime(cursor, { days: 7 })
          } else {
            cursor = addTime(cursor, { months: 1 })
          }
          guard++
        }
      } else {
        rows.push({ ...payload, client_id: clientId })
      }

      const { data, error: err } = await supabase
        .from('appointments')
        .insert(rows)
        .select('*')
      if (err) throw err
      setAppointments((prev) =>
        [...prev, ...(data || [])].sort(
          (a, b) => new Date(a.appointment_time) - new Date(b.appointment_time)
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
      .select('*')
      .single()
    if (err) throw err
    setAppointments((prev) =>
      prev
        .map((a) => (a.id === id ? data : a))
        .sort((x, y) => new Date(x.appointment_time) - new Date(y.appointment_time))
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

function addTime(date, { days = 0, months = 0 }) {
  const d = new Date(date)
  if (days) d.setDate(d.getDate() + days)
  if (months) d.setMonth(d.getMonth() + months)
  return d
}
