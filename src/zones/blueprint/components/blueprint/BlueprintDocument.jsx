import React from 'react';
import CoverPage from './CoverPage.jsx';
import SectionPage from './SectionPage.jsx';
import CostBreakdown from './CostBreakdown.jsx';

export default function BlueprintDocument({ blueprintData }) {
  const { clientInfo, costOfInaction, websiteFindings, socialFindings, marketingFindings, crmFindings } = blueprintData;

  const websiteCost = Number(websiteFindings.monthlyCost) || Number(costOfInaction.websiteCost) || 0;
  const socialCost = Number(socialFindings.monthlyCost) || Number(costOfInaction.socialCost) || 0;
  const marketingCost = Number(marketingFindings.monthlyCost) || Number(costOfInaction.marketingCost) || 0;
  const crmCost = Number(crmFindings.monthlyCost) || Number(costOfInaction.crmCost) || 0;

  return (
    <div id="blueprint-document" className="blueprint-document">
      {/* Page 1 — Cover */}
      <CoverPage blueprintData={blueprintData} />

      {/* Page 2 — Website */}
      <SectionPage
        sectionNumber={1}
        sectionName="Website"
        monthlyCost={websiteCost}
        observation={websiteFindings.observation}
        impact={websiteFindings.impact}
        gaps={[...(websiteFindings.gaps || []), ...(websiteFindings.otherGap ? [websiteFindings.otherGap] : [])].filter(g => g !== 'Other')}
        tools={websiteFindings.tools || []}
      />

      {/* Page 3 — Social Media */}
      <SectionPage
        sectionNumber={2}
        sectionName="Social Media"
        monthlyCost={socialCost}
        observation={socialFindings.observation}
        impact={socialFindings.impact}
        gaps={[...(socialFindings.gaps || []), ...(socialFindings.otherGap ? [socialFindings.otherGap] : [])].filter(g => g !== 'Other')}
        tools={socialFindings.tools || []}
      />

      {/* Page 4 — Marketing */}
      <SectionPage
        sectionNumber={3}
        sectionName="Marketing & Visibility"
        monthlyCost={marketingCost}
        observation={marketingFindings.observation}
        impact={marketingFindings.impact}
        gaps={[...(marketingFindings.gaps || []), ...(marketingFindings.otherGap ? [marketingFindings.otherGap] : [])].filter(g => g !== 'Other')}
        tools={marketingFindings.tools || []}
      />

      {/* Page 5 — CRM & Operations */}
      <SectionPage
        sectionNumber={4}
        sectionName="CRM & Operations"
        monthlyCost={crmCost}
        observation={crmFindings.observation}
        impact={crmFindings.impact}
        gaps={[...(crmFindings.gaps || []), ...(crmFindings.otherGap ? [crmFindings.otherGap] : [])].filter(g => g !== 'Other')}
        tools={crmFindings.tools || []}
        discoveryQuote={crmFindings.discoveryQuotes}
        ownerName={clientInfo.ownerName}
        crmCurrentState={crmFindings}
      />

      {/* Final Page — Summary */}
      <CostBreakdown blueprintData={blueprintData} />
    </div>
  );
}
