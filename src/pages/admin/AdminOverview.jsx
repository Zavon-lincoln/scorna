import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  CalendarCheck,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { supabaseAdmin } from '../../lib/supabase'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import {
  todayStr,
  startOfWeek,
  toDateInput,
  relativeTime,
  formatTime,
} from '../../lib/utils'

/** Cross-client admin snapshot. Uses the service-role client to bypass RLS. */
export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [expandData, setExpandData] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const today = todayStr()
      const dayStart = new Date(today + 'T00:00:00').toISOString()
      const dayEnd = new Date(today + 'T23:59:59').toISOString()
      const weekStr = toDateInput(startOfWeek(new Date()))

      const [
        clientsRes,
        leadsRes,
        apptRes,
        notifRes,
        contentRes,
        feedRes,
      ] = await Promise.all([
        supabaseAdmin.from('clients').select('*').order('name'),
        supabaseAdmin
          .from('leads')
          .select('id, client_id, status, created_at'),
        supabaseAdmin
          .from('appointments')
          .select('id, client_id, start_time, status')
          .gte('start_time', dayStart)
          .lte('start_time', dayEnd)
          .neq('status', 'cancelled'),
        supabaseAdmin
          .from('notifications')
          .select('id, client_id, read')
          .eq('read', false),
        supabaseAdmin
          .from('content_schedule')
          .select('client_id, status')
          .eq('week_start', weekStr),
        supabaseAdmin
          .from('lead_activity')
          .select('*, leads(name)')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const firstErr = [
        clientsRes,
        leadsRes,
        apptRes,
        notifRes,
        contentRes,
        feedRes,
      ].find((r) => r.error)?.error
      if (firstErr) throw firstErr

      const clients = clientsRes.data || []
      const leads = leadsRes.data || []
      const appts = apptRes.data || []
      const notifs = notifRes.data || []
      const content = contentRes.data || []
      const feed = feedRes.data || []

      // Build a client-name lookup for tags.
      const clientName = {}
      clients.forEach((c) => (clientName[c.id] = c.name))

      // Per-client rollups.
      const rows = clients.map((c) => {
        const cLeads = leads.filter((l) => l.client_id === c.id)
        const activeLeads = cLeads.filter(
          (l) => !['closed', 'lost'].includes(l.status)
        ).length
        const todayAppts = appts.filter((a) => a.client_id === c.id).length
        const lastLead = cLeads
          .map((l) => l.created_at)
          .sort()
          .slice(-1)[0]
        const contentDone = content.filter(
          (x) =>
            x.client_id === c.id &&
            ['published', 'scheduled'].includes(x.status)
        ).length
        return {
          ...c,
          activeLeads,
          todayAppts,
          lastLead,
          contentDone,
        }
      })

      setData({
        totalClients: clients.length,
        totalActiveLeads: leads.filter(
          (l) => !['closed', 'lost'].includes(l.status)
        ).length,
        totalAppts: appts.length,
        totalUnread: notifs.length,
        rows,
        feed,
        clientName,
      })
    } catch (err) {
      console.error('AdminOverview load:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleExpand = async (clientId) => {
    if (expanded === clientId) {
      setExpanded(null)
      return
    }
    setExpanded(clientId)
    if (!expandData[clientId]) {
      const today = todayStr()
      const dayStart = new Date(today + 'T00:00:00').toISOString()
      const dayEnd = new Date(today + 'T23:59:59').toISOString()
      const [leadsRes, apptRes] = await Promise.all([
        supabaseAdmin
          .from('leads')
          .select('id, name, status, created_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabaseAdmin
          .from('appointments')
          .select('id, client_name, start_time, status')
          .eq('client_id', clientId)
          .gte('start_time', dayStart)
          .lte('start_time', dayEnd)
          .order('start_time'),
      ])
      setExpandData((prev) => ({
        ...prev,
        [clientId]: {
          leads: leadsRes.data || [],
          appts: apptRes.data || [],
        },
      }))
    }
  }

  if (loading) return <LoadingState lines={8} />
  if (error) return <ErrorState error={error} onRetry={load} />

  const stats = [
    { label: 'Active Clients', value: data.totalClients, icon: Building2 },
    { label: 'Active Leads', value: data.totalActiveLeads, icon: Users },
    { label: "Appointments Today", value: data.totalAppts, icon: CalendarCheck },
    { label: 'Unread Notifications', value: data.totalUnread, icon: Bell },
  ]

  return (
    <>
      <div className="stat-grid">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass stat-card">
              <div className="accent-bar" />
              <Icon size={18} className="stat-icon" />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="admin-layout">
        {/* Per-client table */}
        <div className="glass card">
          <div className="card-head">
            <h3>Clients</h3>
          </div>
          {data.rows.length === 0 ? (
            <EmptyState
              card={false}
              icon={Building2}
              title="No clients yet"
              message="Create clients in the Clients tab."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Client</th>
                  <th>Industry</th>
                  <th>Active Leads</th>
                  <th>Today</th>
                  <th>Last Lead</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((c) => (
                  <FragmentRow
                    key={c.id}
                    c={c}
                    expanded={expanded === c.id}
                    onToggle={() => toggleExpand(c.id)}
                    detail={expandData[c.id]}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Activity feed */}
        <div className="glass card">
          <div className="card-head">
            <h3>Recent Activity</h3>
          </div>
          {data.feed.length === 0 ? (
            <EmptyState
              card={false}
              icon={Users}
              title="No activity"
              message="Lead activity across all clients will appear here."
            />
          ) : (
            <div>
              {data.feed.map((f) => (
                <div key={f.id} className="feed-item">
                  <div className="grow">
                    <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
                      <span className="client-tag">
                        {data.clientName[f.client_id] || 'Unknown'}
                      </span>
                      <span style={{ fontSize: 13 }}>
                        {f.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="meta" style={{ marginTop: 3 }}>
                      {f.leads?.name || 'Lead'} · {relativeTime(f.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function FragmentRow({ c, expanded, onToggle, detail }) {
  return (
    <>
      <tr className="clickable" onClick={onToggle}>
        <td style={{ width: 28 }}>
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </td>
        <td style={{ fontWeight: 600 }}>{c.name}</td>
        <td className="muted">{c.industry || '—'}</td>
        <td>{c.activeLeads}</td>
        <td>{c.todayAppts}</td>
        <td className="muted">
          {c.lastLead ? relativeTime(c.lastLead) : '—'}
        </td>
        <td>{c.contentDone}/7</td>
      </tr>
      {expanded && (
        <tr className="expand-row">
          <td colSpan={7}>
            <div className="expand-grid">
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Recent Leads
                </div>
                {!detail ? (
                  <LoadingState lines={3} card={false} />
                ) : detail.leads.length === 0 ? (
                  <p className="muted" style={{ fontSize: 13 }}>
                    No leads.
                  </p>
                ) : (
                  detail.leads.map((l) => (
                    <div
                      key={l.id}
                      className="row spread"
                      style={{ padding: '5px 0' }}
                    >
                      <span style={{ fontSize: 13 }}>{l.name}</span>
                      <span className={`pill pill-${l.status}`}>{l.status}</span>
                    </div>
                  ))
                )}
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Today's Appointments
                </div>
                {!detail ? (
                  <LoadingState lines={3} card={false} />
                ) : detail.appts.length === 0 ? (
                  <p className="muted" style={{ fontSize: 13 }}>
                    None today.
                  </p>
                ) : (
                  detail.appts.map((a) => (
                    <div
                      key={a.id}
                      className="row spread"
                      style={{ padding: '5px 0' }}
                    >
                      <span style={{ fontSize: 13 }}>{a.client_name}</span>
                      <span className="muted" style={{ fontSize: 12 }}>
                        {formatTime(a.start_time)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
