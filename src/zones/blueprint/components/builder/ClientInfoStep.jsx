import React from 'react';

const INDUSTRIES = [
  'Med Spa',
  'Law Firm',
  'Dental Practice',
  'Gym',
  'HVAC Company',
  'Chiropractic',
  'Real Estate',
  'Other',
];

export default function ClientInfoStep({ data, onChange }) {
  const today = new Date().toISOString().split('T')[0];

  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div>
      <div className="step-header">
        <div className="step-number">01</div>
        <h2 className="step-title">Client Information</h2>
        <p className="step-desc">Basic details about the business and this audit engagement.</p>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label required">Business Name</label>
          <input
            type="text"
            value={data.businessName || ''}
            onChange={(e) => set('businessName', e.target.value)}
            placeholder="e.g. Luxe Med Spa & Wellness"
          />
        </div>
        <div className="field-group">
          <label className="field-label required">Industry</label>
          <select
            value={data.industry || ''}
            onChange={(e) => set('industry', e.target.value)}
          >
            <option value="">Select industry…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label required">Owner Name</label>
          <input
            type="text"
            value={data.ownerName || ''}
            onChange={(e) => set('ownerName', e.target.value)}
            placeholder="e.g. Sarah Mitchell"
          />
        </div>
        <div className="field-group">
          <label className="field-label">Owner Email</label>
          <input
            type="email"
            value={data.ownerEmail || ''}
            onChange={(e) => set('ownerEmail', e.target.value)}
            placeholder="sarah@luxemedsp.com"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-label required">Date of Audit</label>
          <input
            type="date"
            value={data.auditDate || today}
            onChange={(e) => set('auditDate', e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Prepared By</label>
          <input
            type="text"
            value={data.preparedBy || 'Scorna'}
            onChange={(e) => set('preparedBy', e.target.value)}
            placeholder="Scorna"
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Business Website</label>
        <input
          type="url"
          value={data.website || ''}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://"
        />
      </div>
    </div>
  );
}
