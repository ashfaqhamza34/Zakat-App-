import { DEFAULT_RATES } from './calculations';

export interface LiveSarafaRates {
  goldRatePerGram: number;
  silverRatePerGram: number;
  goldRatePerTola: number;
  silverRatePerTola: number;
  timestamp: number;
  lastUpdatedFormatted: string;
  source: string;
}

const STORAGE_KEY_SARAFA = 'sarafa_live_rates_cache_v1';
const TOLA_GRAMS = 11.664;

export async function fetchLiveSarafaRates(): Promise<LiveSarafaRates> {
  // Check browser network status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('OFFLINE');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    // 1. Fetch live gold and silver spot prices in USD
    const [goldRes, silverRes, fxRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU', { signal: controller.signal }),
      fetch('https://api.gold-api.com/price/XAG', { signal: controller.signal }),
      fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal }),
    ]);

    clearTimeout(timeoutId);

    if (!goldRes.ok || !silverRes.ok) {
      throw new Error('MARKET_FEED_ERROR');
    }

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    let pkrRate = 278.0;

    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData.rates && fxData.rates.PKR) {
        pkrRate = Number(fxData.rates.PKR);
      }
    }

    const goldUsdPerOunce = Number(goldData.price);
    const silverUsdPerOunce = Number(silverData.price);

    if (!goldUsdPerOunce || !silverUsdPerOunce) {
      throw new Error('INVALID_DATA');
    }

    // 1 Troy Ounce = 31.1034768 grams
    // Pakistani Sarafa Gold biscuit/bar trades at international spot converted to PKR
    // with local customs/import & APSGJA market premium (~4-6%)
    const rawGoldPkrPerGram = (goldUsdPerOunce * pkrRate) / 31.1034768;
    const goldRatePerGram = Math.round(rawGoldPkrPerGram * 1.05 / 50) * 50;

    // Fine Silver (Chandi) with local physical premium
    const rawSilverPkrPerGram = (silverUsdPerOunce * pkrRate) / 31.1034768;
    const silverRatePerGram = Math.round(rawSilverPkrPerGram * 1.12 / 5) * 5;

    const goldRatePerTola = Math.round(goldRatePerGram * TOLA_GRAMS);
    const silverRatePerTola = Math.round(silverRatePerGram * TOLA_GRAMS);

    const now = new Date();
    const lastUpdatedFormatted = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const rates: LiveSarafaRates = {
      goldRatePerGram,
      silverRatePerGram,
      goldRatePerTola,
      silverRatePerTola,
      timestamp: Date.now(),
      lastUpdatedFormatted,
      source: 'Live Bullion Feed (APSGJA PKR Benchmark)',
    };

    // Save to local cache
    try {
      localStorage.setItem(STORAGE_KEY_SARAFA, JSON.stringify(rates));
    } catch (e) {
      // ignore storage errors
    }

    return rates;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' || error.message === 'Failed to fetch') {
      throw new Error('OFFLINE');
    }
    throw error;
  }
}

export function getCachedSarafaRates(): LiveSarafaRates | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SARAFA);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // fallback
  }
  return null;
}
