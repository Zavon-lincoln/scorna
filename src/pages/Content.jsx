import { useState, useMemo } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react'
import { useContentSchedule, useBlogPosts } from '../hooks/useContent'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import {
  startOfWeek,
  addDays,
  toDateInput,
  formatDate,
  slugify,
  DAY_LABELS,
} from '../lib/utils'

const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok']
const CONTENT_TYPES = ['Post', 'Reel', 'Story', 'Carousel']
// Status cycle order on click.
const STATUS_CYCLE = ['draft', 'approved', 'scheduled', 'published']
const PAGE_SIZE = 10

const EMPTY_POST = {
  title: '',
  slug: '',
  status: 'draft',
  publish_date: '',
  excerpt: '',
  content: '',
  meta_title: '',
  meta_description: '',
}

/** Content page: weekly tracker + blog posts. Props: clientId. */
export default function Content({ clientId }) {
  const [weekCursor, setWeekCursor] = useState(startOfWeek(new Date()))
  const {
    items,
    loading: schedLoading,
    error: schedError,
    refetch: schedRefetch,
    upsertDay,
  } = useContentSchedule(clientId, weekCursor)
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    refetch: postsRefetch,
    createPost,
    updatePost,
    deletePost,
  } = useBlogPosts(clientId)
  const toast = useToast()

  // Weekly tracker modal
  const [dayModal, setDayModal] = useState(null) // { day, item }
  const [dayForm, setDayForm] = useState({})
  const [savingDay, setSavingDay] = useState(false)

  // Blog modal
  const [postModal, setPostModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [postForm, setPostForm] = useState(EMPTY_POST)
  const [postErr, setPostErr] = useState({})
  const [savingPost, setSavingPost] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Blog pagination + sort
  const [page, setPage] = useState(1)
  const [sortAsc, setSortAsc] = useState(false)

  const weekLabel = useMemo(() => {
    const we = addDays(weekCursor, 6)
    return `${weekCursor.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} – ${we.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`
  }, [weekCursor])

  const itemByDay = useMemo(() => {
    const map = {}
    items.forEach((i) => (map[i.day_of_week] = i))
    return map
  }, [items])

  const shiftWeek = (dir) => setWeekCursor((c) => addDays(c, dir * 7))

  // Cycle status with a single click on the day card.
  const cycleStatus = async (day, item) => {
    const current = item?.status || 'draft'
    const idx = STATUS_CYCLE.indexOf(current)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    try {
      await upsertDay(day, { status: next })
      toast.success(`${day} → ${next}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const openDayModal = (day) => {
    const item = itemByDay[day]
    setDayForm({
      platform: item?.platform || 'Instagram',
      content_type: item?.content_type || 'Post',
      caption: item?.caption || '',
      scheduled_time: item?.scheduled_time
        ? item.scheduled_time.slice(0, 16)
        : '',
      status: item?.status || 'draft',
    })
    setDayModal({ day, item })
  }

  const saveDay = async () => {
    setSavingDay(true)
    try {
      await upsertDay(dayModal.day, {
        platform: dayForm.platform || null,
        content_type: dayForm.content_type || null,
        caption: dayForm.caption || null,
        scheduled_time: dayForm.scheduled_time
          ? new Date(dayForm.scheduled_time).toISOString()
          : null,
        status: dayForm.status,
      })
      toast.success('Content saved')
      setDayModal(null)
    } catch {
      toast.error('Failed to save content')
    } finally {
      setSavingDay(false)
    }
  }

  // ── Blog posts ──────────────────────────────────────────────────
  const sortedPosts = useMemo(() => {
    const arr = [...posts]
    arr.sort((a, b) => {
      const da = a.publish_date ? new Date(a.publish_date) : 0
      const db = b.publish_date ? new Date(b.publish_date) : 0
      return sortAsc ? da - db : db - da
    })
    return arr
  }, [posts, sortAsc])

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE))
  const pagePosts = sortedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const setPostField = (k) => (v) => setPostForm((f) => ({ ...f, [k]: v }))
  const onTitleChange = (v) =>
    setPostForm((f) => ({
      ...f,
      title: v,
      slug: !f.slug || f.slug === slugify(f.title) ? slugify(v) : f.slug,
    }))

  const openAddPost = () => {
    setEditingPost(null)
    setPostForm(EMPTY_POST)
    setPostErr({})
    setPostModal(true)
  }
  const openEditPost = (p) => {
    setEditingPost(p)
    setPostForm({
      title: p.title || '',
      slug: p.slug || '',
      status: p.status || 'draft',
      publish_date: p.publish_date || '',
      excerpt: p.excerpt || '',
      content: p.content || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
    })
    setPostErr({})
    setPostModal(true)
  }

  const savePost = async () => {
    if (!postForm.title.trim()) {
      setPostErr({ title: 'Title is required' })
      return
    }
    setSavingPost(true)
    try {
      const payload = {
        title: postForm.title.trim(),
        slug: postForm.slug || slugify(postForm.title),
        status: postForm.status,
        publish_date: postForm.publish_date || null,
        excerpt: postForm.excerpt || null,
        content: postForm.content || null,
        meta_title: postForm.meta_title || null,
        meta_description: postForm.meta_description || null,
      }
      if (editingPost) {
        await updatePost(editingPost.id, payload)
        toast.success('Post updated')
      } else {
        await createPost(payload)
        toast.success('Post created')
      }
      setPostModal(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save post')
    } finally {
      setSavingPost(false)
    }
  }

  const handleDeletePost = async () => {
    try {
      await deletePost(confirmDelete.id)
      toast.success('Post deleted')
      setConfirmDelete(null)
    } catch {
      toast.error('Failed to delete post')
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1>Content</h1>
          <div className="sub">Weekly social tracker & blog posts</div>
        </div>
      </div>

      {/* Weekly tracker */}
      <div className="spread" style={{ marginBottom: 14 }}>
        <h3 className="section-title">Weekly Content</h3>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => shiftWeek(-1)} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <span className="cal-period" style={{ fontSize: 18, minWidth: 150 }}>
            {weekLabel}
          </span>
          <button className="icon-btn" onClick={() => shiftWeek(1)} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {schedLoading ? (
        <LoadingState lines={4} />
      ) : schedError ? (
        <ErrorState error={schedError} onRetry={schedRefetch} />
      ) : (
        <div className="content-week">
          {DAY_LABELS.map((day) => {
            const item = itemByDay[day]
            const status = item?.status || 'draft'
            return (
              <div
                key={day}
                className="glass day-card"
                onClick={() => openDayModal(day)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openDayModal(day)}
              >
                <div className="dc-day">{day}</div>
                <div className="dc-type">
                  {item?.content_type || (
                    <span className="muted" style={{ fontSize: 13 }}>
                      Empty
                    </span>
                  )}
                </div>
                {item?.platform && (
                  <div className="meta" style={{ fontSize: 11, marginBottom: 6 }}>
                    {item.platform}
                  </div>
                )}
                <button
                  className="dc-status"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    cycleStatus(day, item)
                  }}
                  title="Click to cycle status"
                >
                  <span className={`status-dot ${status}`} />
                  {status}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Blog posts */}
      <div className="spread" style={{ margin: '32px 0 14px' }}>
        <h3 className="section-title">Blog Posts</h3>
        <button className="btn btn-primary" onClick={openAddPost}>
          <Plus size={14} /> New Post
        </button>
      </div>

      {postsLoading ? (
        <LoadingState lines={5} />
      ) : postsError ? (
        <ErrorState error={postsError} onRetry={postsRefetch} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No blog posts yet"
          message="Draft your first post to build your content library."
          actionLabel="New Post"
          onAction={openAddPost}
        />
      ) : (
        <div className="glass card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th
                  className="sortable"
                  onClick={() => setSortAsc((s) => !s)}
                >
                  Publish Date {sortAsc ? '↑' : '↓'}
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagePosts.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>
                    <span className={`pill pill-${p.status}`}>{p.status}</span>
                  </td>
                  <td>{p.publish_date ? formatDate(p.publish_date) : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-btn"
                        onClick={() => openEditPost(p)}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => setConfirmDelete(p)}
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

          {totalPages > 1 && (
            <div className="pagination">
              <span className="pg-info">
                Page {page} of {totalPages}
              </span>
              <div className="pg-btns">
                <button
                  className="btn btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                <button
                  className="btn btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day content modal */}
      <Modal
        isOpen={!!dayModal}
        onClose={() => setDayModal(null)}
        title={dayModal ? `${dayModal.day} — Content` : ''}
        footer={
          <>
            <button className="btn" onClick={() => setDayModal(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={saveDay}
              disabled={savingDay}
            >
              {savingDay ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <FormField
            label="Platform"
            type="select"
            value={dayForm.platform}
            onChange={(v) => setDayForm((f) => ({ ...f, platform: v }))}
            options={PLATFORMS}
          />
          <FormField
            label="Content Type"
            type="select"
            value={dayForm.content_type}
            onChange={(v) => setDayForm((f) => ({ ...f, content_type: v }))}
            options={CONTENT_TYPES}
          />
          <FormField
            label="Status"
            type="select"
            value={dayForm.status}
            onChange={(v) => setDayForm((f) => ({ ...f, status: v }))}
            options={STATUS_CYCLE.map((s) => ({ value: s, label: s }))}
          />
          <FormField
            label="Scheduled Time"
            type="datetime-local"
            value={dayForm.scheduled_time}
            onChange={(v) => setDayForm((f) => ({ ...f, scheduled_time: v }))}
          />
          <div className="full">
            <FormField
              label="Caption"
              type="textarea"
              value={dayForm.caption}
              onChange={(v) => setDayForm((f) => ({ ...f, caption: v }))}
              placeholder="Post caption…"
            />
          </div>
        </div>
      </Modal>

      {/* Blog post modal */}
      <Modal
        isOpen={postModal}
        onClose={() => setPostModal(false)}
        title={editingPost ? 'Edit Post' : 'New Post'}
        size="lg"
        footer={
          <>
            <button className="btn" onClick={() => setPostModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={savePost}
              disabled={savingPost}
            >
              {savingPost ? 'Saving…' : editingPost ? 'Save Changes' : 'Create Post'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="full">
            <FormField
              label="Title"
              value={postForm.title}
              onChange={onTitleChange}
              placeholder="Post title"
              required
              error={postErr.title}
            />
          </div>
          <FormField
            label="Slug"
            value={postForm.slug}
            onChange={setPostField('slug')}
            placeholder="post-slug"
          />
          <FormField
            label="Status"
            type="select"
            value={postForm.status}
            onChange={setPostField('status')}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'published', label: 'Published' },
            ]}
          />
          <FormField
            label="Publish Date"
            type="date"
            value={postForm.publish_date}
            onChange={setPostField('publish_date')}
          />
          <div className="full">
            <FormField
              label="Excerpt"
              type="textarea"
              value={postForm.excerpt}
              onChange={setPostField('excerpt')}
              rows={2}
              placeholder="Short summary"
            />
          </div>
          <div className="full">
            <FormField
              label="Content"
              type="textarea"
              value={postForm.content}
              onChange={setPostField('content')}
              rows={8}
              placeholder="Write your post…"
            />
          </div>
          <FormField
            label="Meta Title"
            value={postForm.meta_title}
            onChange={setPostField('meta_title')}
            placeholder="SEO title"
          />
          <FormField
            label="Meta Description"
            value={postForm.meta_description}
            onChange={setPostField('meta_description')}
            placeholder="SEO description"
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeletePost}
        title="Delete post?"
        body={`"${confirmDelete?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
