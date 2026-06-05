import type { ExchangeRate } from '../types';
import API_BASE_URL from '../config/api';

const BASE_URL = API_BASE_URL;
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes cache lifetime
const TIMEOUT_MS = 15000; // 15 seconds fetch timeout per attempt

interface CacheEntry {
  rates: Record<string, number>;
  lastUpdated: string;
  timestamp: number;
}

// In-memory cache mapping base currency codes to their rates
const ratesCache: Record<string, CacheEntry> = {};

/**
 * Fetch helper with automatic retries, timeout per attempt, and exponential backoff
 */
async function fetchWithTimeoutAndRetry(
  url: string,
  options: Omit<RequestInit, 'signal'> = {},
  retries = 3,
  delay = 1000,
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`Fetch failed (Reason: ${errorMsg}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithTimeoutAndRetry(url, options, retries - 1, delay * 2, timeoutMs);
    }
    throw err;
  }
}

export const exchangeApiService = {
  /**
   * Fetch latest exchange rates for base currency from backend
   */
  async getLatestRates(base: string): Promise<ExchangeRate> {
    const upperBase = base.toUpperCase();

    // 1. Check cache first
    const cached = ratesCache[upperBase];
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
      return {
        base: upperBase,
        rates: cached.rates,
        date: cached.lastUpdated,
      };
    }

    // 2. Fetch from Spring Boot backend
    const url = `${BASE_URL}/rates/${upperBase}`;

    try {
      const response = await fetchWithTimeoutAndRetry(url, {}, 3, 1500, TIMEOUT_MS);
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data.rates !== 'object') {
        throw new Error('Invalid API response: "rates" object not found.');
      }

      const dateStr = data.timestamp || new Date().toISOString();
      const baseCode = data.baseCurrency || upperBase;

      // 3. Write cache
      ratesCache[upperBase] = {
        rates: data.rates,
        lastUpdated: dateStr,
        timestamp: Date.now(),
      };

      return {
        base: baseCode,
        rates: data.rates,
        date: dateStr,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out due to slow network conditions.', { cause: err });
        }
        console.error(`Failed to fetch exchange rates for base: ${upperBase}`, err);
        throw err;
      }
      const wrappedErr = new Error(String(err), { cause: err });
      console.error(`Failed to fetch exchange rates for base: ${upperBase}`, wrappedErr);
      throw wrappedErr;
    }
  },

  /**
   * Perform currency conversion via Spring Boot backend POST /convert
   */
  async convert(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<{
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    exchangeRate: number;
    convertedAmount: number;
    timestamp: string;
  }> {
    const url = `${BASE_URL}/convert`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromCurrency,
        toCurrency,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
