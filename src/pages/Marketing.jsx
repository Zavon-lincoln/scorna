import { useState, useEffect } from 'react'
import { Plus, Star, Check, MessageSquare } from 'lucide-react'
import { useAdMetrics, useReviews } from '../hooks/useMarketing'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  todayStr,
} from '../lib/utils'

const PLATFORMS = ['Meta', 'Google']
const GBP_ITEMS = [
  'Profile complete',
  'Categories set',
  'Services listed',
  'Photos uploaded',
  'Hours set',
  'Description written',
  'Website linked',
  'Review responses active',
]

/** Marketing page: ads, reviews, GBP checklist. Props: clientId. */
export default function Marketing({ clientId }) {
  const {
    loading: adsLoading,
    error: adsError,
    refetch: adsRefetch,
    addMetric,
    latestFor,
  } = useAdMetrics(clientId)
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: reviewsRefetch,
    addReview,
    toggleResponded,
    avgRating,
  } = useReviews(clientId)
  const toast = useToast()

  const [metricModal, setMetricModal] = useState(null) // platform
  const [metricForm, setMetricForm] = useState(null)
  const [savingMetric, setSavingMetric] = useState(false)

  const [reviewModal, setReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    reviewer_name: '',
    rating: 5,
    platform: 'Google',
    review_date: todayStr(),
    review_text: '',
  })
  const [reviewErr, setReviewErr] = useState({})
  const [savingReview, setSavingReview] = useState(false)

  // GBP checklist persisted to localStorage per client.
  const gbpKey = `scorna-gbp-${clientId}`
  const [gbp, setGbp] = useState({})
  useEffect(() => {
    try {
      const raw = localStorage.getItem(gbpKey)
      setGbp(raw ? JSON.parse(raw) : {})
    } catch {
      setGbp({})
    }
  }, [gbpKey])

  const toggleGbp = (item) => {
    setGbp((prev) => {
      const next = { ...prev, [item]: !prev[item] }
      localStorage.setItem(gbpKey, JSON.stringify(next))
      return next
    })
  }

  const openMetric = (platform) => {
    setMetricModal(platform)
    setMetricForm({
      recorded_date: todayStr(),
      impressions: '',
      clicks: '',
      spend: '',
      conversions: '',
    })
  }

  const saveMetric = async () => {
    setSavingMetric(true)
    try {
      await addMetric({
        platform: metricModal,
        recorded_date: metricForm.recorded_date,
        impressions: Number(metricForm.impressions) || 0,
        clicks: Number(metricForm.clicks) || 0,
        spend: Number(metricForm.spend) || 0,
        conversions: Number(metricForm.conversions) || 0,
      })
      toast.success(`${metricModal} metrics added`)
      setMetricModal(null)
    } catch (err) {
      toast.error(err.message || 'Failed to add metrics')
    } finally {
      setSavingMetric(false)
    }
  }

  const saveReview = async () => {
    if (!reviewForm.reviewer_name.trim()) {
      setReviewErr({ reviewer_name: 'Name is required' })
      return
    }
    setSavingReview(true)
    try {
      await addReview({
        reviewer_name: reviewForm.reviewer_name.trim(),
        rating: reviewForm.rating,
        platform: reviewForm.platform,
        review_date: reviewForm.review_date || null,
        review_text: reviewForm.review_text || null,
        responded: false,
      })
      toast.success('Review added')
      setReviewModal(false)
      setReviewForm({
        reviewer_name: '',
        rating: 5,
        platform: 'Google',
        review_date: todayStr(),
        review_text: '',
      })
    } catch (err) {
      toast.error(err.message || 'Failed to add review')
    } finally {
      setSavingReview(false)
    }
  }

  const handleResponded = async (review) => {
    try {
      await toggleResponded(review.id, !review.responded)
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1>Marketing</h1>
          <div className="sub">Ad performance, reviews & local SEO</div>
        </div>
      </div>

      {/* Ad performance */}
      <h3 className="section-title" style={{ marginBottom: 14 }}>
        Ad Performance
      </h3>
      {adsLoading ? (
        <LoadingState lines={4} />
      ) : adsError ? (
        <ErrorState error={adsError} onRetry={adsRefetch} />
      ) : (
        <div className="two-col" style={{ marginBottom: 32 }}>
          {PLATFORMS.map((platform) => {
            const m = latestFor(platform)
            const ctr = m && m.impressions ? (m.clicks / m.impressions) * 100 : 0
            const cpc = m && m.clicks ? m.spend / m.clicks : 0
            return (
              <div key={platform} className="glass card">
                <div className="card-head">
                  <h3>{platform} Ads</h3>
                  <button
                    className="btn btn-sm"
                    onClick={() => openMetric(platform)}
                  >
                    <Plus size={12} /> Add Metrics
                  </button>
                </div>
                {!m ? (
                  <EmptyState
                    card={false}
                    icon={Star}
                    title="No data yet"
                    message={`Add ${platform} metrics to track performance.`}
                  />
                ) : (
                  <>
                    <div className="meta" style={{ marginBottom: 10 }}>
                      As of {formatDate(m.recorded_date)}
                    </div>
                    <div className="metric-grid">
                      <Metric label="Impressions" value={formatNumber(m.impressions)} />
                      <Metric label="Clicks" value={formatNumber(m.clicks)} />
                      <Metric label="CTR" value={formatPercent(ctr)} />
                      <Metric label="Spend" value={formatCurrency(m.spend)} />
                      <Metric label="Conversions" value={formatNumber(m.conversions)} />
                      <Metric label="CPC" value={formatCurrency(cpc)} />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reviews */}
      <div className="spread" style={{ marginBottom: 14 }}>
        <h3 className="section-title">Reviews</h3>
        <button className="btn btn-primary" onClick={() => setReviewModal(true)}>
          <Plus size={14} /> Add Review
        </button>
      </div>

      {reviewsLoading ? (
        <LoadingState lines={5} />
      ) : reviewsError ? (
        <ErrorState error={reviewsError} onRetry={reviewsRefetch} />
      ) : (
        <div className="glass card" style={{ marginBottom: 32 }}>
          {reviews.length === 0 ? (
            <EmptyState
              card={false}
              icon={Star}
              title="No reviews yet"
              message="Add reviews to track your reputation."
            />
          ) : (
            <>
              <div className="review-summary">
                <span className="big-rating">{avgRating.toFixed(1)}</span>
                <span className="stars">
                  <Stars value={Math.round(avgRating)} />
                </span>
                <span className="muted">
                  {reviews.length} review{reviews.length === 1 ? '' : 's'}
                </span>
              </div>
              {reviews.map((r) => (
                <div key={r.id} className="review-row">
                  <div className="rr-top">
                    <div className="row gap-sm">
                      <span className="rr-name">{r.reviewer_name || 'Anonymous'}</span>
                      <span className="stars">
                        <Stars value={r.rating} />
                      </span>
                      <span className="pill pill-draft">{r.platform}</span>
                    </div>
                    <button
                      className={`btn btn-sm${r.responded ? ' btn-primary' : ''}`}
                      onClick={() => handleResponded(r)}
                    >
                      {r.responded ? (
                        <>
                          <Check size={12} /> Responded
                        </>
                      ) : (
                        <>
                          <MessageSquare size={12} /> Mark Responded
                        </>
                      )}
                    </button>
                  </div>
                  {r.review_text && <div className="rr-text">{r.review_text}</div>}
                  {r.review_date && (
                    <div className="meta" style={{ marginTop: 4 }}>
                      {formatDate(r.review_date)}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* GBP checklist */}
      <h3 className="section-title" style={{ marginBottom: 14 }}>
        Google Business Profile
      </h3>
      <div className="glass card">
        <div className="checklist">
          {GBP_ITEMS.map((item) => {
            const checked = !!gbp[item]
            return (
              <div
                key={item}
                className={`checklist-item${checked ? ' checked' : ''}`}
                onClick={() => toggleGbp(item)}
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleGbp(item)}
              >
                <span className="check-box">{checked && <Check size={14} />}</span>
                <span className="ci-label">{item}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add metrics modal */}
      <Modal
        isOpen={!!metricModal}
        onClose={() => setMetricModal(null)}
        title={metricModal ? `${metricModal} Metrics` : ''}
        footer={
          <>
            <button className="btn" onClick={() => setMetricModal(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={saveMetric}
              disabled={savingMetric}
            >
              {savingMetric ? 'Saving…' : 'Add Metrics'}
            </button>
          </>
        }
      >
        {metricForm && (
          <div className="form-grid">
            <div className="full">
              <FormField
                label="Date"
                type="date"
                value={metricForm.recorded_date}
                onChange={(v) =>
                  setMetricForm((f) => ({ ...f, recorded_date: v }))
                }
              />
            </div>
            <FormField
              label="Impressions"
              type="number"
              value={metricForm.impressions}
              onChange={(v) => setMetricForm((f) => ({ ...f, impressions: v }))}
              min="0"
            />
            <FormField
              label="Clicks"
              type="number"
              value={metricForm.clicks}
              onChange={(v) => setMetricForm((f) => ({ ...f, clicks: v }))}
              min="0"
            />
            <FormField
              label="Spend ($)"
              type="number"
              value={metricForm.spend}
              onChange={(v) => setMetricForm((f) => ({ ...f, spend: v }))}
              min="0"
            />
            <FormField
              label="Conversions"
              type="number"
              value={metricForm.conversions}
              onChange={(v) => setMetricForm((f) => ({ ...f, conversions: v }))}
              min="0"
            />
          </div>
        )}
      </Modal>

      {/* Add review modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        title="Add Review"
        footer={
          <>
            <button className="btn" onClick={() => setReviewModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={saveReview}
              disabled={savingReview}
            >
              {savingReview ? 'Saving…' : 'Add Review'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="full">
            <FormField
              label="Reviewer Name"
              value={reviewForm.reviewer_name}
              onChange={(v) =>
                setReviewForm((f) => ({ ...f, reviewer_name: v }))
              }
              placeholder="Reviewer name"
              required
              error={reviewErr.reviewer_name}
            />
          </div>
          <div className="form-field">
            <label className="field-label">Rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n <= reviewForm.rating ? 'on' : ''}
                  onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                >
                  <Star
                    size={22}
                    fill={n <= reviewForm.rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>
          <FormField
            label="Platform"
            type="select"
            value={reviewForm.platform}
            onChange={(v) => setReviewForm((f) => ({ ...f, platform: v }))}
            options={['Google', 'Facebook', 'Yelp', 'Other']}
          />
          <FormField
            label="Date"
            type="date"
            value={reviewForm.review_date}
            onChange={(v) => setReviewForm((f) => ({ ...f, review_date: v }))}
          />
          <div className="full">
            <FormField
              label="Review Text"
              type="textarea"
              value={reviewForm.review_text}
              onChange={(v) => setReviewForm((f) => ({ ...f, review_text: v }))}
              placeholder="What did they say?"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="metric-box">
      <div className="m-label">{label}</div>
      <div className="m-value">{value}</div>
    </div>
  )
}

function Stars({ value }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? '' : 'empty'}>
          ★
        </span>
      ))}
    </>
  )
}
