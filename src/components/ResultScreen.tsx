import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Scale,
  Wallet,
  Coins,
  MinusCircle,
  PiggyBank,
  BadgeCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CalculationResult } from '../types';
import { formatPKR, formatGrams } from '../utils/formatters';
import { AnimatedCounter } from './AnimatedCounter';

interface ResultScreenProps {
  result: CalculationResult;
  onModifyInputs: () => void;
  onAskAI?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onModifyInputs,
  onAskAI,
}) => {
  const [copied, setCopied] = useState(false);
  const isEligible = result.isEligible;

  // If the relevant gold or silver rate is 0, show a distinct warning state instead of an invalid 0-nisab result
  if (result.relevantRateMissing) {
    const rateName = result.nisabMethod === 'gold' ? 'Gold (24K)' : 'Silver';
    return (
      <div className="pb-24 pt-3 px-3 max-w-lg mx-auto space-y-4">
        {/* Main Warning State Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600/60 text-white shadow-lg text-center">
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-3 bg-slate-600/50 text-slate-200 border border-slate-500/40 shadow-inner">
              <AlertCircle className="h-8 w-8 text-amber-300" />
            </div>

            <span className="text-xs uppercase tracking-widest font-semibold text-slate-300">
              Nisab Rate Required
            </span>

            <h2 className="font-heading text-2xl font-semibold mt-1 tracking-wide text-white">
              Rate Not Available
            </h2>

            <p className="text-xs text-slate-300 mt-2 max-w-xs leading-relaxed">
              The {rateName} market rate is required to calculate the Nisab threshold under the {result.nisabMethod === 'gold' ? 'Gold' : 'Silver'} standard. Please enter the current rate before a result can be shown.
            </p>

            <div className="my-5 w-full border-t border-slate-700" />

            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3 text-xs text-slate-300 text-left w-full space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-amber-400" />
                <span>Selected Standard: {result.nisabMethod === 'gold' ? 'Gold Nisab (87.48g)' : 'Silver Nisab (612.36g)'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Without the {result.nisabMethod} price per gram, your Nisab threshold cannot be evaluated.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button routing back to InputScreen */}
        <div className="pt-2">
          <button
            type="button"
            id="missing-rate-modify-inputs-btn"
            onClick={onModifyInputs}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F4C3A] hover:bg-[#0d4131] active:bg-[#0a3327] text-white py-3.5 px-4 font-heading font-semibold tracking-wide text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Enter {rateName} Rate</span>
          </button>
        </div>

        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-3 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            Tip: You can use the "Sync Live Rates" button on the Input screen to automatically fetch the latest Pakistani Sarafa market rates.
          </p>
        </div>
      </div>
    );
  }

  // Prepare text for sharing (formatted for WhatsApp / SMS / clipboard)
  const generateShareText = () => {
    const statusText = isEligible
      ? `✅ Zakat is MANDATORY\n💰 Total Zakat Due (2.5%): ${formatPKR(result.zakatDue)}`
      : `ℹ️ Not Eligible for Zakat\n📉 Shortfall to Nisab: ${formatPKR(result.shortfall)}`;

    const nisabText =
      result.nisabMethod === 'silver'
        ? `Silver Standard (612.36g / 52.5 Tola) = ${formatPKR(result.nisabThresholdPKR)}`
        : `Gold Standard (87.48g / 7.5 Tola) = ${formatPKR(result.nisabThresholdPKR)}`;

    return `🌙 *Zakat Calculation Summary (Pakistan)*
Generated via Zakat Calculator Pakistan (PKR)

• Gross Zakatable Assets: ${formatPKR(result.totalAssets)}
  - Cash & Bank: ${formatPKR(result.cashValue)}
  - Gold (${formatGrams(result.goldPureGrams)} 24K eq): ${formatPKR(result.goldValue)}
  - Silver: ${formatPKR(result.silverValue)}
  - Business/Trade: ${formatPKR(result.businessValue)}
• Deductible Liabilities: -${formatPKR(result.liabilities)}
--------------------------------
• Net Zakatable Wealth: ${formatPKR(result.netWealth)}
• Nisab Threshold: ${nisabText}
--------------------------------
${statusText}

_“And establish prayer and give Zakat...” (Al-Baqarah: 43)_`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Zakat Calculation Pakistan',
          text,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard error', err);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 max-w-lg mx-auto space-y-4">
      {/* 1. Main Status Banner with Animated Count-Up */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg transition-all ${
          isEligible
            ? 'bg-gradient-to-br from-[#0B3D2E] via-[#0F4C3A] to-[#15674F] border border-emerald-500/30'
            : 'bg-gradient-to-br from-[#78350F] via-[#92400E] to-[#B45309] border border-amber-500/30'
        }`}
      >
        {/* Subtle decorative Islamic pattern watermark */}
        <div className="absolute -right-6 -bottom-6 text-white/5 text-9xl select-none font-serif">
          ☪
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-3 shadow-inner ${
              isEligible
                ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30'
                : 'bg-amber-300/20 text-amber-200 border border-amber-300/30'
            }`}
          >
            {isEligible ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>

          <span className="text-xs uppercase tracking-widest font-semibold opacity-90">
            {isEligible ? 'Zakat Obligation Status' : 'Nisab Evaluation'}
          </span>

          <h2 className="font-heading text-2xl font-semibold mt-1 tracking-wide">
            {isEligible ? 'Zakat is Mandatory' : 'Not Eligible for Zakat'}
          </h2>

          <p className="text-xs text-white/85 mt-1.5 max-w-xs leading-[1.48]">
            {isEligible
              ? 'Your net wealth exceeds the applicable Nisab threshold. Zakat is due at 2.5%.'
              : 'Your net zakatable wealth is currently below the applicable Nisab threshold.'}
          </p>

          <div className="my-5 w-full border-t border-white/15" />

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-200/90 dark:text-emerald-100">
              {isEligible ? 'Total Zakat Payable (2.5%)' : 'Shortfall to Reach Nisab'}
            </span>
            <div className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-[#FFE082] drop-shadow-xs tabular-nums">
              {isEligible ? (
                <AnimatedCounter value={result.zakatDue} duration={1000} />
              ) : (
                <AnimatedCounter value={result.shortfall} duration={1000} />
              )}
            </div>
            {!isEligible && (
              <span className="text-[11px] text-amber-200 mt-1 leading-normal">
                Amount needed to reach the {result.nisabMethod} Nisab threshold
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Breakdown Cards List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#0F4C3A] dark:text-emerald-400" />
            Detailed Breakdown
          </h3>
          <span className="text-[11px] text-slate-400 font-medium tracking-normal">PKR Currency</span>
        </div>

        {/* Assets items */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              Cash & Bank Balances
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
              {formatPKR(result.cashValue)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              Gold Assets ({formatGrams(result.goldPureGrams)} 24K eq)
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
              {formatPKR(result.goldValue)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              Silver Assets
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
              {formatPKR(result.silverValue)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <PiggyBank className="h-3.5 w-3.5 text-teal-600" />
              Business Inventory & Shares
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
              {formatPKR(result.businessValue)}
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
            <span>Total Gross Assets</span>
            <span className="text-slate-900 dark:text-white tabular-nums">
              {formatPKR(result.totalAssets)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-rose-600 dark:text-rose-400 font-medium">
            <span className="flex items-center gap-2">
              <MinusCircle className="h-3.5 w-3.5" />
              Short-term Debts / Liabilities
            </span>
            <span className="tabular-nums">-{formatPKR(result.liabilities)}</span>
          </div>

          <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between font-bold text-sm text-[#0F4C3A] dark:text-emerald-400">
            <span className="font-heading tracking-wide">Net Zakatable Wealth</span>
            <span className="tabular-nums">{formatPKR(result.netWealth)}</span>
          </div>
        </div>
      </div>

      {/* 3. Nisab Benchmark Card */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Nisab Standard Applied:
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {result.nisabMethod === 'silver'
              ? 'Silver (612.36g / 52.5 Tolas)'
              : 'Gold (87.48g / 7.5 Tolas)'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Current Nisab Value in PKR:
          </span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatPKR(result.nisabThresholdPKR)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Wealth vs Nisab:</span>
          <span
            className={`font-semibold ${
              isEligible ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isEligible ? 'Exceeds Nisab (Eligible)' : 'Below Nisab (Not Due)'}
          </span>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Share Button */}
        <button
          type="button"
          id="share-result-btn"
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F4C3A] hover:bg-[#0d4131] active:bg-[#0a3327] text-white py-3 px-4 font-heading font-semibold tracking-wide text-sm shadow-md transition-all active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Copied Summary to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Share Result (WhatsApp / Text)</span>
            </>
          )}
        </button>

        {/* Ask AI Assistant Button */}
        {onAskAI && (
          <button
            type="button"
            id="result-ask-ai-btn"
            onClick={onAskAI}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-900 to-[#0F4C3A] hover:from-emerald-800 hover:to-[#135944] text-white py-3 px-4 font-heading font-semibold tracking-wide text-sm shadow-sm transition active:scale-[0.98] border border-emerald-600/30"
          >
            <Sparkles className="h-4 w-4 text-[#FFE082]" />
            <span>Ask Mufti AI About This Breakdown</span>
          </button>
        )}

        {/* Modify Inputs Button */}
        <button
          type="button"
          id="recalculate-btn"
          onClick={onModifyInputs}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-800 dark:text-slate-200 py-3 px-4 font-heading font-semibold tracking-wide text-sm transition"
        >
          <RotateCcw className="h-4 w-4 text-slate-500" />
          <span>Modify Inputs & Recalculate</span>
        </button>
      </div>

      {/* Islamic Reference Note */}
      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3 text-center">
        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-[1.48] font-medium">
          Note: Zakat is payable once in a lunar year (Hawl) upon completing one year above the Nisab threshold. Consult your local trusted scholar or Mufti for specialized business assets or debt disputes.
        </p>
      </div>
    </div>
  );
};
