import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isOnline?: boolean;
  onToggleSimulateOffline?: () => void;
  isSimulatedOffline?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isOnline = true,
  onToggleSimulateOffline,
  isSimulatedOffline = false,
}) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:p-4 text-slate-100">
      {/* Top Device Mode Controls (visible on screens wider than mobile) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-medium">
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>Android Play Store Simulator</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleSimulateOffline && (
            <button
              type="button"
              id="toggle-network-btn"
              onClick={onToggleSimulateOffline}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                isSimulatedOffline
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60'
              }`}
              title={isSimulatedOffline ? 'Switch to Online Mode' : 'Test Offline Mode'}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span>Online (Wi-Fi)</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-amber-400" />
                  <span>Offline</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setIsPhoneFrame(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition text-xs font-semibold ${
                isPhoneFrame
                  ? 'bg-[#0F4C3A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Device Shell"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Phone</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition text-xs font-semibold ${
                !isPhoneFrame
                  ? 'bg-[#0F4C3A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Width View"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Full</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isPhoneFrame
            ? 'max-w-[430px] sm:border-[8px] sm:border-slate-800 sm:rounded-[44px] shadow-2xl overflow-hidden bg-slate-900 sm:ring-1 sm:ring-white/10'
            : 'max-w-2xl bg-slate-900 sm:rounded-3xl shadow-xl overflow-hidden sm:border sm:border-slate-800'
        }`}
      >
        {/* Android Status Bar */}
        <div className="h-7 bg-[#0F4C3A] text-white/90 px-5 flex items-center justify-between text-[11px] font-semibold tracking-normal select-none border-b border-white/10">
          <span className="tabular-nums">{currentTime}</span>

          {/* Camera Notch simulation on mobile frame */}
          {isPhoneFrame && (
            <div className="hidden sm:block h-3.5 w-3.5 rounded-full bg-black/60 mx-auto shadow-inner" />
          )}

          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3" />
            {isOnline ? (
              <span title="Wi-Fi Connected">
                <Wifi className="h-3 w-3" />
              </span>
            ) : (
              <span title="No Internet / Offline">
                <WifiOff className="h-3 w-3 text-amber-300 animate-pulse" />
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <span className="tabular-nums">98%</span>
              <BatteryMedium className="h-3.5 w-3.5 text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Child Screen Content */}
        <div className="min-h-[640px] max-h-[880px] overflow-y-auto bg-slate-50 dark:bg-slate-950 relative">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        {isPhoneFrame && (
          <div className="h-4 bg-white dark:bg-slate-900 flex items-center justify-center pointer-events-none">
            <div className="h-1 w-28 rounded-full bg-slate-400/40" />
          </div>
        )}
      </div>
    </div>
  );
};
