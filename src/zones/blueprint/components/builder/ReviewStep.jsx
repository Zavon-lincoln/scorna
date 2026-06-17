import React from 'react';
import { formatCurrency, calculateTotalLeakage } from '../../lib/calculations.js';

function ReviewSection({ title, data, cost, onEdit }) {
  return (
    <div className="review-section">
      <div className="review-section-header">
        <span className="review-section-title">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {cost > 0 && (
            <span className="review-section-cost">{formatCurrency(cost)}</span>
          )}
          <button className="review-edit-btn" onClick={onEdit}>
            Edit ↗
          </button>
        </div>
      </div>
      {data.observation && (
        <p className="review-finding">{data.observation}</p>
      )}
      {data.gaps && data.gaps.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.gaps.map((g) => (
            <span
              key={g}
              style={{
                fontSize: 11,
                color: 'var(--ash)',
                background: 'rgba(240,237,230,0.04)',
                border: '1px solid rgba(240,237,230,0.08)',
                borderRadius: 4,
                padding: '3px 8px',
              }}
            >
              {g}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewStep({ blueprintData, onGoToStep }) {
  const { clientInfo, costOfInaction, websiteFindings, socialFindings, marketingFindings, crmFindings } = blueprintData;

  const totalLeakage = calculateTotalLeakage(
    websiteFindings.monthlyCost || costOfInaction.websiteCost,
    socialFindings.monthlyCost || costOfInaction.socialCost,
    marketingFindings.monthlyCost || costOfInaction.marketingCost,
    crmFindings.monthlyCost || costOfInaction.crmCost
  );

  return (
    <div>
      <div className="step-header">
        <div className="step-number">07</div>
        <h2 className="step-title">Review</h2>
        <p className="step-desc">
          Everything looks right here? Click Generate Blueprint to build the document.
        </p>
      </div>

      {/* Client summary */}
      <div className="review-section">
        <div className="review-section-header">
          <span className="review-section-title">
            {clientInfo.businessName || 'Business Name'}
          </span>
          <button className="review-edit-btn" onClick={() => onGoToStep(0)}>
            Edit ↗
          </button>
        </div>
        <p className="review-finding">
          {clientInfo.industry && `${clientInfo.industry} · `}
          {clientInfo.ownerName && `Owner: ${clientInfo.ownerName} · `}
          Audit date: {clientInfo.auditDate || '—'}
        </p>
      </div>

      {/* COI */}
      <div className="coi-total" style={{ margin: '20px 0' }}>
        <div className="coi-total-label">Total Estimated Monthly Cost of Inaction</div>
        <div className="coi-total-amount">{formatCurrency(totalLeakage)}</div>
        <div className="coi-total-sub">across all four audit areas</div>
      </div>

      {/* Section reviews */}
      <ReviewSection
        title="Website"
        data={websiteFindings}
        cost={Number(websiteFindings.monthlyCost) || Number(costOfInaction.websiteCost) || 0}
        onEdit={() => onGoToStep(2)}
      />
      <ReviewSection
        title="Social Media"
        data={socialFindings}
        cost={Number(socialFindings.monthlyCost) || Number(costOfInaction.socialCost) || 0}
        onEdit={() => onGoToStep(3)}
      />
      <ReviewSection
        title="Marketing"
        data={marketingFindings}
        cost={Number(marketingFindings.monthlyCost) || Number(costOfInaction.marketingCost) || 0}
        onEdit={() => onGoToStep(4)}
      />
      <ReviewSection
        title="CRM & Operations"
        data={crmFindings}
        cost={Number(crmFindings.monthlyCost) || Number(costOfInaction.crmCost) || 0}
        onEdit={() => onGoToStep(5)}
      />

      <div style={{ marginTop: 32, padding: '20px 0', borderTop: '1px solid rgba(240,237,230,0.06)', fontSize: 13, color: 'var(--ash)' }}>
        Everything above will appear in the generated blueprint. Click <strong style={{ color: 'var(--bone)' }}>Generate Blueprint</strong> when you're ready.
      </div>
    </div>
  );
}
