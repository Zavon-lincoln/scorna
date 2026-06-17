import React, { useEffect } from 'react';
import { getToolRecommendations } from '../../lib/toolRecommendations.js';

const CRM_GAPS = [
  'No automated lead response — relying on manual follow-up',
  'Leads going cold with no systematic touchpoints',
  'No reactivation system for past clients',
  'Owner personally handling routine communications',
  'No pipeline visibility — no clear view of lead status',
  'No appointment reminders or confirmations automated',
  'No post-visit follow-up or review collection',
  'Staff communication done manually with no system',
];

const RESPONSE_TIMES = [
  'Immediate (<5 min)',
  'Within an hour',
  'Same day',
  'Next day',
  '2+ days',
  'No systematic response',
];

const FOLLOWUP_TOUCHPOINTS = ['None', '1', '2', '3', '4+'];

const REACTIVATION = [
  'None',
  'Manual / Ad hoc',
  'Partially automated',
  'Fully automated',
];

const CRM_TOOLS_USED = [
  'None',
  'Spreadsheet',
  'Generic CRM (HubSpot, Pipedrive…)',
  'Industry-specific software',
  'Other',
];

const CONCERNING_VALUES = [
  'Next day',
  '2+ days',
  'No systematic response',
  'None',
];

export default function CRMStep({ data, onChange, coiData }) {
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
    const recs = getToolRecommendations(gaps, 'crm');
    if (recs.length > 0) {
      onChange({ ...data, tools: recs });
    }
  }, [JSON.stringify(data.gaps)]);

  const selectedGaps = data.gaps || [];

  return (
    <div>
      <div className="step-header">
        <div className="step-number">06</div>
        <h2 className="step-title">CRM & Operations</h2>
        <p className="step-desc">
          The most important section. This is where the money actually leaks.
          Use what the owner said during discovery.
        </p>
      </div>

      {/* Current state */}
      <div className="calc-card">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Current State Assessment</div>

        <div className="field-row">
          <div className="assessment-item">
            <div className="assessment-label">Lead Response Time</div>
            <select
              value={data.responseTime || ''}
              onChange={(e) => set('responseTime', e.target.value)}
            >
              <option value="">Select…</option>
              {RESPONSE_TIMES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="assessment-item">
            <div className="assessment-label">Follow-Up Touchpoints After No Response</div>
            <select
              value={data.followupTouchpoints || ''}
              onChange={(e) => set('followupTouchpoints', e.target.value)}
            >
              <option value="">Select…</option>
              {FOLLOWUP_TOUCHPOINTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="assessment-item">
            <div className="assessment-label">Reactivation System for Past Clients</div>
            <select
              value={data.reactivationSystem || ''}
              onChange={(e) => set('reactivationSystem', e.target.value)}
            >
              <option value="">Select…</option>
              {REACTIVATION.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="assessment-item">
            <div className="assessment-label">CRM Tool Currently Used</div>
            <select
              value={data.crmTool || ''}
              onChange={(e) => set('crmTool', e.target.value)}
            >
              <option value="">Select…</option>
              {CRM_TOOLS_USED.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-group" style={{ marginTop: 16 }}>
          <label className="field-label">Owner Hours/Week on Manual Communication Tasks</label>
          <input
            type="number"
            min="0"
            value={data.ownerHours || ''}
            onChange={(e) => set('ownerHours', e.target.value)}
            placeholder="e.g. 8"
          />
          <div className="field-helper">Hours per week the owner spends on tasks that should be automated</div>
        </div>
      </div>

      {/* Discovery call quotes */}
      <div className="field-group">
        <label className="field-label">Key Quotes from Discovery Call</label>
        <textarea
          rows={4}
          value={data.discoveryQuotes || ''}
          onChange={(e) => set('discoveryQuotes', e.target.value)}
          placeholder={`"We usually get back to people within a day or two, but sometimes things slip through."\n\n"I personally respond to every enquiry — I haven't found anyone else I trust to do it."`}
        />
        <div className="field-helper">
          Paste exact words the owner used. These appear as pull quotes in the blueprint — the most powerful part of the document.
        </div>
      </div>

      <div className="field-group">
        <label className="field-label required">Observation</label>
        <textarea
          rows={5}
          value={data.observation || ''}
          onChange={(e) => set('observation', e.target.value)}
          placeholder="Leads arrive via the website contact form and Instagram DMs. The owner personally responds to each one, usually within a day or two. There is no CRM — follow-up is tracked in a notes app. No systematic reactivation of past clients. The owner estimates 8 hours per week on communication alone..."
        />
      </div>

      <div className="field-group">
        <label className="field-label required">Impact</label>
        <textarea
          rows={4}
          value={data.impact || ''}
          onChange={(e) => set('impact', e.target.value)}
          placeholder="Studies consistently show that 78% of deals go to the first responder. A 24-48 hour response time in a competitive market means a significant percentage of enquiries have already booked with a competitor. Without a follow-up sequence, each non-response is a permanent loss..."
        />
      </div>

      <div className="field-group">
        <label className="field-label">Specific Gaps Found</label>
        <div className="checkbox-list">
          {CRM_GAPS.map((gap) => (
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
          value={data.monthlyCost || coiData?.crmCost || ''}
          onChange={(e) => set('monthlyCost', e.target.value)}
          placeholder={coiData?.crmCost ? String(coiData.crmCost) : '0'}
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
