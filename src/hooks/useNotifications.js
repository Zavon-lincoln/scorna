import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Notifications for a client.
 * Gracefully handles the case where the notifications table does not yet exist.
 */
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
      // If the table doesn't exist yet, treat it as empty rather than an error.
      if (err) {
        if (err.message && (err.message.includes('does not exist') || err.message.includes('schema cache'))) {
          setNotifications([])
          return
        }
        throw err
      }
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

  const markRead = useCallback(
    async (id) => {
      const prev = notifications
      setNotifications((cur) =>
        cur.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      try {
        const { error: err } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
        if (err) {
          setNotifications(prev)
        }
      } catch {
        setNotifications(prev)
      }
    },
    [notifications]
  )

  const markAllRead = useCallback(async () => {
    if (!clientId) return
    const prev = notifications
    setNotifications((cur) => cur.map((n) => ({ ...n, read: true })))
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('client_id', clientId)
        .eq('read', false)
      if (err) setNotifications(prev)
    } catch {
      setNotifications(prev)
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
