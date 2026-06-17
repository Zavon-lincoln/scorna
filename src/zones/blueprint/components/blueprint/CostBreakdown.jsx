import React from 'react';
import { formatCurrency, calculateTotalLeakage } from '../../lib/calculations.js';

/**
 * Final summary page — The Path Forward
 */
export default function CostBreakdown({ blueprintData }) {
  const { clientInfo, costOfInaction, websiteFindings, socialFindings, marketingFindings, crmFindings } = blueprintData;

  const websiteCost = Number(websiteFindings.monthlyCost) || Number(costOfInaction.websiteCost) || 0;
  const socialCost = Number(socialFindings.monthlyCost) || Number(costOfInaction.socialCost) || 0;
  const marketingCost = Number(marketingFindings.monthlyCost) || Number(costOfInaction.marketingCost) || 0;
  const crmCost = Number(crmFindings.monthlyCost) || Number(costOfInaction.crmCost) || 0;
  const total = calculateTotalLeakage(websiteCost, socialCost, marketingCost, crmCost);

  return (
    <div className="bp-page bp-summary-page">
      <h2 className="bp-summary-heading">The Path Forward</h2>

      {/* Investment summary table */}
      <div>
        <table className="bp-invest-table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Monthly Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Website</td>
              <td>{formatCurrency(websiteCost)}</td>
            </tr>
            <tr>
              <td>Social & Marketing</td>
              <td>{formatCurrency(socialCost)}</td>
            </tr>
            <tr>
              <td>Marketing & GBP</td>
              <td>{formatCurrency(marketingCost)}</td>
            </tr>
            <tr>
              <td>CRM & Operations</td>
              <td>{formatCurrency(crmCost)}</td>
            </tr>
            <tr className="total-row">
              <td>Total</td>
              <td>{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Decision frame */}
      <div>
        <div className="bp-decision-frame">
          <div className="bp-decision-col">
            <div className="bp-decision-col-label">Cost of Inaction</div>
            <div className="bp-decision-col-amount">{formatCurrency(total)}</div>
            <div className="bp-decision-caption">per month, compounding</div>
          </div>
          <div className="bp-decision-col">
            <div className="bp-decision-col-label">Cost of Action</div>
            <div className="bp-decision-col-blank">To be discussed</div>
            <div className="bp-decision-caption">on our follow-up call</div>
          </div>
        </div>
        <div className="bp-decision-statement">
          Every month this remains unaddressed, your business loses an estimated {formatCurrency(total)}.
          The systems that fix this exist. The only question is when.
        </div>
      </div>

      {/* Next steps */}
      <div>
        <div className="bp-block-label" style={{ marginBottom: 16 }}>Next Steps</div>
        <div className="bp-next-steps">
          <div className="bp-next-step">
            <div className="bp-next-step-num">1</div>
            <div className="bp-next-step-text">
              Review these findings with your team — every figure in this document came directly from your audit data.
            </div>
          </div>
          <div className="bp-next-step">
            <div className="bp-next-step-num">2</div>
            <div className="bp-next-step-text">
              Schedule a follow-up call to discuss the solution — we'll walk you through exactly what gets built, how it works, and what it costs.
            </div>
          </div>
          <div className="bp-next-step">
            <div className="bp-next-step-num">3</div>
            <div className="bp-next-step-text">
              We handle everything from there — you focus on the business, we build and manage the systems.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bp-summary-footer">
        <div className="wm" style={{ fontSize: 18 }}>
          <em>S</em>CORNA
        </div>
        <div className="bp-footer-text">
          This blueprint is the property of Scorna and is prepared exclusively for {clientInfo.businessName || 'your business'}.
          All figures are estimates based on audit data and industry benchmarks.
        </div>
      </div>
    </div>
  );
}
