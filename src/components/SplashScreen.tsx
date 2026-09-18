import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { ZakatAyah, getRandomZakatAyah } from '../data/zakatAyat';

interface SplashScreenProps {
  onFinish: () => void;
  // Optional pre-selected ayah (for manual previews/reflections)
  initialAyah?: ZakatAyah;
}

const SPLASH_DURATION_MS = 3800; // 3.8 seconds
const SKIP_DELAY_MS = 1500; // Skippable after 1.5 seconds

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, initialAyah }) => {
  // Select random Quranic Ayah once on mount
  const [ayah] = useState<ZakatAyah>(() => initialAyah || getRandomZakatAyah());
  const [canSkip, setCanSkip] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const handleComplete = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    const fadeTimer = setTimeout(() => {
      onFinish();
    }, 450); // Match fade transition duration
    timersRef.current.push(fadeTimer);
  };

  const handleContainerClick = () => {
    if (canSkip && !isFadingOut) {
      handleComplete();
    }
  };

  useEffect(() => {
    // 1. Enable skip option after 1.5s
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, SKIP_DELAY_MS);
    timersRef.current.push(skipTimer);

    // 2. Auto-finish after loading completes (3.8s)
    const autoFinishTimer = setTimeout(() => {
      handleComplete();
    }, SPLASH_DURATION_MS);
    timersRef.current.push(autoFinishTimer);

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div
      id="zakat-splash-screen"
      onClick={handleContainerClick}
      className={`relative flex flex-col justify-between items-center w-full h-full min-h-[600px] select-none p-6 text-slate-100 bg-gradient-to-b from-[#061a14] via-[#0b241c] to-[#040e0b] overflow-hidden transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
      } ${canSkip ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Background Decorative Glow / Islamic Arch Geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#C59B27]/5 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-700/10 blur-2xl" />
      </div>

      {/* Top Section: App Branding & Spiritual Header */}
      <div className="relative z-10 flex flex-col items-center pt-4 text-center">
        {/* Emblem */}
        <div className="relative mb-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0F4C3A] to-[#07241b] border border-[#C59B27]/50 flex items-center justify-center shadow-lg shadow-black/40">
            <BookOpen className="h-7 w-7 text-[#FFE082]" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C59B27] text-[9px] font-bold text-slate-950">
            ★
          </span>
        </div>

        <h1 className="font-heading text-lg font-semibold tracking-wide text-white flex items-center gap-1.5">
          Zakat Calculator
          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/60">
            Pakistan
          </span>
        </h1>
        <p className="text-[11px] text-emerald-200/70 font-medium tracking-normal mt-0.5">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>

      {/* Middle Section: Random Quranic Ayah with scrollable fallback for long text */}
      <div className="relative z-10 w-full max-w-sm my-auto py-2">
        <div className="relative rounded-2xl bg-black/25 backdrop-blur-xs border border-emerald-800/30 p-5 sm:p-6 shadow-xl text-center max-h-[360px] overflow-y-auto">
          {/* Subtle Decorative Star Icon */}
          <div className="flex justify-center mb-2.5">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FFE082] uppercase tracking-wider bg-[#C59B27]/15 px-2.5 py-0.5 rounded-full border border-[#C59B27]/30">
              <Sparkles className="h-3 w-3 text-[#FFE082]" />
              <span>Quranic Guidance on Zakat</span>
            </div>
          </div>

          {/* Translation */}
          <blockquote className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed text-center italic tracking-normal">
            "{ayah.translation}"
          </blockquote>

          {/* Reference & Translator */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col items-center">
            <span className="font-heading text-xs font-semibold text-[#FFE082] tracking-wide">
              {ayah.reference}
            </span>
            <span className="text-[11px] text-emerald-200/70 font-medium mt-0.5">
              — {ayah.translator}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Slim Animated Loading Bar & Skip Hint */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center pb-4">
        {/* Loading Bar Container */}
        <div className="w-full bg-slate-950/70 border border-emerald-800/40 rounded-full h-1.5 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#C59B27] to-[#FFE082] animate-splash-progress shadow-[0_0_8px_rgba(255,224,130,0.5)]"
          />
        </div>

        {/* Status / Skip Prompt */}
        <div className="h-7 mt-3 flex items-center justify-center">
          {canSkip ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-200/80 hover:text-white transition-opacity duration-300 animate-fade-in px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40"
            >
              <span>Tap to skip</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          ) : (
            <span className="text-[11px] text-emerald-300/50 font-medium tracking-normal">
              Loading calculator...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
