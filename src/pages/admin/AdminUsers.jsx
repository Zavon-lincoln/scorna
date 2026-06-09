import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users as UsersIcon, Copy, Check } from 'lucide-react'
import { supabaseAdmin, hasServiceRole } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import FormField from '../../components/ui/FormField'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDate, generatePassword } from '../../lib/utils'

const EMPTY = { full_name: '', email: '', role: 'client', client_id: '' }

/**
 * Admin CRUD for user accounts.
 * Create/delete use supabase.auth.admin.* via the service-role client.
 * SECURITY: these calls expose the service role key in the browser. Migrate to
 * an Edge Function before production (see supabase/functions/admin-users).
 */
export default function AdminUsers() {
  const [users, setUsers] = useState([])
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

  // Generated-password reveal after creating a user.
  const [genPassword, setGenPassword] = useState(null)
  const [copied, setCopied] = useState(false)

  // Filters
  const [filterRole, setFilterRole] = useState('')
  const [filterClient, setFilterClient] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, clientsRes] = await Promise.all([
        supabaseAdmin
          .from('users')
          .select('*, clients(name)')
          .order('created_at', { ascending: false }),
        supabaseAdmin.from('clients').select('id, name').order('name'),
      ])
      if (usersRes.error) throw usersRes.error
      if (clientsRes.error) throw clientsRes.error
      setUsers(usersRes.data || [])
      setClients(clientsRes.data || [])
    } catch (err) {
      console.error('AdminUsers load:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const clientOptions = [
    { value: '', label: 'No client' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ]

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    setFormErr({})
    setGenPassword(null)
    setCopied(false)
    setModalOpen(true)
  }
  const openEdit = (u) => {
    setEditing(u)
    setForm({
      full_name: u.full_name || '',
      email: u.email || '',
      role: u.role || 'client',
      client_id: u.client_id || '',
    })
    setFormErr({})
    setGenPassword(null)
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!editing && !form.email.trim()) errs.email = 'Email is required'
    setFormErr(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editing) {
        // Edit: update users table only (email immutable here).
        const { error: err } = await supabaseAdmin
          .from('users')
          .update({
            full_name: form.full_name.trim(),
            role: form.role,
            client_id: form.role === 'admin' ? null : form.client_id || null,
          })
          .eq('id', editing.id)
        if (err) throw err
        toast.success('User updated')
        setModalOpen(false)
        load()
      } else {
        if (!hasServiceRole) {
          toast.error('Service role key required to create users')
          setSaving(false)
          return
        }
        // 1. Create the auth user with a generated password.
        const password = generatePassword(12)
        const { data: authData, error: authErr } =
          await supabaseAdmin.auth.admin.createUser({
            email: form.email.trim(),
            password,
            email_confirm: true,
          })
        if (authErr) throw authErr

        // 2. Insert the profile row.
        const { error: insErr } = await supabaseAdmin.from('users').insert({
          id: authData.user.id,
          email: form.email.trim(),
          full_name: form.full_name.trim(),
          role: form.role,
          client_id: form.role === 'admin' ? null : form.client_id || null,
        })
        if (insErr) throw insErr

        // 3. Reveal the temporary password.
        setGenPassword(password)
        toast.success('User created')
        load()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (hasServiceRole) {
        const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(
          confirmDelete.id
        )
        // Ignore "user not found" so we can still clean up the profile row.
        if (authErr && !/not found/i.test(authErr.message)) throw authErr
      }
      const { error: err } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', confirmDelete.id)
      if (err) throw err
      toast.success('User deleted')
      setConfirmDelete(null)
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    }
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(genPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed — select the password manually')
    }
  }

  const filtered = users.filter((u) => {
    if (filterRole && u.role !== filterRole) return false
    if (filterClient && u.client_id !== filterClient) return false
    return true
  })

  return (
    <>
      <div className="filter-bar">
        <select
          className="field-input"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="client">Client</option>
        </select>
        <select
          className="field-input"
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={openAdd}
        >
          <Plus size={14} /> Create User
        </button>
      </div>

      {loading ? (
        <LoadingState lines={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={load} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          message="Create user accounts for admins and clients."
          actionLabel="Create User"
          onAction={openAdd}
        />
      ) : (
        <div className="glass card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Client</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name || '—'}</td>
                  <td className="muted">{u.email || '—'}</td>
                  <td>
                    <span className={`pill pill-${u.role}`}>{u.role}</span>
                  </td>
                  <td className="muted">{u.clients?.name || '—'}</td>
                  <td className="muted">{formatDate(u.created_at)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        onClick={() => openEdit(u)}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setConfirmDelete(u)}
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
        title={editing ? 'Edit User' : 'Create User'}
        footer={
          genPassword ? (
            <button className="btn btn-primary" onClick={() => setModalOpen(false)}>
              Done
            </button>
          ) : (
            <>
              <button className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
              </button>
            </>
          )
        }
      >
        {genPassword ? (
          <div className="form-stack">
            <div
              className="row gap-sm"
              style={{ color: 'var(--status-green)', fontSize: 14 }}
            >
              <Check size={16} /> User created successfully
            </div>
            <div className="form-field">
              <label className="field-label">Temporary Password</label>
              <div className="copy-field">
                <input
                  className="field-input"
                  readOnly
                  value={genPassword}
                  onFocus={(e) => e.target.select()}
                />
                <button className="btn" onClick={copyPassword}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="field-help">
                Share this temporary password with the user. They should change
                it on first login.
              </div>
            </div>
          </div>
        ) : (
          <div className="form-stack">
            <FormField
              label="Full Name"
              value={form.full_name}
              onChange={setField('full_name')}
              placeholder="Jane Doe"
              required
              error={formErr.full_name}
            />
            <FormField
              label="Email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="user@business.com"
              required
              error={formErr.email}
              disabled={!!editing}
              helpText={editing ? 'Email cannot be changed' : undefined}
            />
            <FormField
              label="Role"
              type="select"
              value={form.role}
              onChange={setField('role')}
              options={[
                { value: 'client', label: 'Client' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <FormField
              label="Client"
              type="select"
              value={form.client_id}
              onChange={setField('client_id')}
              options={clientOptions}
              disabled={form.role === 'admin'}
              helpText={
                form.role === 'admin'
                  ? 'Admins are not tied to a client'
                  : undefined
              }
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        body={`${confirmDelete?.full_name || confirmDelete?.email} will lose access permanently. This deletes their auth account and profile.`}
        confirmLabel="Delete User"
      />
    </>
  )
}
