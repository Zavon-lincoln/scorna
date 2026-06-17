/**
 * Scorna Blueprint — Tool Recommendations
 * Maps selected gaps to specific tool/solution recommendations.
 * Fully editable in the builder — these are just defaults.
 */

export const WEBSITE_TOOLS = {
  'No booking or scheduling functionality': {
    tool: 'Booking Integration',
    description: 'Calendly, Acuity, or native booking system connected directly to your calendar — eliminates friction and captures leads 24/7',
  },
  'No clear call-to-action above the fold': {
    tool: 'Conversion-Optimized Website Rebuild',
    description: 'Full site rebuild with lead capture as the primary function of every page — every scroll ends in an ask',
  },
  'Contact form with no automated follow-up': {
    tool: 'Automated Intake + Follow-Up',
    description: 'Multi-step intake form with immediate automated response and follow-up sequence — no lead sits cold',
  },
  'Not mobile optimized': {
    tool: 'Mobile-First Website Rebuild',
    description: 'Responsive rebuild that prioritizes the 70%+ of traffic arriving on mobile — built to convert on a small screen',
  },
  'No trust signals (reviews, credentials, testimonials)': {
    tool: 'Social Proof Integration',
    description: 'Live Google review feed, credentialing section, and before/after gallery — trust built before the first call',
  },
  'No lead capture mechanism': {
    tool: 'Lead Capture System',
    description: 'Strategic lead magnet, multi-step form, or quiz funnel that converts passive visitors into captured contacts',
  },
  'Slow page load speed': {
    tool: 'Performance Optimization',
    description: 'Image compression, caching, and technical optimization to hit sub-2-second load times — directly impacts conversion rate',
  },
  'Not appearing in local search results': {
    tool: 'Local SEO Implementation',
    description: 'Google Business Profile optimization, local citations, and on-page SEO targeting your core service keywords',
  },
  'No blog or content strategy': {
    tool: 'Content Strategy & SEO',
    description: 'Monthly content calendar targeting high-intent local search terms — compounding traffic over time',
  },
};

export const SOCIAL_TOOLS = {
  'No consistent posting schedule': {
    tool: 'Content Calendar + Scheduling',
    description: 'Monthly content calendar with automated scheduling via Buffer or Later — consistent presence without daily effort',
  },
  'No clear CTA in posts or bio': {
    tool: 'Social Content Strategy',
    description: 'Full content strategy with weekly call-to-action posts and optimized bio linking to booking — every post earns its keep',
  },
  'Profile incomplete — missing key information': {
    tool: 'Profile Optimization',
    description: 'Full platform audit and optimization — bio, highlights, contact info, links, and branded cover imagery',
  },
  'No engagement strategy': {
    tool: 'Engagement Protocol',
    description: 'Daily 20-minute engagement protocol targeting local hashtags and competitor audiences — systematic reach growth',
  },
  'Content doesn\'t drive action': {
    tool: 'Conversion-Focused Content',
    description: 'Content templates designed to drive clicks, DMs, and bookings — not just likes',
  },
  'Wrong platform for their audience': {
    tool: 'Platform Migration Strategy',
    description: 'Full platform audit and migration to the channel where your audience actually spends time and searches for services',
  },
  'No content connecting to their services': {
    tool: 'Service-Led Content System',
    description: 'Content system that maps every post to a specific service outcome — awareness, consideration, and conversion content',
  },
};

export const MARKETING_TOOLS = {
  'Google Business Profile incomplete': {
    tool: 'Google Business Profile Optimization',
    description: 'Full GBP setup: services, photos, hours, attributes, Q&A, and regular posting — the single highest-ROI local marketing asset',
  },
  'Low review volume for their market': {
    tool: 'Automated Review Request System',
    description: 'Post-visit review request automation that sends at the optimal moment — steady review volume without manual follow-up',
  },
  'Not responding to reviews': {
    tool: 'Review Response Protocol',
    description: 'Templated review response system for positive and negative reviews — signals trust to Google and new prospects',
  },
  'GBP not linked to website': {
    tool: 'Local SEO Technical Fix',
    description: 'NAP consistency audit and GBP-website linking — critical for local pack ranking and conversion tracking',
  },
  'No paid ad presence': {
    tool: 'Paid Advertising Campaign Build',
    description: 'Meta and/or Google Ads campaign designed around your highest-value service — built to be profitable from day one',
  },
  'Competitors running ads, they are not': {
    tool: 'Competitive Ad Strategy',
    description: 'Ad campaign targeting the same keywords and audiences your competitors are spending on — get in front of the same buyers',
  },
  'Not appearing in local search for primary terms': {
    tool: 'Local SEO Full Implementation',
    description: 'Keyword targeting, on-page SEO, citation building, and GBP optimization to rank for your core local terms',
  },
};

export const CRM_TOOLS = {
  'No automated lead response — relying on manual follow-up': {
    tool: 'Automated Lead Response (< 2 Minutes)',
    description: 'n8n + Resend automation that responds to every new lead within 2 minutes — before they contact your competitor',
  },
  'Leads going cold with no systematic touchpoints': {
    tool: '5-Touchpoint Follow-Up Sequence',
    description: 'Automated 14-day follow-up sequence across email and SMS — most leads convert on touchpoint 4 or 5, not 1',
  },
  'No reactivation system for past clients': {
    tool: 'Dormant Client Reactivation Campaign',
    description: '60-day email and SMS reactivation sequence targeting clients who haven\'t booked in 90+ days — your easiest revenue',
  },
  'Owner personally handling routine communications': {
    tool: 'Full CRM + Workflow Automation',
    description: 'Complete CRM build with automated intake, follow-up, and admin communication — removes the owner from the loop',
  },
  'No pipeline visibility — no clear view of lead status': {
    tool: 'Pipeline Dashboard',
    description: 'CRM pipeline with clear lead stages, activity tracking, and daily digest — you know exactly where every lead stands',
  },
  'No appointment reminders or confirmations automated': {
    tool: 'Appointment Automation Suite',
    description: 'Confirmation, 24-hour reminder, and 1-hour reminder sequences — cuts no-shows by 40-60%',
  },
  'No post-visit follow-up or review collection': {
    tool: 'Post-Visit Follow-Up Sequence',
    description: 'Automated thank-you, review request, and rebooking prompt sent 24 hours post-visit — closes the loop on every client',
  },
  'Staff communication done manually with no system': {
    tool: 'Internal Operations Automation',
    description: 'Automated task assignment, staff notifications, and intake routing — the business runs without manual coordination',
  },
};

/**
 * Returns an array of tool recommendations for the given gap keys and section.
 * @param {string[]} gaps - Array of selected gap strings
 * @param {'website'|'social'|'marketing'|'crm'} section
 * @returns {{ tool: string, description: string }[]}
 */
export function getToolRecommendations(gaps, section) {
  const map = {
    website: WEBSITE_TOOLS,
    social: SOCIAL_TOOLS,
    marketing: MARKETING_TOOLS,
    crm: CRM_TOOLS,
  }[section] || {};

  return gaps
    .filter((g) => map[g])
    .map((g) => map[g]);
}
