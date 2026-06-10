import { useState, useMemo } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  Ban,
} from 'lucide-react'
import { useAppointments } from '../hooks/useAppointments'
import { useTeam } from '../hooks/useTeam'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  startOfWeek,
  addDays,
  isSameDay,
  formatTime,
  formatDate,
  formatDuration,
  durationMinutes,
  toDateInput,
} from '../lib/utils'

const VIEWS = ['Month', 'Week', 'Day']
const DAY_START_HOUR = 7
const DAY_END_HOUR = 20 // 8pm
const SLOT_MINUTES = 30
const HOUR_PX = 96 // two 48px slots per hour

const EMPTY_FORM = {
  client_name: '',
  service: '',
  staff_member: '',
  date: '',
  start: '09:00',
  end: '10:00',
  status: 'confirmed',
  notes: '',
  recurring: false,
  frequency: 'Weekly',
  recurrence_end: '',
}

/** Full calendar / scheduling page. Props: clientId. */
export default function Schedule({ clientId }) {
  const {
    appointments,
    loading,
    error,
    refetch,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments(clientId)
  const { team } = useTeam(clientId)
  const toast = useToast()

  const [view, setView] = useState('Month')
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(null) // appointment detail
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErr, setFormErr] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const staffOptions = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...team.map((m) => ({ value: m.id, label: m.full_name })),
    ],
    [team]
  )

  // ── Navigation ─────────────────────────────────────────────────
  const shift = (dir) => {
    const d = new Date(cursor)
    if (view === 'Month') d.setMonth(d.getMonth() + dir)
    else if (view === 'Week') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCursor(d)
  }
  const goToday = () => setCursor(new Date())

  const periodLabel = useMemo(() => {
    if (view === 'Month')
      return cursor.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    if (view === 'Week') {
      const ws = startOfWeek(cursor)
      const we = addDays(ws, 6)
      return `${ws.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${we.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`
    }
    return cursor.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }, [view, cursor])

  // ── Form helpers ───────────────────────────────────────────────
  const openBook = ({ date, time } = {}) => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      date: date || toDateInput(cursor),
      start: time || '09:00',
      end: time ? addHour(time) : '10:00',
    })
    setFormErr({})
    setModalOpen(true)
  }

  const openEdit = (appt) => {
    setEditing(appt)
    const start = new Date(appt.appointment_time)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // default 1h (no end_time in DB)
    setForm({
      client_name: appt.client_name || '',
      service: appt.service || '',
      staff_member: appt.staff_member || '',
      date: toDateInput(start),
      start: hhmm(start),
      end: hhmm(end),
      status: appt.status || 'confirmed',
      notes: appt.notes || '',
      recurring: false,
      frequency: 'Weekly',
      recurrence_end: '',
    })
    setFormErr({})
    setSelected(null)
    setModalOpen(true)
  }

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    const errs = {}
    if (!form.client_name.trim()) errs.client_name = 'Client name is required'
    if (!form.date) errs.date = 'Date is required'
    if (!form.start) errs.start = 'Required'
    if (!form.end) errs.end = 'Required'
    if (form.start && form.end && form.end <= form.start)
      errs.end = 'End must be after start'
    if (form.recurring && !form.recurrence_end)
      errs.recurrence_end = 'Set an end date'
    if (Object.keys(errs).length) {
      setFormErr(errs)
      return
    }

    setSaving(true)
    try {
      const startISO = new Date(`${form.date}T${form.start}`).toISOString()
      const endISO = new Date(`${form.date}T${form.end}`).toISOString()
      const payload = {
        client_name: form.client_name.trim(),
        service: form.service || null,
        staff_member: form.staff_member || null,
        appointment_time: startISO,
        // end_time not in DB schema
        status: form.status,
        notes: form.notes || null,
      }

      if (editing) {
        await updateAppointment(editing.id, payload)
        toast.success('Appointment updated')
      } else {
        await createAppointment(
          payload,
          form.recurring
            ? { frequency: form.frequency, end: form.recurrence_end }
            : null
        )
        toast.success(
          form.recurring ? 'Recurring appointments booked' : 'Appointment booked'
        )
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save appointment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAppointment(selected.id)
      toast.success('Appointment deleted')
      setSelected(null)
      setConfirmDelete(false)
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleCancel = async () => {
    try {
      const updated = await updateAppointment(selected.id, {
        status: 'cancelled',
      })
      toast.success('Appointment cancelled')
      setSelected(updated)
      setConfirmCancel(false)
    } catch {
      toast.error('Failed to cancel')
    }
  }

  // Drag to reschedule (week/day): move appointment to a new slot.
  const reschedule = async (appt, newDate, newStartMinutes) => {
    const dur = 60
    const start = new Date(newDate)
    start.setHours(0, 0, 0, 0)
    start.setMinutes(newStartMinutes)
    const end = new Date(start.getTime() + dur * 60000)
    try {
      await updateAppointment(appt.id, {
        appointment_time: start.toISOString(),
        // end_time not in DB schema
      })
      toast.success('Appointment rescheduled')
    } catch {
      toast.error('Failed to reschedule')
    }
  }

  return (
    <div className="page-inner">
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight size={18} />
          </button>
          <button className="btn btn-sm" onClick={goToday}>
            Today
          </button>
          <span className="cal-period">{periodLabel}</span>
        </div>
        <div className="row gap-md">
          <div className="view-toggle">
            {VIEWS.map((v) => (
              <button
                key={v}
                className={view === v ? 'active' : ''}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => openBook()}>
            <Plus size={14} /> Book
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState lines={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : view === 'Month' ? (
        <MonthView
          cursor={cursor}
          appointments={appointments}
          onCellClick={(date) => openBook({ date: toDateInput(date) })}
          onApptClick={setSelected}
        />
      ) : (
        <TimeGridView
          view={view}
          cursor={cursor}
          appointments={appointments}
          onSlotClick={(date, time) =>
            openBook({ date: toDateInput(date), time })
          }
          onApptClick={setSelected}
          onReschedule={reschedule}
        />
      )}

      {/* Appointment detail */}
      {selected && (
        <ApptDetail
          appt={selected}
          onClose={() => setSelected(null)}
          onEdit={() => openEdit(selected)}
          onDelete={() => setConfirmDelete(true)}
          onCancel={() => setConfirmCancel(true)}
        />
      )}

      {/* Book / edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Appointment' : 'Book Appointment'}
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
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Book'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="full">
            <FormField
              label="Client Name"
              name="client_name"
              value={form.client_name}
              onChange={setField('client_name')}
              placeholder="Client name"
              required
              error={formErr.client_name}
            />
          </div>
          <FormField
            label="Service"
            name="service"
            value={form.service}
            onChange={setField('service')}
            placeholder="e.g. Facial"
          />
          <FormField
            label="Staff Member"
            name="staff_member"
            value={form.staff_member}
            onChange={setField('staff_member')}
            placeholder="Staff name"
          />
          <FormField
            label="Date"
            type="date"
            name="date"
            value={form.date}
            onChange={setField('date')}
            required
            error={formErr.date}
          />
          <FormField
            label="Status"
            type="select"
            name="status"
            value={form.status}
            onChange={setField('status')}
            options={[
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <FormField
            label="Start Time"
            type="time"
            name="start"
            value={form.start}
            onChange={setField('start')}
            required
            error={formErr.start}
          />
          <FormField
            label="End Time"
            type="time"
            name="end"
            value={form.end}
            onChange={setField('end')}
            required
            error={formErr.end}
          />
          <div className="full">
            <FormField
              label="Notes"
              type="textarea"
              name="notes"
              value={form.notes}
              onChange={setField('notes')}
              placeholder="Optional notes"
              rows={2}
            />
          </div>

          {!editing && (
            <>
              <div
                className="full row gap-sm"
                style={{ paddingTop: 4, cursor: 'pointer' }}
                onClick={() => setField('recurring')(!form.recurring)}
              >
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => setField('recurring')(e.target.checked)}
                />
                <span style={{ fontSize: 13 }}>Recurring appointment</span>
              </div>
              {form.recurring && (
                <>
                  <FormField
                    label="Frequency"
                    type="select"
                    name="frequency"
                    value={form.frequency}
                    onChange={setField('frequency')}
                    options={['Daily', 'Weekly', 'Monthly']}
                  />
                  <FormField
                    label="Repeat Until"
                    type="date"
                    name="recurrence_end"
                    value={form.recurrence_end}
                    onChange={setField('recurrence_end')}
                    error={formErr.recurrence_end}
                  />
                </>
              )}
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete appointment?"
        body="This will permanently remove the appointment."
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title="Cancel appointment?"
        body="The appointment will be marked cancelled and greyed out on the calendar."
        confirmLabel="Cancel Appointment"
      />
    </div>
  )
}

// ── Month view ────────────────────────────────────────────────────
function MonthView({ cursor, appointments, onCellClick, onApptClick }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const gridStart = startOfWeek(first)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const today = new Date()

  const apptsForDay = (day) =>
    appointments.filter((a) => isSameDay(a.appointment_time, day))

  return (
    <div className="month-grid">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
        <div key={d} className="month-dow">
          {d}
        </div>
      ))}
      {cells.map((day, i) => {
        const dayAppts = apptsForDay(day)
        const otherMonth = day.getMonth() !== cursor.getMonth()
        const isToday = isSameDay(day, today)
        return (
          <div
            key={i}
            className={`month-cell${otherMonth ? ' other-month' : ''}${
              isToday ? ' today' : ''
            }`}
            onClick={() => onCellClick(day)}
          >
            <span className="cell-date">{day.getDate()}</span>
            {dayAppts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className={`appt-chip${
                  a.status === 'cancelled' ? ' cancelled' : ''
                }`}
                style={{
                  background: `${a.team_members?.color || '#7B0D0D'}22`,
                  borderLeftColor: a.team_members?.color || '#7B0D0D',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onApptClick(a)
                }}
              >
                {formatTime(a.appointment_time)} {a.client_name}
              </div>
            ))}
            {dayAppts.length > 3 && (
              <span className="appt-more">+{dayAppts.length - 3} more</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Week / Day time grid ──────────────────────────────────────────
function TimeGridView({
  view,
  cursor,
  appointments,
  onSlotClick,
  onApptClick,
  onReschedule,
}) {
  const days =
    view === 'Week'
      ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))
      : [new Date(cursor)]

  const hours = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) hours.push(h)
  const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60
  const today = new Date()

  // Current-time indicator offset (only if today is visible & in range).
  const nowOffset = () => {
    const minutes =
      (today.getHours() - DAY_START_HOUR) * 60 + today.getMinutes()
    if (minutes < 0 || minutes > totalMinutes) return null
    return (minutes / 60) * HOUR_PX
  }

  const cols = days.length
  const gridStyle = {
    gridTemplateColumns: `60px repeat(${cols}, 1fr)`,
  }

  const apptsForDay = (day) =>
    appointments.filter((a) => isSameDay(a.appointment_time, day))

  const eventGeom = (a) => {
    const s = new Date(a.appointment_time)
    const startMin =
      (s.getHours() - DAY_START_HOUR) * 60 + s.getMinutes()
    const dur = 60
    const top = (startMin / 60) * HOUR_PX
    const height = Math.max(22, (dur / 60) * HOUR_PX - 3)
    return { top, height }
  }

  const handleSlotDrop = (e, day) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const appt = appointments.find((a) => a.id === id)
    if (!appt) return
    // Determine drop minute from cursor position within the column.
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    let minutes = Math.round((offsetY / HOUR_PX) * 60)
    minutes = Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES
    minutes = Math.max(0, Math.min(totalMinutes - SLOT_MINUTES, minutes))
    onReschedule(appt, day, DAY_START_HOUR * 60 + minutes)
  }

  return (
    <div className="time-grid-wrap">
      {/* Header row */}
      <div className="time-grid" style={gridStyle}>
        <div className="tg-corner" />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className={`tg-dow${isToday ? ' today' : ''}`}>
              <div className="dow-name">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="dow-num">{day.getDate()}</div>
            </div>
          )
        })}
      </div>

      {/* Body: time labels + columns */}
      <div
        className="time-grid"
        style={{ ...gridStyle, position: 'relative' }}
      >
        {/* Time label column */}
        <div>
          {hours.map((h) => (
            <div key={h} className="tg-time-label">
              {formatHour(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, di) => {
          const dayAppts = apptsForDay(day)
          const isTodayCol = isSameDay(day, today)
          const offset = isTodayCol ? nowOffset() : null
          return (
            <div
              key={di}
              className="tg-col"
              style={{ height: hours.length * HOUR_PX }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleSlotDrop(e, day)}
            >
              {/* Clickable slots */}
              {hours.map((h) => (
                <div
                  key={h}
                  className="tg-slot"
                  style={{ height: HOUR_PX, borderBottom: 'none' }}
                  onClick={() =>
                    onSlotClick(day, `${String(h).padStart(2, '0')}:00`)
                  }
                />
              ))}

              {/* Events */}
              {dayAppts.map((a) => {
                const { top, height } = eventGeom(a)
                return (
                  <div
                    key={a.id}
                    className={`tg-event${
                      a.status === 'cancelled' ? ' cancelled' : ''
                    }`}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData('text/plain', a.id)
                    }
                    style={{
                      top,
                      height,
                      background: `${a.team_members?.color || '#7B0D0D'}26`,
                      borderLeftColor: a.team_members?.color || '#7B0D0D',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onApptClick(a)
                    }}
                  >
                    <div className="te-title">{a.client_name}</div>
                    <div className="te-sub">
                      {formatTime(a.appointment_time)}
                      {a.service ? ` · ${a.service}` : ''}
                    </div>
                  </div>
                )
              })}

              {offset != null && (
                <div className="now-line" style={{ top: offset }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Appointment detail panel ──────────────────────────────────────
function ApptDetail({ appt, onClose, onEdit, onDelete, onCancel }) {
  const staff = appt.team_members
  const dur = 60
  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="detail-panel" role="dialog" aria-label="Appointment">
        <div className="panel-head">
          <div className="ph-top">
            <h2>{appt.client_name}</h2>
            <div className="ph-actions">
              <button className="icon-btn" onClick={onEdit} title="Edit">
                <Pencil size={16} />
              </button>
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
          <span
            className={`pill pill-${appt.status}`}
            style={{ marginTop: 10, display: 'inline-block' }}
          >
            {appt.status}
          </span>
        </div>

        <div className="panel-body">
          <div className="info-grid">
            <div className="info-item">
              <div className="k">Service</div>
              <div className="v">{appt.service || '—'}</div>
            </div>
            <div className="info-item">
              <div className="k">Staff</div>
              <div className="v">
                {staff ? (
                  <span className="row gap-sm">
                    <span
                      className="staff-dot"
                      style={{ background: staff.color }}
                    />
                    {staff.full_name}
                  </span>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div className="info-item">
              <div className="k">Date</div>
              <div className="v">{formatDate(appt.appointment_time)}</div>
            </div>
            <div className="info-item">
              <div className="k">Time</div>
              <div className="v">
                {formatTime(appt.appointment_time)}
              </div>
            </div>
            <div className="info-item">
              <div className="k">Duration</div>
              <div className="v">{formatDuration(dur)}</div>
            </div>
            {appt.is_recurring && (
              <div className="info-item">
                <div className="k">Recurrence</div>
                <div className="v">{appt.recurrence_rule}</div>
              </div>
            )}
          </div>

          {appt.notes && (
            <div className="info-item" style={{ marginTop: 14 }}>
              <div className="k">Notes</div>
              <div className="v" style={{ lineHeight: 1.6 }}>
                {appt.notes}
              </div>
            </div>
          )}
        </div>

        <div className="panel-foot row gap-sm">
          {appt.status !== 'cancelled' && (
            <button className="btn" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
              <Ban size={13} /> Cancel
            </button>
          )}
          <button
            className="btn btn-danger"
            onClick={onDelete}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Small time helpers ────────────────────────────────────────────
function hhmm(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}
function addHour(time) {
  const [h, m] = time.split(':').map(Number)
  const nh = Math.min(23, h + 1)
  return `${String(nh).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function formatHour(h) {
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12} ${period}`
}
