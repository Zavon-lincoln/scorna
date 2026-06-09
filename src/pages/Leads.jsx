import { useState, useMemo } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { useLeads } from '../hooks/useLeads'
import { useTeam } from '../hooks/useTeam'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'
import Avatar from '../components/shared/Avatar'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import LeadDetail from './LeadDetail'
import { formatCurrency, daysSince, formatDateShort } from '../lib/utils'

const COLUMNS = [
  { key: 'new', label: 'New Inquiry' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'closed', label: 'Closed Won' },
  { key: 'lost', label: 'Lost' },
]

const SOURCES = [
  'Google',
  'Meta',
  'Referral',
  'Instagram',
  'Facebook',
  'Walk-in',
  'Phone',
  'Other',
]

const EMPTY_FORM = {
  name: '',
  service: '',
  source: '',
  status: 'new',
  estimated_value: '',
  assigned_staff: '',
  notes: '',
}

/** Leads kanban board. Props: clientId, userId, openLeadId, onOpenLead. */
export default function Leads({ clientId, userId, openLeadId, onOpenLead }) {
  const {
    leads,
    loading,
    error,
    refetch,
    createLead,
    updateLead,
    changeStatus,
    deleteLead,
    setLeadStatusLocal,
  } = useLeads(clientId)
  const { team } = useTeam(clientId)
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErr, setFormErr] = useState({})
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterStaff, setFilterStaff] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const teamOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...team.map((m) => ({ value: m.id, label: m.full_name })),
    ],
    [team]
  )

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()))
        return false
      if (filterSource && l.source !== filterSource) return false
      if (filterStaff && l.assigned_staff !== filterStaff) return false
      if (filterStatus && l.status !== filterStatus) return false
      return true
    })
  }, [leads, search, filterSource, filterStaff, filterStatus])

  const byColumn = useMemo(() => {
    const map = {}
    COLUMNS.forEach((c) => (map[c.key] = []))
    filtered.forEach((l) => {
      if (map[l.status]) map[l.status].push(l)
    })
    return map
  }, [filtered])

  const openLead = openLeadId ? leads.find((l) => l.id === openLeadId) : null

  // ── Form helpers ───────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormErr({})
    setModalOpen(true)
  }
  const openEdit = (lead) => {
    setEditing(lead)
    setForm({
      name: lead.name || '',
      service: lead.service || '',
      source: lead.source || '',
      status: lead.status || 'new',
      estimated_value: lead.estimated_value ?? '',
      assigned_staff: lead.assigned_staff || '',
      notes: lead.notes || '',
    })
    setFormErr({})
    setModalOpen(true)
  }

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setFormErr({ name: 'Name is required' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        service: form.service || null,
        source: form.source || null,
        status: form.status,
        estimated_value: form.estimated_value
          ? Number(form.estimated_value)
          : null,
        assigned_staff: form.assigned_staff || null,
        notes: form.notes || null,
      }
      if (editing) {
        await updateLead(editing.id, payload)
        toast.success('Lead updated')
      } else {
        await createLead(payload, userId)
        toast.success('Lead created')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save lead')
    } finally {
      setSaving(false)
    }
  }

  // ── Drag & drop ────────────────────────────────────────────────
  const handleDrop = async (colKey) => {
    setDragOverCol(null)
    const id = dragId
    setDragId(null)
    if (!id) return
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.status === colKey) return

    const prevStatus = lead.status
    setLeadStatusLocal(id, colKey) // optimistic
    try {
      await changeStatus(lead, colKey, userId)
    } catch (err) {
      setLeadStatusLocal(id, prevStatus) // revert
      toast.error('Failed to move lead')
    }
  }

  const handleDelete = async (lead) => {
    try {
      await deleteLead(lead.id)
      onOpenLead(null)
      toast.success('Lead deleted')
    } catch (err) {
      toast.error('Failed to delete lead')
    }
  }

  const handleChangeStatus = async (lead, status) => {
    try {
      await changeStatus(lead, status, userId)
      toast.success('Status updated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <div className="sub">{leads.length} total · drag cards to update status</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search">
          <Search size={15} />
          <input
            className="field-input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {COLUMNS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="field-input"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="field-input"
          value={filterStaff}
          onChange={(e) => setFilterStaff(e.target.value)}
        >
          <option value="">All staff</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState lines={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          message="Add your first lead to start tracking opportunities through your pipeline."
          actionLabel="Add Lead"
          onAction={openAdd}
        />
      ) : (
        <div className="kanban">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className={`kanban-col${
                dragOverCol === col.key ? ' drag-over' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverCol(col.key)
              }}
              onDragLeave={(e) => {
                if (e.currentTarget === e.target) setDragOverCol(null)
              }}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="kanban-col-head">
                <span className="col-title">{col.label}</span>
                <span className="count">{byColumn[col.key].length}</span>
              </div>
              <div className="kanban-col-body">
                {byColumn[col.key].map((lead) => (
                  <div
                    key={lead.id}
                    className={`lead-card${dragId === lead.id ? ' dragging' : ''}`}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => {
                      setDragId(null)
                      setDragOverCol(null)
                    }}
                    onClick={() => onOpenLead(lead.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onOpenLead(lead.id)}
                  >
                    <div className="lc-top">
                      <div>
                        <div className="lc-name">{lead.name}</div>
                        {lead.service && (
                          <div className="lc-service">{lead.service}</div>
                        )}
                      </div>
                      {lead.estimated_value != null && (
                        <div className="lc-value">
                          {formatCurrency(lead.estimated_value)}
                        </div>
                      )}
                    </div>

                    {lead.next_action_date && (
                      <div className="lc-next">
                        Next: {formatDateShort(lead.next_action_date)}
                      </div>
                    )}

                    <div className="lc-foot">
                      <div className="row gap-sm">
                        {lead.source && (
                          <span className="lc-source">{lead.source}</span>
                        )}
                        <span className="lc-days">
                          {daysSince(lead.created_at)}
                        </span>
                      </div>
                      {lead.team_members && (
                        <Avatar
                          name={lead.team_members.full_name}
                          initials={lead.team_members.initials}
                          color={lead.team_members.color}
                          size={24}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {byColumn[col.key].length === 0 && (
                  <div
                    className="muted"
                    style={{ fontSize: 12, textAlign: 'center', padding: 16 }}
                  >
                    Drop here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      {openLead && (
        <LeadDetail
          lead={openLead}
          clientId={clientId}
          userId={userId}
          onClose={() => onOpenLead(null)}
          onEdit={(l) => {
            openEdit(l)
          }}
          onDelete={handleDelete}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Lead' : 'Add Lead'}
        footer={
          <>
            <button className="btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Lead'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="full">
            <FormField
              label="Name"
              name="name"
              value={form.name}
              onChange={setField('name')}
              placeholder="Jane Doe"
              required
              error={formErr.name}
            />
          </div>
          <FormField
            label="Service"
            name="service"
            value={form.service}
            onChange={setField('service')}
            placeholder="e.g. Botox consult"
          />
          <FormField
            label="Source"
            type="select"
            name="source"
            value={form.source}
            onChange={setField('source')}
            placeholder="Select source"
            options={SOURCES}
          />
          <FormField
            label="Status"
            type="select"
            name="status"
            value={form.status}
            onChange={setField('status')}
            options={COLUMNS.map((c) => ({ value: c.key, label: c.label }))}
          />
          <FormField
            label="Estimated Value"
            type="number"
            name="estimated_value"
            value={form.estimated_value}
            onChange={setField('estimated_value')}
            placeholder="0"
            min="0"
          />
          <div className="full">
            <FormField
              label="Assigned Staff"
              type="select"
              name="assigned_staff"
              value={form.assigned_staff}
              onChange={setField('assigned_staff')}
              options={teamOptions}
            />
          </div>
          <div className="full">
            <FormField
              label="Notes"
              type="textarea"
              name="notes"
              value={form.notes}
              onChange={setField('notes')}
              placeholder="Context, preferences, details…"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
