import React, { useEffect } from 'react';
import { formatCurrency } from '../../lib/calculations.js';
import { getToolRecommendations } from '../../lib/toolRecommendations.js';

const WEBSITE_GAPS = [
  'No booking or scheduling functionality',
  'No clear call-to-action above the fold',
  'Contact form with no automated follow-up',
  'Not mobile optimized',
  'No trust signals (reviews, credentials, testimonials)',
  'No lead capture mechanism',
  'Slow page load speed',
  'Not appearing in local search results',
  'No blog or content strategy',
];

export default function WebsiteStep({ data, onChange, coiData }) {
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

  // Auto-populate tool recommendations when gaps change
  useEffect(() => {
    const gaps = data.gaps || [];
    const recs = getToolRecommendations(gaps, 'website');
    if (recs.length > 0 && (!data.tools || data.tools.length === 0)) {
      onChange({ ...data, tools: recs });
    } else if (gaps.length > 0) {
      onChange({ ...data, tools: recs });
    }
  }, [JSON.stringify(data.gaps)]);

  const selectedGaps = data.gaps || [];

  return (
    <div>
      <div className="step-header">
        <div className="step-number">03</div>
        <h2 className="step-title">Website Findings</h2>
        <p className="step-desc">
          What you found. Reference the actual business — their domain, their broken nav, their missing booking button.
        </p>
      </div>

      <div className="field-group">
        <label className="field-label required">Observation</label>
        <textarea
          rows={5}
          value={data.observation || ''}
          onChange={(e) => set('observation', e.target.value)}
          placeholder="Their website has no booking functionality — visitors can only fill out a contact form with no automated follow-up. Mobile version has broken navigation on the services page. No trust signals above the fold — a competitor two blocks away shows 240 Google reviews on their homepage..."
        />
      </div>

      <div className="field-group">
        <label className="field-label required">Impact</label>
        <textarea
          rows={4}
          value={data.impact || ''}
          onChange={(e) => set('impact', e.target.value)}
          placeholder="Every visitor who can't book immediately is a warm lead that goes cold. Without mobile optimization, they're losing approximately 65-70% of their traffic before a single interaction..."
        />
      </div>

      <div className="field-group">
        <label className="field-label">Specific Gaps Found</label>
        <div className="checkbox-list">
          {WEBSITE_GAPS.map((gap) => (
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
          value={data.monthlyCost || coiData?.websiteCost || ''}
          onChange={(e) => set('monthlyCost', e.target.value)}
          placeholder={coiData?.websiteCost ? String(coiData.websiteCost) : '0'}
        />
        <div className="field-helper">
          Pre-filled from Step 2 leakage estimate. Edit if your observation changes the figure.
        </div>
      </div>

      {/* Tool recommendations */}
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
          <div className="field-helper" style={{ marginTop: 12 }}>
            Auto-populated from selected gaps. You can edit these in the Review step.
          </div>
        </div>
      )}
    </div>
  );
}
