import React from 'react';
import { formatCurrency, calculateTotalLeakage } from '../../lib/calculations.js';

export default function CoverPage({ blueprintData }) {
  const { clientInfo, costOfInaction, websiteFindings, socialFindings, marketingFindings, crmFindings } = blueprintData;

  const websiteCost = Number(websiteFindings.monthlyCost) || Number(costOfInaction.websiteCost) || 0;
  const socialCost = Number(socialFindings.monthlyCost) || Number(costOfInaction.socialCost) || 0;
  const marketingCost = Number(marketingFindings.monthlyCost) || Number(costOfInaction.marketingCost) || 0;
  const crmCost = Number(crmFindings.monthlyCost) || Number(costOfInaction.crmCost) || 0;
  const total = calculateTotalLeakage(websiteCost, socialCost, marketingCost, crmCost);

  const auditDate = clientInfo.auditDate
    ? new Date(clientInfo.auditDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  function getWebsiteSummary() {
    if (websiteFindings.gaps && websiteFindings.gaps.length > 0) {
      return websiteFindings.gaps.slice(0, 2).map(g => g.split('—')[0].trim()).join(', ');
    }
    return 'Conversion gaps identified';
  }

  function getSocialSummary() {
    if (socialFindings.gaps && socialFindings.gaps.length > 0) {
      return socialFindings.gaps.slice(0, 2).map(g => g.split('—')[0].trim()).join(', ');
    }
    return 'Visibility gaps identified';
  }

  function getMarketingSummary() {
    if (marketingFindings.gaps && marketingFindings.gaps.length > 0) {
      return marketingFindings.gaps.slice(0, 2).map(g => g.split('—')[0].trim()).join(', ');
    }
    return 'Local search gaps identified';
  }

  function getCRMSummary() {
    if (crmFindings.gaps && crmFindings.gaps.length > 0) {
      return crmFindings.gaps.slice(0, 2).map(g => g.split('—')[0].trim()).join(', ');
    }
    return 'Operations gaps identified';
  }

  return (
    <div className="bp-page bp-cover">
      {/* Header */}
      <div className="bp-cover-header">
        <div className="wm" style={{ fontSize: 24 }}>
          <em>S</em>CORNA
        </div>
        <span className="bp-confidential">Confidential</span>
      </div>

      {/* Hero */}
      <div className="bp-cover-hero">
        <div className="bp-eyebrow">Business Audit Findings</div>
        <h1 className="bp-business-name">
          {clientInfo.businessName || 'Business Name'}
        </h1>
        <div className="bp-cover-meta">
          {auditDate && <div>{auditDate}</div>}
          {clientInfo.ownerName && <div>Prepared for {clientInfo.ownerName}</div>}
          {clientInfo.industry && <div>{clientInfo.industry}</div>}
        </div>
        <div className="bp-ember-rule" />
      </div>

      {/* Cost of Inaction hero block */}
      <div className="bp-coi-hero">
        <div className="bp-coi-label">Estimated Monthly Cost of Inaction</div>
        <div className="bp-coi-number">{formatCurrency(total)}</div>
        <div className="bp-coi-subtext">in identified monthly revenue leakage</div>
        <div className="bp-coi-desc">
          This figure represents estimated monthly revenue loss across website conversion, marketing gaps,
          operational inefficiencies, and missed reactivation — based on your business data and industry benchmarks.
        </div>
      </div>

      {/* Section summary grid */}
      <div className="bp-summary-grid">
        <div className="bp-summary-card">
          <div className="bp-summary-section">Website</div>
          <div className="bp-summary-cost">{formatCurrency(websiteCost)}</div>
          <div className="bp-summary-finding">{getWebsiteSummary()}</div>
        </div>
        <div className="bp-summary-card">
          <div className="bp-summary-section">Social & Marketing</div>
          <div className="bp-summary-cost">{formatCurrency(socialCost + marketingCost)}</div>
          <div className="bp-summary-finding">{getSocialSummary()}</div>
        </div>
        <div className="bp-summary-card">
          <div className="bp-summary-section">Marketing</div>
          <div className="bp-summary-cost">{formatCurrency(marketingCost)}</div>
          <div className="bp-summary-finding">{getMarketingSummary()}</div>
        </div>
        <div className="bp-summary-card">
          <div className="bp-summary-section">CRM & Operations</div>
          <div className="bp-summary-cost">{formatCurrency(crmCost)}</div>
          <div className="bp-summary-finding">{getCRMSummary()}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="bp-cover-footer">
        <span className="bp-cover-footer-text">
          This report is confidential and prepared exclusively for {clientInfo.businessName || 'your business'}
        </span>
        <div className="wm" style={{ fontSize: 16 }}>
          <em>S</em>CORNA
        </div>
      </div>
    </div>
  );
}
