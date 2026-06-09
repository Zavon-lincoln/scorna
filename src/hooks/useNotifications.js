import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/** Notifications for a client, with read management. */
export function useNotifications(clientId) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    if (!clientId) {
      setNotifications([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setNotifications(data || [])
    } catch (err) {
      console.error('useNotifications fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  /** Optimistic mark-read for a single notification. */
  const markRead = useCallback(
    async (id) => {
      const prev = notifications
      setNotifications((cur) =>
        cur.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      const { error: err } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
      if (err) {
        console.error('markRead failed, reverting:', err)
        setNotifications(prev) // revert
        throw err
      }
    },
    [notifications]
  )

  const markAllRead = useCallback(async () => {
    if (!clientId) return
    const prev = notifications
    setNotifications((cur) => cur.map((n) => ({ ...n, read: true })))
    const { error: err } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('client_id', clientId)
      .eq('read', false)
    if (err) {
      console.error('markAllRead failed, reverting:', err)
      setNotifications(prev)
      throw err
    }
  }, [clientId, notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markRead,
    markAllRead,
    unreadCount,
  }
}
