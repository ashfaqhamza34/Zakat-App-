import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AssetInputs, CalculationResult, GoldPurity, NisabMethod, ScreenTab } from './types';
import { calculateZakat, DEFAULT_RATES } from './utils/calculations';
import { fetchLiveSarafaRates } from './utils/sarafaService';
import { TopAppBar } from './components/TopAppBar';
import { NavigationBar } from './components/NavigationBar';
import { InputScreen } from './components/InputScreen';
import { ResultScreen } from './components/ResultScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ChatScreen } from './components/ChatScreen';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashScreen } from './components/SplashScreen';
import { OfflineRatesModal } from './components/OfflineRatesModal';

const STORAGE_KEY_INPUTS = 'zakat_calculator_inputs_v1';
const STORAGE_KEY_SETTINGS = 'zakat_calculator_settings_v1';

export default function App() {
  // Splash screen state: shown every time app opens
  const [showSplash, setShowSplash] = useState(true);

  // Network connection state
  const [browserOnline, setBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Effective online status
  const effectiveOnline = browserOnline && !isSimulatedOffline;

  // Rate synchronization state
  const [rateSyncStatus, setRateSyncStatus] = useState<'live' | 'offline' | 'fetching'>('offline');
  const [lastRateSyncTime, setLastRateSyncTime] = useState<string | undefined>();
  const [rateSource, setRateSource] = useState<string | undefined>();
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isRetryingRates, setIsRetryingRates] = useState(false);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Initial State with local storage retrieval
  const [inputs, setInputs] = useState<AssetInputs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INPUTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved inputs', e);
    }
    return {
      cashSavings: 0,
      goldGrams: 0,
      goldPurity: '24K' as GoldPurity,
      goldRatePerGram: DEFAULT_RATES.gold24kPerGram,
      silverGrams: 0,
      silverRatePerGram: DEFAULT_RATES.silverPerGram,
      businessValue: 0,
      liabilities: 0,
    };
  });

  const [nisabMethod, setNisabMethod] = useState<NisabMethod>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nisabMethod) return parsed.nisabMethod;
      }
    } catch (e) {
      console.warn('Could not read saved settings', e);
    }
    return 'silver'; // Default in Pakistan
  });

  const [currentTab, setCurrentTab] = useState<ScreenTab>('input');
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState(false);

  // Function to fetch live Sarafa rates from bullion API
  const handleFetchLiveRates = useCallback(async (silent = false) => {
    if (!effectiveOnline) {
      setRateSyncStatus('offline');
      if (!silent) {
        setShowOfflineModal(true);
      }
      return;
    }

    setRateSyncStatus('fetching');
    setIsRetryingRates(true);

    try {
      const liveRates = await fetchLiveSarafaRates();
      setInputs((prev) => ({
        ...prev,
        goldRatePerGram: liveRates.goldRatePerGram,
        silverRatePerGram: liveRates.silverRatePerGram,
      }));
      setRateSyncStatus('live');
      setLastRateSyncTime(liveRates.lastUpdatedFormatted);
      setRateSource(liveRates.source);
      setShowOfflineModal(false);
    } catch (error) {
      console.warn('Live rates fetch failed, keeping current/manual rates:', error);
      setRateSyncStatus('offline');
      if (!silent) {
        setShowOfflineModal(true);
      }
    } finally {
      setIsRetryingRates(false);
    }
  }, [effectiveOnline]);

  // Auto-fetch rates when app opens / after splash finishes
  useEffect(() => {
    if (!showSplash) {
      if (effectiveOnline) {
        // Connected to Wi-Fi/Internet -> auto-fetch live Sarafa market rates
        handleFetchLiveRates(true);
      } else {
        // Disconnected -> give pop-up for live rates: please connect to the internet
        setShowOfflineModal(true);
      }
    }
  }, [showSplash, effectiveOnline, handleFetchLiveRates]);

  // 2. Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INPUTS, JSON.stringify(inputs));
    } catch (e) {
      // safe fallback
    }
  }, [inputs]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify({ nisabMethod, goldRate: inputs.goldRatePerGram, silverRate: inputs.silverRatePerGram })
      );
    } catch (e) {
      // safe fallback
    }
  }, [nisabMethod, inputs.goldRatePerGram, inputs.silverRatePerGram]);

  // 3. Reactive calculation result
  const calculationResult: CalculationResult = useMemo(() => {
    return calculateZakat(inputs, nisabMethod);
  }, [inputs, nisabMethod]);

  const handleUpdateInputs = (partial: Partial<AssetInputs>) => {
    setInputs((prev) => ({ ...prev, ...partial }));
  };

  const handleResetInputs = () => {
    setInputs((prev) => ({
      ...prev,
      cashSavings: 0,
      goldGrams: 0,
      silverGrams: 0,
      businessValue: 0,
      liabilities: 0,
    }));
  };

  const handleCalculate = () => {
    setHasCalculatedOnce(true);
    setCurrentTab('result');
  };

  const handleResetRates = () => {
    setInputs((prev) => ({
      ...prev,
      goldRatePerGram: DEFAULT_RATES.gold24kPerGram,
      silverRatePerGram: DEFAULT_RATES.silverPerGram,
    }));
  };

  return (
    <AndroidFrame
      isOnline={effectiveOnline}
      onToggleSimulateOffline={() => setIsSimulatedOffline((prev) => !prev)}
      isSimulatedOffline={isSimulatedOffline}
    >
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <div className="flex flex-col min-h-[600px] animate-fade-in">
          {/* Top App Bar */}
          <TopAppBar
            currentTab={currentTab}
            onNavigate={(tab) => setCurrentTab(tab)}
            onReset={handleResetInputs}
            onShowSplash={() => setShowSplash(true)}
          />

          {/* Active Screen View */}
          <main className="flex-1 overflow-y-auto">
            {currentTab === 'input' && (
              <InputScreen
                inputs={inputs}
                nisabMethod={nisabMethod}
                onChange={handleUpdateInputs}
                onCalculate={handleCalculate}
                isOnline={effectiveOnline}
                rateSyncStatus={rateSyncStatus}
                lastRateSyncTime={lastRateSyncTime}
                rateSource={rateSource}
                onFetchLiveRates={() => handleFetchLiveRates(false)}
                onOpenOfflineModal={() => setShowOfflineModal(true)}
              />
            )}

            {currentTab === 'result' && (
              <ResultScreen
                result={calculationResult}
                onModifyInputs={() => setCurrentTab('input')}
                onAskAI={() => setCurrentTab('chat')}
              />
            )}

            {currentTab === 'chat' && (
              <ChatScreen
                calculationResult={calculationResult}
                inputs={inputs}
                isOnline={effectiveOnline}
                onOpenOfflineModal={() => setShowOfflineModal(true)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsScreen
                nisabMethod={nisabMethod}
                goldRate={inputs.goldRatePerGram}
                silverRate={inputs.silverRatePerGram}
                onUpdateNisabMethod={(method) => setNisabMethod(method)}
                onResetRates={handleResetRates}
                onShowSplash={() => setShowSplash(true)}
              />
            )}
          </main>

          {/* Material 3 Bottom Navigation Bar */}
          <NavigationBar
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            isCalculated={hasCalculatedOnce}
            isEligible={calculationResult.isEligible}
          />

          {/* Offline Rates Pop-up Modal */}
          <OfflineRatesModal
            isOpen={showOfflineModal}
            onClose={() => setShowOfflineModal(false)}
            onRetry={() => handleFetchLiveRates(false)}
            isRetrying={isRetryingRates}
          />
        </div>
      )}
    </AndroidFrame>
  );
}
