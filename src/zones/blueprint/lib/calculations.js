/**
 * Scorna Blueprint — Calculations
 * All monetary math lives here.
 */

const INDUSTRY_CLOSE_RATE = 0.40; // 40% benchmark

export function calculateLeadGap(leadVolume, closeRate, avgTransaction) {
  const current = (leadVolume || 0) * ((closeRate || 0) / 100) * (avgTransaction || 0);
  const potential = (leadVolume || 0) * INDUSTRY_CLOSE_RATE * (avgTransaction || 0);
  return {
    currentRevenue: current,
    potentialRevenue: potential,
    monthlyGap: Math.max(0, potential - current),
  };
}

export function calculateCRMLeakageSuggestion(leadVolume, avgTransaction, closeRate) {
  // Estimate unconverted leads that a follow-up system would recover
  return Math.round(
    (leadVolume || 0) * 0.30 * (avgTransaction || 0) * (1 - (closeRate || 0) / 100)
  );
}

export function calculateOwnerTimeCost(hoursPerWeek, hourlyRate) {
  return (hoursPerWeek || 0) * 4 * (hourlyRate || 0);
}

export function calculateTotalLeakage(websiteCost, socialCost, marketingCost, crmCost) {
  return (
    (Number(websiteCost) || 0) +
    (Number(socialCost) || 0) +
    (Number(marketingCost) || 0) +
    (Number(crmCost) || 0)
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n || 0);
}
