import React from 'react';
import { ArrowLeft, RotateCcw, Settings, BookOpen } from 'lucide-react';
import { ScreenTab } from '../types';

interface TopAppBarProps {
  currentTab: ScreenTab;
  onNavigate: (tab: ScreenTab) => void;
  onReset?: () => void;
  onShowSplash?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onNavigate,
  onReset,
  onShowSplash,
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'input':
        return 'Zakat Calculator';
      case 'result':
        return 'Calculation Breakdown';
      case 'chat':
        return 'AI Zakat Assistant';
      case 'settings':
        return 'Settings & Nisab';
    }
  };

  const getSubtitle = () => {
    switch (currentTab) {
      case 'input':
        return 'Pakistan • PKR Currency';
      case 'result':
        return 'Eligible & Payable Zakat';
      case 'chat':
        return 'Islamic Fiqh & Wealth Guidance';
      case 'settings':
        return 'Scholarly Standards';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F4C3A] text-white shadow-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side: Back button or App Icon */}
        <div className="flex items-center gap-3">
          {currentTab !== 'input' ? (
            <button
              id="top-app-bar-back-btn"
              onClick={() => onNavigate('input')}
              aria-label="Back to calculator"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800/80 border border-emerald-600/40 text-[#E5C158] font-bold text-lg shadow-inner">
              ☪
            </div>
          )}

          <div>
            <h1 className="font-heading text-base font-semibold leading-tight tracking-wide text-white flex items-center gap-1.5">
              {getTitle()}
              <span className="inline-flex items-center rounded-full bg-emerald-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200 border border-emerald-700/50 tracking-normal">
                PK
              </span>
            </h1>
            <p className="text-[11px] text-emerald-200/80 font-medium tracking-normal">{getSubtitle()}</p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {onShowSplash && (
            <button
              id="top-app-bar-splash-btn"
              onClick={onShowSplash}
              title="Quranic Ayah on Zakat"
              aria-label="View Quranic Ayah Reflection"
              className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-200 hover:text-white hover:bg-white/10 active:bg-white/20 transition"
            >
              <BookOpen className="h-4 w-4 text-[#FFE082]" />
            </button>
          )}

          {currentTab === 'input' && onReset && (
            <button
              id="top-app-bar-reset-btn"
              onClick={onReset}
              title="Reset all inputs"
              aria-label="Reset all inputs"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:bg-white/20 transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {currentTab !== 'settings' && (
            <button
              id="top-app-bar-settings-btn"
              onClick={() => onNavigate('settings')}
              title="Settings"
              aria-label="Open settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:bg-white/20 transition"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
