import React, { useState, useEffect, useCallback } from 'react';
import ClientInfoStep from './ClientInfoStep.jsx';
import CostOfInactionStep from './CostOfInactionStep.jsx';
import WebsiteStep from './WebsiteStep.jsx';
import SocialStep from './SocialStep.jsx';
import MarketingStep from './MarketingStep.jsx';
import CRMStep from './CRMStep.jsx';
import ReviewStep from './ReviewStep.jsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  { label: 'Client Info', key: 'clientInfo' },
  { label: 'Cost of Inaction', key: 'costOfInaction' },
  { label: 'Website', key: 'websiteFindings' },
  { label: 'Social Media', key: 'socialFindings' },
  { label: 'Marketing', key: 'marketingFindings' },
  { label: 'CRM & Ops', key: 'crmFindings' },
  { label: 'Review', key: null },
];

function validateStep(step, blueprintData) {
  if (step === 0) {
    const { clientInfo } = blueprintData;
    return !!(clientInfo.businessName && clientInfo.ownerName && clientInfo.industry);
  }
  if (step === 2) {
    return !!(blueprintData.websiteFindings.observation);
  }
  if (step === 5) {
    return !!(blueprintData.crmFindings.observation);
  }
  return true;
}

export default function BuilderForm({ blueprintData, onChange, onGenerate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);

  // Auto-save indicator
  const triggerSave = useCallback(() => {
    if (saveTimer) clearTimeout(saveTimer);
    const t = setTimeout(() => {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 800);
    setSaveTimer(t);
  }, [saveTimer]);

  function handleChange(key, value) {
    onChange(key, value);
    triggerSave();
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const canNext = validateStep(currentStep, blueprintData);
  const isLastStep = currentStep === STEPS.length - 1;

  function goTo(idx) {
    setCurrentStep(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="builder-shell">
      {/* Header */}
      <header className="builder-header">
        <div className="wm" style={{ fontSize: 22 }}>
          <em>S</em>CORNA
        </div>
        <div className="builder-header-right">
          <span className={`draft-saved ${draftSaved ? 'visible' : ''}`}>
            Draft saved
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div className="step-indicators">
        {STEPS.map((step, idx) => (
          <div
            key={step.label}
            className={`step-indicator ${idx === currentStep ? 'active' : ''}`}
            onClick={() => idx <= currentStep && goTo(idx)}
          >
            <div
              className={`step-dot ${
                idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''
              }`}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Main form */}
      <main className="builder-main">
        <div className="builder-form-wrap">
          {currentStep === 0 && (
            <ClientInfoStep
              data={blueprintData.clientInfo}
              onChange={(v) => handleChange('clientInfo', v)}
            />
          )}
          {currentStep === 1 && (
            <CostOfInactionStep
              data={blueprintData.costOfInaction}
              onChange={(v) => handleChange('costOfInaction', v)}
            />
          )}
          {currentStep === 2 && (
            <WebsiteStep
              data={blueprintData.websiteFindings}
              onChange={(v) => handleChange('websiteFindings', v)}
              coiData={blueprintData.costOfInaction}
            />
          )}
          {currentStep === 3 && (
            <SocialStep
              data={blueprintData.socialFindings}
              onChange={(v) => handleChange('socialFindings', v)}
              coiData={blueprintData.costOfInaction}
            />
          )}
          {currentStep === 4 && (
            <MarketingStep
              data={blueprintData.marketingFindings}
              onChange={(v) => handleChange('marketingFindings', v)}
              coiData={blueprintData.costOfInaction}
            />
          )}
          {currentStep === 5 && (
            <CRMStep
              data={blueprintData.crmFindings}
              onChange={(v) => handleChange('crmFindings', v)}
              coiData={blueprintData.costOfInaction}
            />
          )}
          {currentStep === 6 && (
            <ReviewStep
              blueprintData={blueprintData}
              onGoToStep={goTo}
            />
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav className="builder-nav">
        <div className="builder-nav-left">
          {currentStep > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => goTo(currentStep - 1)}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
        </div>

        <span className="step-count">
          Step {currentStep + 1} of {STEPS.length}
        </span>

        <div className="builder-nav-right">
          {isLastStep ? (
            <button
              className="btn btn-primary"
              style={{ padding: '12px 40px' }}
              onClick={onGenerate}
            >
              Generate Blueprint
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => goTo(currentStep + 1)}
              disabled={!canNext}
            >
              {currentStep === 0 ? 'Start Audit' : 'Next'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
