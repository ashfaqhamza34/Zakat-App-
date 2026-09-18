import React from 'react';
import { WifiOff, RefreshCw, Edit3, ShieldCheck, X } from 'lucide-react';

interface OfflineRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const OfflineRatesModal: React.FC<OfflineRatesModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  isRetrying = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="offline-rates-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="offline-rates-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-slate-800 dark:text-slate-100 overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Icon Badge */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-inner">
            <WifiOff className="h-7 w-7" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
              !
            </span>
          </div>

          <h3 className="font-heading text-base font-semibold tracking-wide text-slate-900 dark:text-white">
            Connect to Internet for Live Rates
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            To automatically sync today's live All Pakistan Sarafa market rates, please connect your device to <strong className="text-slate-700 dark:text-slate-300">Wi-Fi</strong> or <strong className="text-slate-700 dark:text-slate-300">mobile data</strong>.
          </p>
        </div>

        {/* Offline Helper Points */}
        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-3 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <Edit3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Manual override available:</strong> You can directly type today's per-gram or per-tola rates from your local jeweler.
            </span>
          </div>
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>100% Offline:</strong> Pre-set Pakistani benchmark rates (Rs. 26,500/g Gold, Rs. 310/g Silver) are active and ready.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            id="retry-live-rates-btn"
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3d2e] active:bg-[#093024] text-white text-xs font-heading font-semibold tracking-wide shadow-xs transition disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Checking connection...' : 'Retry Live Sync'}</span>
          </button>

          <button
            type="button"
            id="continue-manual-rates-btn"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
          >
            Enter Rates Manually / Use Offline Rates
          </button>
        </div>
      </div>
    </div>
  );
};
