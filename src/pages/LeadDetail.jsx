import { useState } from 'react'
import {
  X,
  Pencil,
  Trash2,
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Send,
} from 'lucide-react'
import { useLeadActivity } from '../hooks/useLeads'
import Avatar from '../components/shared/Avatar'
import LoadingState from '../components/ui/LoadingState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatCurrency, formatDate, relativeTime } from '../lib/utils'

const STATUSES = ['new', 'contacted', 'qualified', 'closed', 'lost']
const STATUS_LABELS = {
  new: 'New Inquiry',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed Won',
  lost: 'Lost',
}

const ACTIVITY_ICONS = {
  status_change: ArrowRight,
  note: MessageSquare,
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  appointment: Calendar,
}

/**
 * Slide-in lead detail panel.
 * Props: lead, clientId, userId, onClose, onEdit, onDelete, onChangeStatus.
 */
export default function LeadDetail({
  lead,
  clientId,
  userId,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}) {
  const { activity, loading, addNote } = useLeadActivity(lead.id, clientId)
  const [statusOpen, setStatusOpen] = useState(false)
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const staff = lead.team_members

  const handleAddNote = async () => {
    if (!note.trim()) return
    setSavingNote(true)
    try {
      await addNote(note.trim(), userId)
      setNote('')
    } catch {
      /* surfaced by caller's toast layer if needed */
    } finally {
      setSavingNote(false)
    }
  }

  const handleStatus = async (status) => {
    setStatusOpen(false)
    if (status === lead.status) return
    await onChangeStatus(lead, status)
  }

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside
        className="detail-panel"
        role="dialog"
        aria-label={`Lead: ${lead.name}`}
      >
        <div className="panel-head">
          <div className="ph-top">
            <h2>{lead.name}</h2>
            <div className="ph-actions">
              <button
                className="icon-btn"
                onClick={() => onEdit(lead)}
                aria-label="Edit lead"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete lead"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={onClose}
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="status-select-wrap" style={{ marginTop: 12 }}>
            <button
              className={`pill pill-${lead.status}`}
              style={{ cursor: 'pointer', display: 'inline-flex', gap: 5 }}
              onClick={() => setStatusOpen((o) => !o)}
            >
              {STATUS_LABELS[lead.status]} <ChevronDown size={11} />
            </button>
            {statusOpen && (
              <div className="status-menu">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => handleStatus(s)}>
                    <span className={`pill pill-${s}`}>{STATUS_LABELS[s]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel-body">
          {/* Info */}
          <div className="info-grid">
            <div className="info-item">
              <div className="k">Service</div>
              <div className="v">{lead.service || '—'}</div>
            </div>
            <div className="info-item">
              <div className="k">Source</div>
              <div className="v">{lead.source || '—'}</div>
            </div>
            <div className="info-item">
              <div className="k">Estimated Value</div>
              <div className="v">{formatCurrency(lead.estimated_value)}</div>
            </div>
            <div className="info-item">
              <div className="k">Assigned Staff</div>
              <div className="v">
                {staff ? (
                  <span className="row gap-sm">
                    <Avatar
                      name={staff.full_name}
                      initials={staff.initials}
                      color={staff.color}
                      size={22}
                    />
                    {staff.full_name}
                  </span>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div className="info-item">
              <div className="k">Next Action</div>
              <div className="v">{lead.next_action || '—'}</div>
            </div>
            <div className="info-item">
              <div className="k">Next Action Date</div>
              <div className="v">
                {lead.next_action_date
                  ? formatDate(lead.next_action_date)
                  : '—'}
              </div>
            </div>
          </div>

          {lead.notes && (
            <div className="info-item" style={{ marginTop: 14 }}>
              <div className="k">Notes</div>
              <div className="v" style={{ lineHeight: 1.6 }}>
                {lead.notes}
              </div>
            </div>
          )}

          <hr className="divider" style={{ margin: '20px 0 14px' }} />

          {/* Activity timeline */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Activity
          </div>
          {loading ? (
            <LoadingState lines={4} card={false} />
          ) : activity.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              No activity yet.
            </p>
          ) : (
            <div className="activity-list">
              {activity.map((a) => {
                const Icon = ACTIVITY_ICONS[a.type] || MessageSquare
                return (
                  <div key={a.id} className="activity-item">
                    <div className="activity-icon">
                      <Icon size={14} />
                    </div>
                    <div className="activity-body">
                      {a.type === 'status_change' && a.from_status ? (
                        <div className="a-status">
                          <span className={`pill pill-${a.from_status}`}>
                            {a.from_status}
                          </span>
                          <ArrowRight size={12} className="muted" />
                          <span className={`pill pill-${a.to_status}`}>
                            {a.to_status}
                          </span>
                        </div>
                      ) : (
                        <div className="a-content">{a.content}</div>
                      )}
                      <div className="a-time">{relativeTime(a.created_at)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add note */}
        <div className="panel-foot">
          <textarea
            className="field-input"
            rows={2}
            placeholder="Add a note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAddNote}
            disabled={!note.trim() || savingNote}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Send size={13} /> {savingNote ? 'Adding…' : 'Add Note'}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await onDelete(lead)
          setConfirmDelete(false)
        }}
        title="Delete lead?"
        body={`This will permanently delete ${lead.name} and all related activity. This cannot be undone.`}
        confirmLabel="Delete Lead"
      />
    </>
  )
}
