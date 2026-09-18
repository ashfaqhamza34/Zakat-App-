import { AssetInputs, CalculationResult, GoldPurity, NisabMethod } from '../types';

export const GOLD_NISAB_GRAMS = 87.48; // 7.5 Tolas
export const SILVER_NISAB_GRAMS = 612.36; // 52.5 Tolas

// Karat purity fraction
export const PURITY_FACTORS: Record<GoldPurity, number> = {
  '24K': 24 / 24, // 1.0 (99.9% pure)
  '22K': 22 / 24, // ~0.9167
  '21K': 21 / 24, // 0.875
  '18K': 18 / 24, // 0.75
};

// Default Pakistani Sarafa market rates in PKR/gram as realistic defaults
export const DEFAULT_RATES = {
  gold24kPerGram: 26500, // PKR ~Rs 26,500/g for 24K gold
  silverPerGram: 310,     // PKR ~Rs 310/g for fine silver
};

export function calculatePureGoldGrams(grams: number, purity: GoldPurity): number {
  return grams * (PURITY_FACTORS[purity] || 1);
}

export function calculateZakat(
  inputs: AssetInputs,
  nisabMethod: NisabMethod
): CalculationResult {
  const purityFactor = PURITY_FACTORS[inputs.goldPurity] || 1;
  const goldPureGrams = inputs.goldGrams * purityFactor;
  const goldValue = goldPureGrams * (inputs.goldRatePerGram || 0);
  const silverValue = inputs.silverGrams * (inputs.silverRatePerGram || 0);
  const cashValue = Math.max(0, inputs.cashSavings || 0);
  const businessValue = Math.max(0, inputs.businessValue || 0);
  const liabilities = Math.max(0, inputs.liabilities || 0);

  const totalAssets = cashValue + goldValue + silverValue + businessValue;
  const netWealth = Math.max(0, totalAssets - liabilities);

  let nisabGrams = SILVER_NISAB_GRAMS;
  let nisabThresholdPKR = 0;

  if (nisabMethod === 'gold') {
    nisabGrams = GOLD_NISAB_GRAMS;
    nisabThresholdPKR = GOLD_NISAB_GRAMS * (inputs.goldRatePerGram || 0);
  } else {
    nisabGrams = SILVER_NISAB_GRAMS;
    nisabThresholdPKR = SILVER_NISAB_GRAMS * (inputs.silverRatePerGram || 0);
  }

  const isEligible = netWealth >= nisabThresholdPKR && nisabThresholdPKR > 0;
  const zakatDue = isEligible ? Math.round(netWealth * 0.025) : 0;
  const shortfall = isEligible ? 0 : Math.max(0, nisabThresholdPKR - netWealth);

  return {
    cashValue,
    goldValue,
    goldPureGrams,
    silverValue,
    businessValue,
    totalAssets,
    liabilities,
    netWealth,
    nisabMethod,
    nisabGrams,
    nisabThresholdPKR,
    isEligible,
    shortfall,
    zakatDue,
    calculatedAt: new Date().toISOString(),
  };
}
