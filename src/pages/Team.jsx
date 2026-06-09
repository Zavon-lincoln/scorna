import { useState } from 'react'
import { Plus, UserCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTeam } from '../hooks/useTeam'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'
import Avatar from '../components/shared/Avatar'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { getInitials, formatDate, formatTime } from '../lib/utils'

// Brand-adjacent preset colors for staff.
const COLORS = [
  '#7B0D0D',
  '#8B1A1A',
  '#B5954A',
  '#4A7C59',
  '#6B9BD2',
  '#7A5C9E',
  '#C26A3D',
  '#5A8A8A',
]

const EMPTY_FORM = {
  full_name: '',
  role: '',
  status: 'active',
  color: COLORS[0],
  initials: '',
}

/** Team management page. Props: clientId. */
export default function Team({ clientId }) {
  const { team, loading, error, refetch, createMember, updateMember, deleteMember } =
    useTeam(clientId)
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErr, setFormErr] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [upcoming, setUpcoming] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  // Auto-generate initials from name unless the user overrode them.
  const onNameChange = (v) => {
    setForm((f) => ({
      ...f,
      full_name: v,
      initials:
        !f.initials || f.initials === getInitials(f.full_name)
          ? getInitials(v)
          : f.initials,
    }))
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormErr({})
    setModalOpen(true)
  }

  const openMember = async (m) => {
    setEditing(m)
    setForm({
      full_name: m.full_name || '',
      role: m.role || '',
      status: m.status || 'active',
      color: m.color || COLORS[0],
      initials: m.initials || getInitials(m.full_name),
    })
    setFormErr({})
    setModalOpen(true)
    // Load this member's upcoming appointments.
    setUpcomingLoading(true)
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', m.id)
        .gte('start_time', new Date().toISOString())
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true })
        .limit(5)
      setUpcoming(data || [])
    } catch (err) {
      console.error('Upcoming appts:', err)
      setUpcoming([])
    } finally {
      setUpcomingLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.full_name.trim()) {
      setFormErr({ full_name: 'Name is required' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        role: form.role || null,
        status: form.status,
        color: form.color,
        initials: form.initials || getInitials(form.full_name),
      }
      if (editing) {
        await updateMember(editing.id, payload)
        toast.success('Team member updated')
      } else {
        await createMember(payload)
        toast.success('Team member added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMember(editing.id)
      toast.success('Team member removed')
      setConfirmDelete(false)
      setModalOpen(false)
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <div className="sub">{team.length} member{team.length === 1 ? '' : 's'}</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={14} /> Add Member
        </button>
      </div>

      {loading ? (
        <LoadingState lines={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : team.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No team members yet"
          message="Add staff so you can assign leads and appointments."
          actionLabel="Add Member"
          onAction={openAdd}
        />
      ) : (
        <div className="team-grid">
          {team.map((m) => (
            <div
              key={m.id}
              className="glass team-card"
              onClick={() => openMember(m)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openMember(m)}
            >
              <Avatar
                name={m.full_name}
                initials={m.initials}
                color={m.color}
                size={64}
              />
              <div className="tc-name">{m.full_name}</div>
              <div className="tc-role">{m.role || 'Team member'}</div>
              <span className={`pill pill-${m.status}`}>{m.status}</span>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Team Member' : 'Add Member'}
        footer={
          <>
            {editing && (
              <button
                className="btn btn-danger"
                onClick={() => setConfirmDelete(true)}
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
            <button className="btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Member'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="full">
            <FormField
              label="Full Name"
              name="full_name"
              value={form.full_name}
              onChange={onNameChange}
              placeholder="Jane Doe"
              required
              error={formErr.full_name}
            />
          </div>
          <FormField
            label="Role"
            name="role"
            value={form.role}
            onChange={setField('role')}
            placeholder="e.g. Esthetician"
          />
          <FormField
            label="Status"
            type="select"
            name="status"
            value={form.status}
            onChange={setField('status')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'off', label: 'Off' },
            ]}
          />
          <FormField
            label="Initials"
            name="initials"
            value={form.initials}
            onChange={setField('initials')}
            placeholder="JD"
          />
          <div className="form-field">
            <label className="field-label">Color</label>
            <div className="color-swatches">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${
                    form.color === c ? ' selected' : ''
                  }`}
                  style={{ background: c }}
                  onClick={() => setField('color')(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {editing && (
          <>
            <hr className="divider" style={{ margin: '20px 0 14px' }} />
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Upcoming Appointments
            </div>
            {upcomingLoading ? (
              <LoadingState lines={2} card={false} />
            ) : upcoming.length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>
                No upcoming appointments.
              </p>
            ) : (
              upcoming.map((a) => (
                <div key={a.id} className="timeline-row">
                  <span className="time" style={{ fontSize: 14 }}>
                    {formatDate(a.start_time)}
                  </span>
                  <div className="grow">
                    <div className="name">{a.client_name}</div>
                    <div className="meta">
                      {formatTime(a.start_time)}
                      {a.service ? ` · ${a.service}` : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Remove team member?"
        body={`${editing?.full_name} will be removed. Their lead/appointment assignments will be cleared.`}
        confirmLabel="Remove"
      />
    </div>
  )
}
