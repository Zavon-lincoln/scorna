import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { toDateInput } from '../lib/utils'

/** Weekly content schedule for a client, scoped to a week_start date. */
export function useContentSchedule(clientId, weekStart) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const weekStr = weekStart ? toDateInput(weekStart) : null

  const fetchItems = useCallback(async () => {
    if (!clientId || !weekStr) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('content_schedule')
        .select('*')
        .eq('client_id', clientId)
        .eq('week_start', weekStr)
      if (err) throw err
      setItems(data || [])
    } catch (err) {
      console.error('useContentSchedule fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId, weekStr])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  /** Insert or update the entry for a given day in the current week. */
  const upsertDay = useCallback(
    async (dayOfWeek, patch) => {
      const existing = items.find((i) => i.day_of_week === dayOfWeek)
      if (existing) {
        const { data, error: err } = await supabase
          .from('content_schedule')
          .update(patch)
          .eq('id', existing.id)
          .select('*')
          .single()
        if (err) throw err
        setItems((prev) => prev.map((i) => (i.id === existing.id ? data : i)))
        return data
      }
      const { data, error: err } = await supabase
        .from('content_schedule')
        .insert({
          ...patch,
          client_id: clientId,
          week_start: weekStr,
          day_of_week: dayOfWeek,
        })
        .select('*')
        .single()
      if (err) throw err
      setItems((prev) => [...prev, data])
      return data
    },
    [items, clientId, weekStr]
  )

  return { items, loading, error, refetch: fetchItems, upsertDay }
}

/** Blog posts for a client, with CRUD. */
export function useBlogPosts(clientId) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    if (!clientId) {
      setPosts([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('client_id', clientId)
        .order('publish_date', { ascending: false, nullsFirst: false })
      if (err) throw err
      setPosts(data || [])
    } catch (err) {
      console.error('useBlogPosts fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const createPost = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase
        .from('blog_posts')
        .insert({ ...payload, client_id: clientId })
        .select('*')
        .single()
      if (err) throw err
      setPosts((prev) => [data, ...prev])
      return data
    },
    [clientId]
  )

  const updatePost = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase
      .from('blog_posts')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    setPosts((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }, [])

  const deletePost = useCallback(async (id) => {
    const { error: err } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)
    if (err) throw err
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  }
}
