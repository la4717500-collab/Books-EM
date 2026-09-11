/**
 * Banco Central de Venezuela (BCV) Official Exchange Rate Service.
 * Fetches real-time official USD and EUR rates from the certified Venezuelan API (ve.dolarapi.com),
 * caches them locally, and automatically refreshes daily to ensure legal compliance with Venezuela's official rate.
 */

export interface BcvRates {
  usd: number; // e.g. 820.10
  eur: number; // e.g. 954.02
  lastUpdated: string; // Human date of the official BCV rate
  lastFetchedTimestamp: number; // Timestamp of when we fetched the API
  source: string; // 'Banco Central de Venezuela (BCV)'
  isLive: boolean; // Whether fetched from live API
}

export type CurrencyCode = 'USD' | 'EUR' | 'VES';

const STORAGE_KEY = 'books_em_bcv_rates';

// Fallback baseline rates if offline or API is momentarily unreachable
export const DEFAULT_BCV_RATES: BcvRates = {
  usd: 820.10,
  eur: 954.02,
  lastUpdated: new Date().toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  lastFetchedTimestamp: Date.now(),
  source: 'Banco Central de Venezuela (BCV)',
  isLive: false,
};

/**
 * Loads cached rates from localStorage or returns default.
 */
export function getStoredBcvRates(): BcvRates {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.usd === 'number' && typeof parsed.eur === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cached BCV rates:', e);
  }
  return DEFAULT_BCV_RATES;
}

/**
 * Saves rates to localStorage.
 */
export function saveBcvRates(rates: BcvRates): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
  } catch (e) {
    console.warn('Error saving BCV rates to storage:', e);
  }
}

/**
 * Checks if the cached rates are from today.
 * If not from today (or if forced), fetches new official rates from the API.
 */
export async function syncBcvRates(force: boolean = false): Promise<BcvRates> {
  const cached = getStoredBcvRates();
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  // If cached recently (less than 1 hour ago) and not forced, reuse
  if (!force && cached.isLive && now - cached.lastFetchedTimestamp < ONE_HOUR) {
    return cached;
  }

  try {
    // Fetch USD and EUR official rates in parallel with a 6-second abort controller timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const [usdRes, eurRes] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }),
      fetch('https://ve.dolarapi.com/v1/euros/oficial', {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }),
    ]);
    clearTimeout(timeoutId);

    if (!usdRes.ok || !eurRes.ok) {
      throw new Error(`API error: USD status ${usdRes.status}, EUR status ${eurRes.status}`);
    }

    const usdData = await usdRes.json();
    const eurData = await eurRes.json();

    const usdRate = Number(usdData.promedio) || cached.usd || DEFAULT_BCV_RATES.usd;
    const eurRate = Number(eurData.promedio) || cached.eur || DEFAULT_BCV_RATES.eur;

    // Format human-readable update date
    let dateStr = cached.lastUpdated;
    if (usdData.fechaActualizacion) {
      try {
        const d = new Date(usdData.fechaActualizacion);
        dateStr = d.toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        dateStr = new Date().toLocaleDateString('es-VE');
      }
    }

    const updatedRates: BcvRates = {
      usd: usdRate,
      eur: eurRate,
      lastUpdated: dateStr,
      lastFetchedTimestamp: now,
      source: 'Banco Central de Venezuela (BCV)',
      isLive: true,
    };

    saveBcvRates(updatedRates);
    return updatedRates;
  } catch (error) {
    console.warn('Could not refresh BCV rates from API, using cached/fallback:', error);
    return {
      ...cached,
      isLive: false,
    };
  }
}

/**
 * Currency symbols mapping
 */
export function getCurrencySymbol(currency: CurrencyCode = 'USD'): string {
  switch (currency) {
    case 'EUR':
      return '€';
    case 'VES':
      return 'Bs.';
    case 'USD':
    default:
      return '$';
  }
}

/**
 * Format a number as currency with proper separators
 */
export function formatCurrencyAmount(
  amount: number,
  currency: CurrencyCode = 'USD',
  showSymbol: boolean = true
): string {
  const symbol = getCurrencySymbol(currency);
  const isVes = currency === 'VES';
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;

  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: isVes ? 2 : 2,
    maximumFractionDigits: isVes ? 2 : 2,
  }).format(safeAmount);

  if (!showSymbol) return formatted;
  if (currency === 'EUR') return `${formatted} €`;
  if (currency === 'VES') return `Bs. ${formatted}`;
  return `$${formatted}`;
}

/**
 * Converts an amount from one currency to another using official BCV rates.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: BcvRates
): number {
  if (from === to || !amount || isNaN(amount)) return amount;

  // Step 1: Convert `from` to Bolívares (VES)
  let amountInBs = 0;
  if (from === 'VES') {
    amountInBs = amount;
  } else if (from === 'USD') {
    amountInBs = amount * rates.usd;
  } else if (from === 'EUR') {
    amountInBs = amount * rates.eur;
  }

  // Step 2: Convert Bolívares (VES) to `to` currency
  if (to === 'VES') {
    return amountInBs;
  }
  if (to === 'USD') {
    return rates.usd > 0 ? amountInBs / rates.usd : 0;
  }
  if (to === 'EUR') {
    return rates.eur > 0 ? amountInBs / rates.eur : 0;
  }

  return amount;
}

/**
 * Returns a comprehensive calculation object for a publication price,
 * giving its exact value in Bolívares BCV, in USD, and in EUR.
 */
export interface PriceBcvBreakdown {
  originalPrice: number;
  originalCurrency: CurrencyCode;
  originalFormatted: string;
  bolivaresFormatted: string;
  bolivaresAmount: number;
  usdFormatted: string;
  usdAmount: number;
  eurFormatted: string;
  eurAmount: number;
  rateAppliedText: string;
}

export function calculateBcvBreakdown(
  price: number,
  currency: CurrencyCode = 'USD',
  rates: BcvRates
): PriceBcvBreakdown {
  const safePrice = Number(price) || 0;
  const bolivaresAmount = convertCurrency(safePrice, currency, 'VES', rates);
  const usdAmount = convertCurrency(safePrice, currency, 'USD', rates);
  const eurAmount = convertCurrency(safePrice, currency, 'EUR', rates);

  let rateAppliedText = '';
  if (currency === 'EUR') {
    rateAppliedText = `Tasa oficial BCV Euro: Bs. ${formatCurrencyAmount(rates.eur, 'VES', false)}`;
  } else if (currency === 'USD') {
    rateAppliedText = `Tasa oficial BCV Dólar: Bs. ${formatCurrencyAmount(rates.usd, 'VES', false)}`;
  } else {
    rateAppliedText = `Tasa oficial BCV: $ = Bs. ${formatCurrencyAmount(rates.usd, 'VES', false)} | € = Bs. ${formatCurrencyAmount(rates.eur, 'VES', false)}`;
  }

  return {
    originalPrice: safePrice,
    originalCurrency: currency,
    originalFormatted: formatCurrencyAmount(safePrice, currency),
    bolivaresFormatted: formatCurrencyAmount(bolivaresAmount, 'VES'),
    bolivaresAmount,
    usdFormatted: formatCurrencyAmount(usdAmount, 'USD'),
    usdAmount,
    eurFormatted: formatCurrencyAmount(eurAmount, 'EUR'),
    eurAmount,
    rateAppliedText,
  };
}
