import React, { useEffect } from 'react';
import { getToolRecommendations } from '../../lib/toolRecommendations.js';

const MARKETING_GAPS = [
  'Google Business Profile incomplete',
  'Low review volume for their market',
  'Not responding to reviews',
  'GBP not linked to website',
  'No paid ad presence',
  'Competitors running ads, they are not',
  'Not appearing in local search for primary terms',
];

export default function MarketingStep({ data, onChange, coiData }) {
  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  function toggleGap(gap) {
    const current = data.gaps || [];
    const next = current.includes(gap)
      ? current.filter((g) => g !== gap)
      : [...current, gap];
    onChange({ ...data, gaps: next });
  }

  useEffect(() => {
    const gaps = data.gaps || [];
    const recs = getToolRecommendations(gaps, 'marketing');
    if (recs.length > 0) {
      onChange({ ...data, tools: recs });
    }
  }, [JSON.stringify(data.gaps)]);

  const selectedGaps = data.gaps || [];

  return (
    <div>
      <div className="step-header">
        <div className="step-number">05</div>
        <h2 className="step-title">Marketing Findings</h2>
        <p className="step-desc">
          Google Business Profile health, ad presence, and local search visibility.
        </p>
      </div>

      {/* GBP Status */}
      <div className="calc-card">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Google Business Profile</div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label">GBP Exists</label>
            <select
              value={data.gbpExists ?? ''}
              onChange={(e) => set('gbpExists', e.target.value)}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="field-group">
            <label className="field-label">Review Count</label>
            <input
              type="number"
              min="0"
              value={data.reviewCount || ''}
              onChange={(e) => set('reviewCount', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Profile Completeness</label>
          <div className="range-wrap">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={data.gbpCompleteness || 0}
              onChange={(e) => set('gbpCompleteness', e.target.value)}
            />
            <span className="range-value">{data.gbpCompleteness || 0}%</span>
          </div>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label">Average Rating</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={data.avgRating || ''}
              onChange={(e) => set('avgRating', e.target.value)}
              placeholder="e.g. 4.2"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Last Review Response</label>
            <input
              type="date"
              value={data.lastReviewResponse || ''}
              onChange={(e) => set('lastReviewResponse', e.target.value)}
            />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Last GBP Post</label>
          <input
            type="date"
            value={data.lastGbpPost || ''}
            onChange={(e) => set('lastGbpPost', e.target.value)}
          />
        </div>
      </div>

      {/* Ad presence */}
      <div className="calc-card">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Ad Presence</div>
        <div className="assessment-grid">
          <div className="assessment-item">
            <div className="assessment-label">Running Meta Ads</div>
            <select
              value={data.metaAds ?? ''}
              onChange={(e) => set('metaAds', e.target.value)}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="assessment-item">
            <div className="assessment-label">Running Google Ads</div>
            <select
              value={data.googleAds ?? ''}
              onChange={(e) => set('googleAds', e.target.value)}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="assessment-item">
            <div className="assessment-label">Visible in Local Search</div>
            <select
              value={data.localSearch ?? ''}
              onChange={(e) => set('localSearch', e.target.value)}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="partial">Partial</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label required">Observation</label>
        <textarea
          rows={5}
          value={data.observation || ''}
          onChange={(e) => set('observation', e.target.value)}
          placeholder="Their Google Business Profile sits at 34% complete — missing service descriptions, no photos posted in 11 months, 27 reviews with the last response 4 months ago. Three direct competitors appear ahead of them in the local pack for 'med spa [city]'..."
        />
      </div>

      <div className="field-group">
        <label className="field-label required">Impact</label>
        <textarea
          rows={4}
          value={data.impact || ''}
          onChange={(e) => set('impact', e.target.value)}
          placeholder="The local pack is zero-moment-of-truth for service businesses. Appearing third instead of first costs an estimated 60% of potential clicks. An incomplete GBP is a signal to Google that the business is inactive..."
        />
      </div>

      <div className="field-group">
        <label className="field-label">Specific Gaps Found</label>
        <div className="checkbox-list">
          {MARKETING_GAPS.map((gap) => (
            <label
              key={gap}
              className={`checkbox-item ${selectedGaps.includes(gap) ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedGaps.includes(gap)}
                onChange={() => toggleGap(gap)}
              />
              <span className="checkbox-item-label">{gap}</span>
            </label>
          ))}
          <label className={`checkbox-item ${selectedGaps.includes('Other') ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={selectedGaps.includes('Other')}
              onChange={() => toggleGap('Other')}
            />
            <span className="checkbox-item-label">Other</span>
          </label>
          {selectedGaps.includes('Other') && (
            <input
              type="text"
              value={data.otherGap || ''}
              onChange={(e) => set('otherGap', e.target.value)}
              placeholder="Describe the gap…"
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Monthly Cost</label>
        <input
          type="number"
          min="0"
          value={data.monthlyCost || coiData?.marketingCost || ''}
          onChange={(e) => set('monthlyCost', e.target.value)}
          placeholder={coiData?.marketingCost ? String(coiData.marketingCost) : '0'}
        />
      </div>

      {(data.tools || []).length > 0 && (
        <div className="field-group">
          <div className="label-ash" style={{ marginBottom: 12 }}>Recommended Solutions</div>
          <div className="tools-list">
            {(data.tools || []).map((t, i) => (
              <div key={i} className="tool-item">
                <div className="tool-badge">Tool</div>
                <div className="tool-info">
                  <div className="tool-name">{t.tool}</div>
                  <div className="tool-desc">{t.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
