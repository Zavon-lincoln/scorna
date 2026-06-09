import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/** Ad metrics for a client, grouped access by platform. */
export function useAdMetrics(clientId) {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    if (!clientId) {
      setMetrics([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('ad_metrics')
        .select('*')
        .eq('client_id', clientId)
        .order('recorded_date', { ascending: false })
      if (err) throw err
      setMetrics(data || [])
    } catch (err) {
      console.error('useAdMetrics fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const addMetric = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase
        .from('ad_metrics')
        .insert({ ...payload, client_id: clientId })
        .select('*')
        .single()
      if (err) throw err
      setMetrics((prev) =>
        [data, ...prev].sort(
          (a, b) => new Date(b.recorded_date) - new Date(a.recorded_date)
        )
      )
      return data
    },
    [clientId]
  )

  /** Latest metric record for a platform ('Meta' | 'Google'). */
  const latestFor = useCallback(
    (platform) => metrics.find((m) => m.platform === platform) || null,
    [metrics]
  )

  return { metrics, loading, error, refetch: fetchMetrics, addMetric, latestFor }
}

/** Reviews for a client, with add + responded toggle. */
export function useReviews(clientId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = useCallback(async () => {
    if (!clientId) {
      setReviews([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', clientId)
        .order('review_date', { ascending: false, nullsFirst: false })
      if (err) throw err
      setReviews(data || [])
    } catch (err) {
      console.error('useReviews fetch:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const addReview = useCallback(
    async (payload) => {
      const { data, error: err } = await supabase
        .from('reviews')
        .insert({ ...payload, client_id: clientId })
        .select('*')
        .single()
      if (err) throw err
      setReviews((prev) =>
        [data, ...prev].sort(
          (a, b) => new Date(b.review_date) - new Date(a.review_date)
        )
      )
      return data
    },
    [clientId]
  )

  const toggleResponded = useCallback(async (id, responded) => {
    const { data, error: err } = await supabase
      .from('reviews')
      .update({ responded })
      .eq('id', id)
      .select('*')
      .single()
    if (err) throw err
    setReviews((prev) => prev.map((r) => (r.id === id ? data : r)))
    return data
  }, [])

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    addReview,
    toggleResponded,
    avgRating,
  }
}
