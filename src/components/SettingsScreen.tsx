import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Coins,
  BookOpen,
  Info,
  Check,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { NisabMethod, ZakatSettings } from '../types';
import { formatPKR } from '../utils/formatters';
import { DEFAULT_RATES, GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from '../utils/calculations';

interface SettingsScreenProps {
  nisabMethod: NisabMethod;
  goldRate: number;
  silverRate: number;
  onUpdateNisabMethod: (method: NisabMethod) => void;
  onResetRates: () => void;
  onShowSplash?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  nisabMethod,
  goldRate,
  silverRate,
  onUpdateNisabMethod,
  onResetRates,
  onShowSplash,
}) => {
  const silverThreshold = SILVER_NISAB_GRAMS * silverRate;
  const goldThreshold = GOLD_NISAB_GRAMS * goldRate;

  return (
    <div className="pb-24 pt-3 px-3 max-w-lg mx-auto space-y-4">
      {/* 1. Nisab Method Selection Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
              Nisab Standard in Pakistan
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Select which threshold benchmark to use
            </p>
          </div>
        </div>

        {/* Silver Nisab Option */}
        <label
          htmlFor="nisab-radio-silver"
          className={`relative flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
            nisabMethod === 'silver'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-500 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <input
            type="radio"
            id="nisab-radio-silver"
            name="nisabMethod"
            value="silver"
            checked={nisabMethod === 'silver'}
            onChange={() => onUpdateNisabMethod('silver')}
            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
                Silver Nisab
                <span className="text-[10px] bg-emerald-700 text-white font-medium px-1.5 py-0.2 rounded-full tracking-normal">
                  Recommended
                </span>
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatPKR(silverThreshold)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              <strong>612.36 grams</strong> (52.5 Tolas of Silver)
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-[1.48]">
              Favored by mainstream Pakistani scholarship (Darul Uloom Karachi, Jamia Ashrafia, Council of Islamic Ideology) when dealing with mixed cash/wealth, as it provides maximum benefit to deserving beneficiaries (Mustahiqeen).
            </p>
          </div>
        </label>

        {/* Gold Nisab Option */}
        <label
          htmlFor="nisab-radio-gold"
          className={`relative flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
            nisabMethod === 'gold'
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <input
            type="radio"
            id="nisab-radio-gold"
            name="nisabMethod"
            value="gold"
            checked={nisabMethod === 'gold'}
            onChange={() => onUpdateNisabMethod('gold')}
            className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-slate-300"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold tracking-wide text-slate-900 dark:text-white">
                Gold Nisab
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatPKR(goldThreshold)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              <strong>87.48 grams</strong> (7.5 Tolas of Gold)
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-[1.48]">
              Historically applied when an individual’s sole zakatable asset is gold only, without any cash, silver, or business stock.
            </p>
          </div>
        </label>
      </div>

      {/* 2. Zakat Rules & Hawl Summary Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600/15 text-teal-700 dark:text-teal-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
              Islamic Jurisprudence (Fiqh) Rules
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Key requirements for Pakistani Muslims
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-[#0F4C3A] font-bold mt-0.5">•</span>
            <div>
              <strong className="text-slate-800 dark:text-slate-200">The 1 Lunar Year Rule (Hawl):</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-[1.48]">
                Zakat only becomes obligatory after your wealth has remained at or above Nisab for a full Hijri year (approx 354 days).
              </p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-[#0F4C3A] font-bold mt-0.5">•</span>
            <div>
              <strong className="text-slate-800 dark:text-slate-200">Rate of 2.5%:</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-[1.48]">
                Exactly 1/40th (2.5%) of net surplus wealth is payable.
              </p>
            </div>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-[#0F4C3A] font-bold mt-0.5">•</span>
            <div>
              <strong className="text-slate-800 dark:text-slate-200">Exempt Personal Assets:</strong>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-[1.48]">
                Your residential home, personal commute vehicle, household appliances, clothing, and primary tools are not subject to Zakat.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* 3. Quranic Reflection Splash Screen */}
      {onShowSplash && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                  Quranic Ayah Reflection
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Launch splash screen with verified Zakat verses
                </p>
              </div>
            </div>

            <button
              type="button"
              id="view-splash-btn"
              onClick={onShowSplash}
              className="flex items-center gap-1.5 rounded-xl bg-[#0F4C3A] hover:bg-[#0d4131] text-white px-3 py-1.5 text-xs font-heading font-semibold tracking-wide shadow-xs transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#FFE082]" />
              <span>Show Ayah</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-[1.48]">
            Randomly selects and displays one of the six authentic Quranic ayat on Zakat obligations with the Sahih International English translation.
          </p>
        </div>
      )}

      {/* 4. Privacy & Offline Note */}
      <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-3 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <span>
          100% Offline & Private. No financial figures are stored on any server or sent across the internet.
        </span>
      </div>
    </div>
  );
};
