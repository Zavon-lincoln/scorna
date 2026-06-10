import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  Users,
  CalendarCheck,
  Star,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import Avatar from '../components/shared/Avatar'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { todayStr, startOfWeek, toDateInput, formatTime } from '../lib/utils'

/**
 * Dashboard home. Fetches all summary data in parallel.
 * Props: clientId, onOpenLead(leadId), onNavigate(page).
 */
export default function Overview({ clientId, onOpenLead, onNavigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const today = todayStr()
      const dayStart = new Date(today + 'T00:00:00').toISOString()
      const dayEnd = new Date(today + 'T23:59:59').toISOString()
      const weekStartStr = toDateInput(startOfWeek(new Date()))

      const [
        activeLeadsRes,
        apptTodayRes,
        reviewsRes,
        contentRes,
        recentLeadsRes,
        scheduleRes,
      ] = await Promise.all([
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .not('status', 'in', '(closed,lost)'),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .gte('start_time', dayStart)
          .lte('start_time', dayEnd),
        supabase.from('reviews').select('rating').eq('client_id', clientId),
        supabase
          .from('content_schedule')
          .select('status')
          .eq('client_id', clientId)
          .eq('week_start', weekStartStr),
        supabase
          .from('leads')
          .select('*, team_members(initials, color)')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('appointments')
          .select('*, team_members(full_name, color)')
          .eq('client_id', clientId)
          .gte('start_time', dayStart)
          .lte('start_time', dayEnd)
          .neq('status', 'cancelled')
          .order('start_time', { ascending: true }),
      ])

      // Surface the first error encountered.
      const firstErr = [
        activeLeadsRes,
        apptTodayRes,
        reviewsRes,
        contentRes,
        recentLeadsRes,
        scheduleRes,
      ].find((r) => r.error)?.error
      if (firstErr) throw firstErr

      const ratings = (reviewsRes.data || []).map((r) => r.rating)
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0

      const contentDone = (contentRes.data || []).filter((c) =>
        ['published', 'scheduled'].includes(c.status)
      ).length

      setData({
        activeLeads: activeLeadsRes.count || 0,
        apptToday: apptTodayRes.count || 0,
        avgRating,
        reviewCount: ratings.length,
        contentDone,
        recentLeads: recentLeadsRes.data || [],
        schedule: scheduleRes.data || [],
      })
    } catch (err) {
      console.error('Overview load:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="page-inner">
        <div className="stat-grid">
          {[0, 1, 2, 3].map((i) => (
            <LoadingState key={i} lines={2} />
          ))}
        </div>
        <div className="two-col">
          <LoadingState lines={5} />
          <LoadingState lines={5} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-inner">
        <ErrorState error={error} onRetry={load} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page-inner">
        <EmptyState
          icon={Users}
          title="No client linked"
          message="Your account is not linked to a client. Open the Admin panel to manage clients and users."
          actionLabel="Go to Admin"
          onAction={() => onNavigate('admin')}
        />
      </div>
    )
  }

  const stats = [
    {
      label: 'Active Leads',
      value: data.activeLeads,
      sub: 'Open opportunities',
      icon: Users,
    },
    {
      label: 'Appointments Today',
      value: data.apptToday,
      sub: data.apptToday === 0 ? 'Nothing booked' : 'Scheduled today',
      icon: CalendarCheck,
    },
    {
      label: 'Avg Review Rating',
      value: data.reviewCount ? `${data.avgRating.toFixed(1)}★` : '—',
      sub: `${data.reviewCount} review${data.reviewCount === 1 ? '' : 's'}`,
      icon: Star,
    },
    {
      label: 'Content This Week',
      value: `${data.contentDone}/7`,
      sub: 'Published or scheduled',
      icon: FileText,
    },
  ]

  return (
    <div className="page-inner">
      {/* Stats */}
      <div className="stat-grid">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass stat-card">
              <div className="accent-bar" />
              <Icon size={18} className="stat-icon" />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="two-col">
        {/* Recent leads */}
        <div className="glass card">
          <div className="card-head">
            <h3>Recent Leads</h3>
            <button className="btn btn-sm" onClick={() => onNavigate('leads')}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          {data.recentLeads.length === 0 ? (
            <EmptyState
              card={false}
              icon={Users}
              title="No leads yet"
              message="Add your first lead to start tracking opportunities."
              actionLabel="Go to Leads"
              onAction={() => onNavigate('leads')}
            />
          ) : (
            <div>
              {data.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="list-row"
                  onClick={() => onOpenLead(lead.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && onOpenLead(lead.id)
                  }
                >
                  <Avatar
                    name={lead.name}
                    initials={lead.team_members?.initials}
                    color={lead.team_members?.color || '#7B0D0D'}
                    size={34}
                  />
                  <div className="grow">
                    <div className="name">{lead.name}</div>
                    <div className="meta">
                      {lead.service || 'No service'} ·{' '}
                      {lead.source || 'Unknown source'}
                    </div>
                  </div>
                  <span className={`pill pill-${lead.status}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's schedule */}
        <div className="glass card">
          <div className="card-head">
            <h3>Today's Schedule</h3>
            <button
              className="btn btn-sm"
              onClick={() => onNavigate('schedule')}
            >
              Calendar <ArrowUpRight size={12} />
            </button>
          </div>
          {data.schedule.length === 0 ? (
            <EmptyState
              card={false}
              icon={CalendarCheck}
              title="No appointments today"
              message="Your day is clear. Book an appointment from the Schedule page."
            />
          ) : (
            <div>
              {data.schedule.map((appt) => (
                <div key={appt.id} className="timeline-row">
                  <span className="time">{formatTime(appt.start_time)}</span>
                  <div className="grow">
                    <div className="name">{appt.client_name}</div>
                    <div className="meta">{appt.service || '—'}</div>
                  </div>
                  {appt.team_members && (
                    <div className="row gap-sm">
                      <span
                        className="staff-dot"
                        style={{
                          background: appt.team_members.color || '#7B0D0D',
                        }}
                      />
                      <span className="meta">
                        {appt.team_members.full_name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
