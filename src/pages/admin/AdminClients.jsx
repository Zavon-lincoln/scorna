import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { supabaseAdmin } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import FormField from '../../components/ui/FormField'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../lib/utils'

const INDUSTRIES = ['Med Spa', 'Law Firm', 'Dental', 'Gym', 'HVAC', 'Other']
const EMPTY = { name: '', industry: '', owner_email: '' }

/** Admin CRUD for client records (service-role). */
export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [formErr, setFormErr] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: clientRows, error: err } = await supabaseAdmin
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err

      // Count users per client.
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('client_id')
      const counts = {}
      ;(users || []).forEach((u) => {
        if (u.client_id) counts[u.client_id] = (counts[u.client_id] || 0) + 1
      })

      setClients(
        (clientRows || []).map((c) => ({ ...c, userCount: counts[c.id] || 0 }))
      )
    } catch (err) {
      console.error('AdminClients load:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setFormErr({})
    setModalOpen(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setForm({
      name: c.name || '',
      industry: c.industry || '',
      owner_email: c.owner_email || '',
    })
    setFormErr({})
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setFormErr({ name: 'Name is required' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        industry: form.industry || null,
        owner_email: form.owner_email || null,
      }
      if (editing) {
        const { error: err } = await supabaseAdmin
          .from('clients')
          .update(payload)
          .eq('id', editing.id)
        if (err) throw err
        toast.success('Client updated')
      } else {
        const { error: err } = await supabaseAdmin
          .from('clients')
          .insert(payload)
        if (err) throw err
        toast.success('Client created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const { error: err } = await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', confirmDelete.id)
      if (err) throw err
      toast.success('Client deleted')
      setConfirmDelete(null)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete client')
    }
  }

  return (
    <>
      <div className="spread" style={{ marginBottom: 16 }}>
        <span className="muted">{clients.length} clients</span>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={14} /> Add Client
        </button>
      </div>

      {loading ? (
        <LoadingState lines={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          message="Create your first client to start onboarding."
          actionLabel="Add Client"
          onAction={openAdd}
        />
      ) : (
        <div className="glass card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Owner Email</th>
                <th>Created</th>
                <th>Users</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="muted">{c.industry || '—'}</td>
                  <td className="muted">{c.owner_email || '—'}</td>
                  <td className="muted">{formatDate(c.created_at)}</td>
                  <td>{c.userCount}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(c)}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setConfirmDelete(c)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Client' : 'Add Client'}
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
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Client'}
            </button>
          </>
        }
      >
        <div className="form-stack">
          <FormField
            label="Name"
            value={form.name}
            onChange={setField('name')}
            placeholder="Acme Med Spa"
            required
            error={formErr.name}
          />
          <FormField
            label="Industry"
            type="select"
            value={form.industry}
            onChange={setField('industry')}
            placeholder="Select industry"
            options={INDUSTRIES}
          />
          <FormField
            label="Owner Email"
            type="email"
            value={form.owner_email}
            onChange={setField('owner_email')}
            placeholder="owner@business.com"
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete client?"
        body={`Deleting "${confirmDelete?.name}" will permanently remove ALL associated data — leads, appointments, content, reviews, and more. This cannot be undone.`}
        confirmLabel="Delete Everything"
      />
    </>
  )
}
