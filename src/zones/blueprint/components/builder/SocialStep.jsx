import React, { useEffect } from 'react';
import { getToolRecommendations } from '../../lib/toolRecommendations.js';

const SOCIAL_GAPS = [
  'No consistent posting schedule',
  'No clear CTA in posts or bio',
  'Profile incomplete — missing key information',
  'No engagement strategy',
  "Content doesn't drive action",
  'Wrong platform for their audience',
  'No content connecting to their services',
];

const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'None / Not Applicable'];
const FREQUENCIES = ['Daily', '3-5x/week', '1-2x/week', 'Rarely', 'Never'];
const COMPLETENESS = ['Complete', 'Partial', 'Minimal', 'None'];

export default function SocialStep({ data, onChange, coiData }) {
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
    const recs = getToolRecommendations(gaps, 'social');
    if (recs.length > 0) {
      onChange({ ...data, tools: recs });
    }
  }, [JSON.stringify(data.gaps)]);

  const selectedGaps = data.gaps || [];

  return (
    <div>
      <div className="step-header">
        <div className="step-number">04</div>
        <h2 className="step-title">Social Media Findings</h2>
        <p className="step-desc">
          Their social presence — what exists, how it performs, and what's costing them.
        </p>
      </div>

      {/* Channel assessment */}
      <div className="assessment-grid">
        <div className="assessment-item">
          <div className="assessment-label">Primary Platform</div>
          <select
            value={data.primaryPlatform || ''}
            onChange={(e) => set('primaryPlatform', e.target.value)}
          >
            <option value="">Select…</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="assessment-item">
          <div className="assessment-label">Posting Frequency</div>
          <select
            value={data.postingFrequency || ''}
            onChange={(e) => set('postingFrequency', e.target.value)}
          >
            <option value="">Select…</option>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="assessment-item">
          <div className="assessment-label">Profile Completeness</div>
          <select
            value={data.profileCompleteness || ''}
            onChange={(e) => set('profileCompleteness', e.target.value)}
          >
            <option value="">Select…</option>
            {COMPLETENESS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="assessment-item">
          <div className="assessment-label">Follower Count (approx.)</div>
          <input
            type="number"
            min="0"
            value={data.followerCount || ''}
            onChange={(e) => set('followerCount', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label required">Observation</label>
        <textarea
          rows={5}
          value={data.observation || ''}
          onChange={(e) => set('observation', e.target.value)}
          placeholder="Their Instagram hasn't been posted to in 6 weeks. The last post has 3 likes. Bio links to a dead URL. No booking link. Competitor accounts in the same city have 4,000+ followers and post daily..."
        />
      </div>

      <div className="field-group">
        <label className="field-label required">Impact</label>
        <textarea
          rows={4}
          value={data.impact || ''}
          onChange={(e) => set('impact', e.target.value)}
          placeholder="Social silence signals a business that isn't active to prospects who check before calling. For a med spa in particular, Instagram is the primary discovery channel — absence here is absence from consideration..."
        />
      </div>

      <div className="field-group">
        <label className="field-label">Specific Gaps Found</label>
        <div className="checkbox-list">
          {SOCIAL_GAPS.map((gap) => (
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
          value={data.monthlyCost || coiData?.socialCost || ''}
          onChange={(e) => set('monthlyCost', e.target.value)}
          placeholder={coiData?.socialCost ? String(coiData.socialCost) : '0'}
        />
        <div className="field-helper">
          Pre-filled from Step 2 social / marketing leakage estimate.
        </div>
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
