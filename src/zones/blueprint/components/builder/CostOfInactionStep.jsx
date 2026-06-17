import React, { useEffect } from 'react';
import {
  calculateLeadGap,
  calculateCRMLeakageSuggestion,
  calculateOwnerTimeCost,
  calculateTotalLeakage,
  formatCurrency,
} from '../../lib/calculations.js';

export default function CostOfInactionStep({ data, onChange }) {
  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  const leadVolume = Number(data.leadVolume) || 0;
  const closeRate = Number(data.closeRate) || 0;
  const avgTransaction = Number(data.avgTransaction) || 0;

  const { currentRevenue, potentialRevenue, monthlyGap } = calculateLeadGap(
    leadVolume, closeRate, avgTransaction
  );

  const crmSuggestion = calculateCRMLeakageSuggestion(leadVolume, avgTransaction, closeRate);
  const ownerTimeCost = calculateOwnerTimeCost(
    Number(data.ownerHours) || 0,
    Number(data.ownerRate) || 0
  );

  const total = calculateTotalLeakage(
    data.websiteCost,
    data.socialCost,
    data.marketingCost,
    data.crmCost
  );

  // Auto-populate CRM leakage suggestion once
  useEffect(() => {
    if (!data.crmCost && crmSuggestion > 0) {
      onChange({ ...data, crmCost: crmSuggestion });
    }
  }, [crmSuggestion]);

  return (
    <div>
      <div className="step-header">
        <div className="step-number">02</div>
        <h2 className="step-title">Cost of Inaction</h2>
        <p className="step-desc">
          Calculate the real monthly revenue this business is leaving on the table.
          Every number here flows directly into the blueprint.
        </p>
      </div>

      {/* Lead Data */}
      <div className="calc-card">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Lead Data</div>
        <div className="field-row">
          <div className="field-group">
            <label className="field-label required">Monthly Lead Volume</label>
            <input
              type="number"
              min="0"
              value={data.leadVolume || ''}
              onChange={(e) => set('leadVolume', e.target.value)}
              placeholder="0"
            />
            <div className="field-helper">Total enquiries / leads per month</div>
          </div>
          <div className="field-group">
            <label className="field-label required">Average Transaction Value ($)</label>
            <input
              type="number"
              min="0"
              value={data.avgTransaction || ''}
              onChange={(e) => set('avgTransaction', e.target.value)}
              placeholder="0"
            />
            <div className="field-helper">Revenue per booking / sale</div>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label required">Current Close Rate</label>
          <div className="range-wrap">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={data.closeRate || 0}
              onChange={(e) => set('closeRate', e.target.value)}
            />
            <span className="range-value">{data.closeRate || 0}%</span>
          </div>
          <div className="field-helper">Industry benchmark: 40%</div>
        </div>

        <div className="field-group">
          <label className="field-label">Average Client Lifetime Visits</label>
          <input
            type="number"
            min="1"
            value={data.lifetimeVisits || ''}
            onChange={(e) => set('lifetimeVisits', e.target.value)}
            placeholder="e.g. 4"
          />
        </div>
      </div>

      {/* Live calculations */}
      {leadVolume > 0 && avgTransaction > 0 && (
        <div className="calc-card">
          <div className="eyebrow" style={{ marginBottom: 16 }}>Live Revenue Gap</div>
          <div className="calc-live">
            <div className="calc-row">
              <span className="calc-label">Monthly revenue (current close rate)</span>
              <span className="calc-value">{formatCurrency(currentRevenue)}</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">Potential revenue (40% industry benchmark)</span>
              <span className="calc-value">{formatCurrency(potentialRevenue)}</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">Monthly gap</span>
              <span className="calc-value highlight">{formatCurrency(monthlyGap)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Section leakage */}
      <div style={{ marginBottom: 8 }}>
        <div className="label-ash" style={{ marginBottom: 12 }}>Section Leakage Estimates ($/month)</div>
        <div className="leakage-grid">
          <div className="leakage-item">
            <div className="leakage-item-label"><span></span>Website</div>
            <input
              type="number"
              min="0"
              value={data.websiteCost || ''}
              onChange={(e) => set('websiteCost', e.target.value)}
              placeholder="0"
            />
            <div className="field-helper" style={{ marginTop: 6 }}>Leads lost to poor conversion</div>
          </div>
          <div className="leakage-item">
            <div className="leakage-item-label"><span></span>Social / Marketing</div>
            <input
              type="number"
              min="0"
              value={data.socialCost || ''}
              onChange={(e) => set('socialCost', e.target.value)}
              placeholder="0"
            />
            <div className="field-helper" style={{ marginTop: 6 }}>Missed visibility and reach</div>
          </div>
          <div className="leakage-item">
            <div className="leakage-item-label"><span></span>CRM / Follow-Up</div>
            <input
              type="number"
              min="0"
              value={data.crmCost || ''}
              onChange={(e) => set('crmCost', e.target.value)}
              placeholder="0"
            />
            <div className="field-helper" style={{ marginTop: 6 }}>
              Suggested: {formatCurrency(crmSuggestion)} (30% of unconverted leads)
            </div>
          </div>
          <div className="leakage-item">
            <div className="leakage-item-label"><span></span>Reactivation</div>
            <input
              type="number"
              min="0"
              value={data.reactivationCost || ''}
              onChange={(e) => set('reactivationCost', e.target.value)}
              placeholder="0"
            />
            <div className="field-helper" style={{ marginTop: 6 }}>Dormant client revenue gap</div>
          </div>
        </div>
      </div>

      {/* Total COI */}
      <div className="coi-total">
        <div className="coi-total-label">Estimated Monthly Cost of Inaction</div>
        <div className="coi-total-amount">{formatCurrency(total)}</div>
        <div className="coi-total-sub">per month in identified revenue leakage</div>
      </div>

      {/* Owner time cost */}
      <div className="calc-card">
        <div className="eyebrow" style={{ marginBottom: 16 }}>Owner Time Cost</div>
        <div className="field-row">
          <div className="field-group">
            <label className="field-label">Hours/Week on Tasks That Should Be Automated</label>
            <input
              type="number"
              min="0"
              value={data.ownerHours || ''}
              onChange={(e) => set('ownerHours', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Owner Effective Hourly Rate ($)</label>
            <input
              type="number"
              min="0"
              value={data.ownerRate || ''}
              onChange={(e) => set('ownerRate', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        {ownerTimeCost > 0 && (
          <div className="calc-row" style={{ paddingTop: 12 }}>
            <span className="calc-label">Monthly owner time cost</span>
            <span className="calc-value">{formatCurrency(ownerTimeCost)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
