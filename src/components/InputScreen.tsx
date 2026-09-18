import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  Gem,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
  Wifi,
  WifiOff,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { AssetInputs, GoldPurity, NisabMethod } from '../types';
import { formatPKR, formatGrams } from '../utils/formatters';
import { PURITY_FACTORS, DEFAULT_RATES } from '../utils/calculations';

interface InputScreenProps {
  inputs: AssetInputs;
  nisabMethod: NisabMethod;
  onChange: (inputs: Partial<AssetInputs>) => void;
  onCalculate: () => void;
  isOnline: boolean;
  rateSyncStatus: 'live' | 'offline' | 'fetching';
  lastRateSyncTime?: string;
  rateSource?: string;
  onFetchLiveRates: () => void;
  onOpenOfflineModal: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  inputs,
  nisabMethod,
  onChange,
  onCalculate,
  isOnline,
  rateSyncStatus,
  lastRateSyncTime,
  rateSource,
  onFetchLiveRates,
  onOpenOfflineModal,
}) => {
  // Collapsible state for each section (default open or user toggled)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    rates: false,
    cash: false,
    gold: false,
    silver: false,
    business: false,
    liabilities: false,
  });

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculations for live breakdown
  const purityFactor = PURITY_FACTORS[inputs.goldPurity] || 1;
  const goldPureGrams = (inputs.goldGrams || 0) * purityFactor;
  const goldTotalValue = goldPureGrams * (inputs.goldRatePerGram || 0);
  const silverTotalValue = (inputs.silverGrams || 0) * (inputs.silverRatePerGram || 0);
  const totalAssets =
    (inputs.cashSavings || 0) +
    goldTotalValue +
    silverTotalValue +
    (inputs.businessValue || 0);
  const netWealth = Math.max(0, totalAssets - (inputs.liabilities || 0));

  const relevantRateMissing = nisabMethod === 'gold'
    ? (inputs.goldRatePerGram || 0) === 0
    : (inputs.silverRatePerGram || 0) === 0;

  // Unit toggle for entering rates: 'gram' or 'tola'
  const [rateUnit, setRateUnit] = useState<'gram' | 'tola'>('gram');

  // Tola conversion constants
  const TOLA_GRAMS = 11.664;
  const goldRatePerTola = Math.round((inputs.goldRatePerGram || 0) * TOLA_GRAMS);
  const silverRatePerTola = Math.round((inputs.silverRatePerGram || 0) * TOLA_GRAMS);

  // Handler for positive number inputs
  const handleNumericInput = (
    field: keyof AssetInputs,
    value: string,
    isDecimal = true
  ) => {
    if (value === '') {
      onChange({ [field]: 0 });
      return;
    }
    const clean = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(clean);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange({ [field]: parsed });
    }
  };

  // Handler for rate input when entered in Tolas
  const handleTolaRateInput = (field: 'goldRatePerGram' | 'silverRatePerGram', tolaValueStr: string) => {
    if (tolaValueStr === '') {
      onChange({ [field]: 0 });
      return;
    }
    const clean = tolaValueStr.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(clean);
    const perGram = isNaN(parsed) ? 0 : Math.round(parsed / TOLA_GRAMS);
    onChange({ [field]: perGram });
  };

  const applyPresetRates = () => {
    onChange({
      goldRatePerGram: DEFAULT_RATES.gold24kPerGram,
      silverRatePerGram: DEFAULT_RATES.silverPerGram,
    });
  };

  return (
    <div className="pb-36 pt-3 px-3 max-w-lg mx-auto space-y-3">
      {/* 1. Market Rates Advice & Sync Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-amber-900/10 dark:from-emerald-950/40 dark:to-amber-950/30 border border-emerald-600/30 p-3.5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide text-[11px]">
                  Sarafa Bullion Rates
                </span>
                {rateSyncStatus === 'live' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Synced {lastRateSyncTime ? `(${lastRateSyncTime})` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-500/30">
                    <WifiOff className="h-2.5 w-2.5" />
                    Offline / Manual
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="fetch-live-rates-btn"
                  onClick={() => {
                    if (isOnline) {
                      onFetchLiveRates();
                    } else {
                      onOpenOfflineModal();
                    }
                  }}
                  disabled={rateSyncStatus === 'fetching'}
                  className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-200/60 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 px-2 py-0.5 rounded-lg transition shadow-2xs disabled:opacity-60"
                  title={isOnline ? 'Sync live rates' : 'Connect to internet for live rates'}
                >
                  <RefreshCw className={`h-3 w-3 ${rateSyncStatus === 'fetching' ? 'animate-spin text-emerald-600' : 'text-emerald-700 dark:text-emerald-300'}`} />
                  <span>{rateSyncStatus === 'fetching' ? 'Syncing...' : 'Fetch Live Rates'}</span>
                </button>
              </div>
            </div>

            <p className="mt-1.5 text-slate-600 dark:text-slate-300 leading-[1.48]">
              {rateSyncStatus === 'live'
                ? `Auto-synced from bullion market feed. 24K Gold: Rs. ${formatPKR(inputs.goldRatePerGram, false)}/g (~Rs. ${formatPKR(goldRatePerTola, false)}/tola).`
                : `Connect with Wi-Fi or mobile data to automatically fetch today's live Sarafa rates, or enter rates manually below.`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Manual Gold & Silver Rates Section */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          id="toggle-rates-section-btn"
          onClick={() => toggleSection('rates')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                  Gold & Silver Market Rates
                </h2>
                {rateSyncStatus === 'live' ? (
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md font-semibold">
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-md font-semibold">
                    Manual
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {rateUnit === 'gram' ? 'Rates per gram (PKR)' : 'Rates per tola (11.66g PKR)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full tabular-nums">
              {formatPKR(inputs.goldRatePerGram, false)}/g Au
            </span>
            {collapsed.rates ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {!collapsed.rates && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3 mt-2">
            {/* Unit Selector: Per Gram vs Per Tola */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Enter rate as:</span>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  id="rate-unit-gram-btn"
                  onClick={() => setRateUnit('gram')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                    rateUnit === 'gram'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Per Gram (g)
                </button>
                <button
                  type="button"
                  id="rate-unit-tola-btn"
                  onClick={() => setRateUnit('tola')}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition ${
                    rateUnit === 'tola'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  Per Tola (11.66g)
                </button>
              </div>
            </div>

            {/* Offline Alert Banner if disconnected */}
            {!isOnline && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Offline mode. Manual rates active.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenOfflineModal}
                  className="underline font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 shrink-0 ml-2"
                >
                  Why connect?
                </button>
              </div>
            )}

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  24K Gold Rate {rateUnit === 'gram' ? '(PKR / gram)' : '(PKR / tola)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                    PKR
                  </span>
                  <input
                    id="input-gold-rate"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    value={rateUnit === 'gram' ? (inputs.goldRatePerGram || '') : (goldRatePerTola || '')}
                    onChange={(e) => {
                      if (rateUnit === 'gram') {
                        handleNumericInput('goldRatePerGram', e.target.value);
                      } else {
                        handleTolaRateInput('goldRatePerGram', e.target.value);
                      }
                    }}
                    placeholder={rateUnit === 'gram' ? 'e.g. 26500' : 'e.g. 309000'}
                    className="w-full pl-12 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-semibold tabular-nums"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {rateUnit === 'gram'
                    ? `≈ Rs. ${formatPKR(goldRatePerTola, false)} / Tola (11.664g)`
                    : `≈ Rs. ${formatPKR(inputs.goldRatePerGram, false)} / gram`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Silver Rate {rateUnit === 'gram' ? '(PKR / gram)' : '(PKR / tola)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                    PKR
                  </span>
                  <input
                    id="input-silver-rate"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    value={rateUnit === 'gram' ? (inputs.silverRatePerGram || '') : (silverRatePerTola || '')}
                    onChange={(e) => {
                      if (rateUnit === 'gram') {
                        handleNumericInput('silverRatePerGram', e.target.value);
                      } else {
                        handleTolaRateInput('silverRatePerGram', e.target.value);
                      }
                    }}
                    placeholder={rateUnit === 'gram' ? 'e.g. 310' : 'e.g. 3615'}
                    className="w-full pl-12 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-semibold tabular-nums"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {rateUnit === 'gram'
                    ? `≈ Rs. ${formatPKR(silverRatePerTola, false)} / Tola (11.664g)`
                    : `≈ Rs. ${formatPKR(inputs.silverRatePerGram, false)} / gram`}
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                id="reset-rates-btn"
                onClick={applyPresetRates}
                className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Reset to Sarafa Benchmark
              </button>
              {rateSyncStatus === 'live' && lastRateSyncTime && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Last updated {lastRateSyncTime}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Cash & Bank Savings */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          id="toggle-cash-section-btn"
          onClick={() => toggleSection('cash')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                Cash & Bank Savings
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                In hand, savings accounts & deposits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatPKR(inputs.cashSavings)}
            </span>
            {collapsed.cash ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {!collapsed.cash && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Total Cash & Bank Balances (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                PKR
              </span>
              <input
                id="input-cash-savings"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputs.cashSavings ? inputs.cashSavings.toString() : ''}
                onChange={(e) => handleNumericInput('cashSavings', e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-3 py-2.5 text-base bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 dark:text-white font-semibold tabular-nums"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1 leading-[1.48]">
              <span>Include current accounts, prize bonds, and uncommitted cash reserves.</span>
            </p>
          </div>
        )}
      </div>

      {/* 4. Gold Assets */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          id="toggle-gold-section-btn"
          onClick={() => toggleSection('gold')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-[#C59B27] dark:text-[#E5C158]">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Gold
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded-sm">
                  {inputs.goldPurity}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Jewelry, coins & bars
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#C59B27] dark:text-[#E5C158] tabular-nums">
              {formatPKR(goldTotalValue)}
            </span>
            {collapsed.gold ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {!collapsed.gold && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select Gold Purity (Karat)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['24K', '22K', '21K', '18K'] as GoldPurity[]).map((karat) => {
                  const isSelected = inputs.goldPurity === karat;
                  return (
                    <button
                      key={karat}
                      type="button"
                      id={`purity-btn-${karat}`}
                      onClick={() => onChange({ goldPurity: karat })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition flex flex-col items-center border ${
                        isSelected
                          ? 'bg-[#0F4C3A] text-white border-[#0F4C3A] shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{karat}</span>
                      <span
                        className={`text-[9px] font-medium ${
                          isSelected ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {karat === '24K'
                          ? '100% pure'
                          : karat === '22K'
                          ? '91.6% pure'
                          : karat === '21K'
                          ? '87.5% pure'
                          : '75.0% pure'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gold Weight (Grams)
              </label>
              <div className="relative">
                <input
                  id="input-gold-grams"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={inputs.goldGrams ? inputs.goldGrams.toString() : ''}
                  onChange={(e) => handleNumericInput('goldGrams', e.target.value)}
                  placeholder="0.0"
                  className="w-full pl-3 pr-10 py-2.5 text-base bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 dark:text-white font-semibold tabular-nums"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  grams
                </span>
              </div>
            </div>

            {inputs.goldGrams > 0 && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Pure 24K equivalent: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{formatGrams(goldPureGrams)}</strong>
                </span>
                <span className="font-semibold text-[#C59B27] dark:text-[#E5C158] tabular-nums">
                  {formatPKR(goldTotalValue)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Silver Assets */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          id="toggle-silver-section-btn"
          onClick={() => toggleSection('silver')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Gem className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                Silver (Chandi)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Silver coins, bars & utensils
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatPKR(silverTotalValue)}
            </span>
            {collapsed.silver ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {!collapsed.silver && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Silver Weight (Grams)
            </label>
            <div className="relative">
              <input
                id="input-silver-grams"
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                value={inputs.silverGrams ? inputs.silverGrams.toString() : ''}
                onChange={(e) => handleNumericInput('silverGrams', e.target.value)}
                placeholder="0.0"
                className="w-full pl-3 pr-10 py-2.5 text-base bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 dark:text-white font-semibold tabular-nums"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                grams
              </span>
            </div>
            {inputs.silverGrams > 0 && (
              <p className="text-xs text-right text-slate-500 dark:text-slate-400 mt-1 font-semibold tabular-nums">
                Value: {formatPKR(silverTotalValue)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 6. Business & Investment */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          id="toggle-business-section-btn"
          onClick={() => toggleSection('business')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                Business & Investments
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Trade goods stock, mutual funds, shares
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 tabular-nums">
              {formatPKR(inputs.businessValue)}
            </span>
            {collapsed.business ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {!collapsed.business && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Net Value of Trade Goods & Investments (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">
                PKR
              </span>
              <input
                id="input-business-value"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputs.businessValue ? inputs.businessValue.toString() : ''}
                onChange={(e) => handleNumericInput('businessValue', e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-3 py-2.5 text-base bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900 dark:text-white font-semibold tabular-nums"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-[1.48]">
              Include wholesale/retail stock for sale. Fixed machinery and company office spaces are exempt.
            </p>
          </div>
        )}
      </div>

      {/* 7. Deductible Liabilities */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950 shadow-xs">
        <button
          type="button"
          id="toggle-liabilities-section-btn"
          onClick={() => toggleSection('liabilities')}
          className="w-full flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold tracking-wide text-rose-900 dark:text-rose-300">
                Short-term Debts & Liabilities
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Immediate debts subtracted from wealth
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
              -{formatPKR(inputs.liabilities)}
            </span>
            {collapsed.liabilities ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {!collapsed.liabilities && (
          <div className="p-3.5 pt-0 border-t border-rose-100 dark:border-rose-900/50 mt-2">
            <label className="block text-xs font-medium text-rose-800 dark:text-rose-300 mb-1">
              Debts Due Immediately or Short-term (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-rose-400 font-medium">
                PKR
              </span>
              <input
                id="input-liabilities"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputs.liabilities ? inputs.liabilities.toString() : ''}
                onChange={(e) => handleNumericInput('liabilities', e.target.value)}
                placeholder="0"
                className="w-full pl-12 pr-3 py-2.5 text-base bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden text-rose-950 dark:text-rose-100 font-semibold tabular-nums"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-[1.48]">
              Only include unpaid bills, credit card balances, or debts that are payable immediately.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Running Total Bar */}
      <div className="fixed bottom-[60px] left-0 right-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium">Net Zakatable Wealth</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                ({nisabMethod === 'silver' ? 'Silver Nisab' : 'Gold Nisab'})
              </span>
            </div>
            <div className="text-base font-bold text-[#0F4C3A] dark:text-emerald-400 tabular-nums">
              {formatPKR(netWealth)}
            </div>
            <div className="text-[10px] text-slate-400 tabular-nums">
              Assets: {formatPKR(totalAssets)} • Debts: {formatPKR(inputs.liabilities)}
            </div>
          </div>

          <button
            type="button"
            id="calculate-zakat-btn"
            onClick={onCalculate}
            disabled={relevantRateMissing}
            title={relevantRateMissing ? `Please enter the ${nisabMethod} rate to view result` : 'View Result'}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition-all shrink-0 font-heading tracking-wide ${
              relevantRateMissing
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#0F4C3A] hover:bg-[#0d4131] active:bg-[#0a3327] text-white active:scale-[0.98]'
            }`}
          >
            <span>View Result</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
