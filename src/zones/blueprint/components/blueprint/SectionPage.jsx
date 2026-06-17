import React from 'react';
import { formatCurrency } from '../../lib/calculations.js';

/**
 * Generic section page.
 * Props:
 *   sectionNumber: number (1-4)
 *   sectionName: string
 *   monthlyCost: number
 *   observation: string
 *   impact: string
 *   gaps: string[]
 *   tools: { tool: string, description: string }[]
 *   discoveryQuote?: string   (CRM only)
 *   ownerName?: string        (for quote attribution)
 *   crmCurrentState?: object  (CRM only — response time etc.)
 */
export default function SectionPage({
  sectionNumber,
  sectionName,
  monthlyCost = 0,
  observation,
  impact,
  gaps = [],
  tools = [],
  discoveryQuote,
  ownerName,
  crmCurrentState,
}) {
  return (
    <div className="bp-page bp-section-page">
      {/* Section header */}
      <div className="bp-section-header">
        <div className="bp-section-watermark">{String(sectionNumber).padStart(2, '0')}</div>
        <h2 className="bp-section-name">{sectionName}</h2>
        <div className="bp-section-rule" />
      </div>

      {/* Monthly cost callout */}
      <div className="bp-cost-callout" style={{ marginTop: 28 }}>
        <span className="bp-cost-callout-label">Monthly Cost</span>
        <span className="bp-cost-callout-amount">{formatCurrency(monthlyCost)}</span>
      </div>

      <div className="bp-section-body">
        {/* Observation */}
        {observation && (
          <div className="bp-block">
            <div className="bp-block-label">What We Found</div>
            <p className="bp-block-text">{observation}</p>
          </div>
        )}

        {/* Discovery call pull quote (CRM only) */}
        {discoveryQuote && (
          <div className="bp-pull-quote">
            <div className="bp-quote-mark">"</div>
            <p className="bp-quote-text">{discoveryQuote}</p>
            {ownerName && (
              <p className="bp-quote-attribution">— {ownerName}, during discovery call</p>
            )}
          </div>
        )}

        {/* Impact */}
        {impact && (
          <div className="bp-block">
            <div className="bp-block-label">Why This Matters</div>
            <p className="bp-block-text">{impact}</p>
          </div>
        )}

        {/* Gaps identified */}
        {gaps.length > 0 && (
          <div className="bp-block">
            <div className="bp-block-label ash">Identified Gaps</div>
            <div className="bp-gaps-list">
              {gaps.map((gap, i) => (
                <div key={i} className="bp-gap-item">
                  <span className="bp-gap-dash">—</span>
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRM current state table */}
        {crmCurrentState && (
          <div className="bp-block">
            <div className="bp-block-label ash">Current Setup</div>
            <table className="bp-data-table">
              <tbody>
                {crmCurrentState.responseTime && (
                  <tr>
                    <td>Lead response time</td>
                    <td className={
                      ['Next day', '2+ days', 'No systematic response'].includes(crmCurrentState.responseTime)
                        ? 'concern' : ''
                    }>
                      {crmCurrentState.responseTime}
                    </td>
                  </tr>
                )}
                {crmCurrentState.followupTouchpoints && (
                  <tr>
                    <td>Follow-up touchpoints</td>
                    <td className={
                      ['None', '1'].includes(crmCurrentState.followupTouchpoints) ? 'concern' : ''
                    }>
                      {crmCurrentState.followupTouchpoints}
                    </td>
                  </tr>
                )}
                {crmCurrentState.reactivationSystem && (
                  <tr>
                    <td>Reactivation system</td>
                    <td className={
                      ['None', 'Manual / Ad hoc'].includes(crmCurrentState.reactivationSystem) ? 'concern' : ''
                    }>
                      {crmCurrentState.reactivationSystem}
                    </td>
                  </tr>
                )}
                {crmCurrentState.crmTool && (
                  <tr>
                    <td>CRM tool</td>
                    <td className={
                      ['None', 'Spreadsheet'].includes(crmCurrentState.crmTool) ? 'concern' : ''
                    }>
                      {crmCurrentState.crmTool}
                    </td>
                  </tr>
                )}
                {crmCurrentState.ownerHours && (
                  <tr>
                    <td>Owner hours/week on manual tasks</td>
                    <td className={Number(crmCurrentState.ownerHours) >= 5 ? 'concern' : ''}>
                      {crmCurrentState.ownerHours} hrs
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tool recommendations */}
        {tools.length > 0 && (
          <div className="bp-block">
            <div className="bp-block-label">The Solution</div>
            <div className="bp-tools-grid">
              {tools.map((t, i) => (
                <div key={i} className="bp-tool-card">
                  <div className="bp-tool-badge">Tool</div>
                  <div>
                    <div className="bp-tool-name">{t.tool}</div>
                    <div className="bp-tool-desc">{t.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
