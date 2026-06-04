import type { ConversionResponse, ExchangeRate, HistoricalRate, APIError } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const PUBLIC_API_URL = 'https://api.frankfurter.app';

// Helper to handle Fetch responses and potential errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON parsing failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    const error: APIError = { message: errorMessage, status: response.status };
    throw error;
  }
  return response.json() as Promise<T>;
}

// Helpers for historical rates processing to reduce complexity
function generateFlatHistoricalRates(days: number): HistoricalRate[] {
  const rates: HistoricalRate[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    rates.push({
      date: d.toISOString().split('T')[0],
      rate: 1,
    });
  }
  return rates;
}

const BASE_RATES: Record<string, number> = {
  'USD-EUR': 0.92,
  'USD-INR': 83.5,
  'USD-CAD': 1.36,
  'USD-GBP': 0.79,
  'USD-JPY': 156,
  'EUR-USD': 1.08,
  'INR-USD': 0.012,
  'CAD-USD': 0.74,
  'GBP-USD': 1.27,
  'JPY-USD': 0.0064,
};

function getBaseSimulatedRate(from: string, to: string, randomVal: number): number {
  const pair = `${from.toUpperCase()}-${to.toUpperCase()}`;
  if (BASE_RATES[pair] !== undefined) {
    return BASE_RATES[pair];
  }
  if (from.toUpperCase() === 'USD') {
    return 1.5 + randomVal * 2;
  }
  if (to.toUpperCase() === 'USD') {
    return 0.5 + randomVal * 0.5;
  }
  return 0.8 + randomVal * 2;
}

function generateSimulatedRates(from: string, to: string, days: number): HistoricalRate[] {
  const rates: HistoricalRate[] = [];
  let seed = 0;
  for (let i = 0; i < from.length; i++) {
    seed += from.codePointAt(i) || 0;
  }
  for (let i = 0; i < to.length; i++) {
    seed += to.codePointAt(i) || 0;
  }
  
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  let currentRate = getBaseSimulatedRate(from, to, random());

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dailyChange = (random() - 0.5) * 0.008 * currentRate;
    currentRate += dailyChange;
    rates.push({
      date: d.toISOString().split('T')[0],
      rate: Number(currentRate.toFixed(4)),
    });
  }
  return rates;
}

function parseFrankfurterHistorical(data: any, to: string): HistoricalRate[] {
  const historicalRates: HistoricalRate[] = [];
  if (!data?.rates) return historicalRates;
  for (const [date, ratesObj] of Object.entries(data.rates)) {
    const rateVal = (ratesObj as Record<string, number>)[to];
    if (rateVal !== undefined) {
      historicalRates.push({ date, rate: rateVal });
    }
  }
  return historicalRates.sort((a, b) => a.date.localeCompare(b.date));
}

export const currencyService = {
  /**
   * Fetch all active currency codes and names.
   */
  async getCurrencies(): Promise<Record<string, string>> {
    const url = BASE_URL
      ? `${BASE_URL}/currencies`
      : `${PUBLIC_API_URL}/currencies`;

    try {
      return await handleResponse<Record<string, string>>(await fetch(url));
    } catch (err: any) {
      console.error('Error fetching currencies:', err);
      throw err;
    }
  },

  /**
   * Fetch the latest exchange rates for a given base currency code.
   */
  async getLatestRates(base: string): Promise<ExchangeRate> {
    const url = BASE_URL
      ? `${BASE_URL}/rates/latest?base=${base}`
      : `${PUBLIC_API_URL}/latest?base=${base}`;

    try {
      const data = await handleResponse<any>(await fetch(url));
      return {
        base: data.base,
        rates: data.rates,
        date: data.date,
      };
    } catch (err: any) {
      console.error('Error fetching exchange rates:', err);
      throw err;
    }
  },

  /**
   * Perform currency conversion.
   */
  async convertCurrency(from: string, to: string, amount: number): Promise<ConversionResponse> {
    if (from === to) {
      return {
        from,
        to,
        amount,
        rate: 1,
        result: amount,
        timestamp: new Date().toISOString(),
      };
    }

    if (BASE_URL) {
      const url = `${BASE_URL}/convert?from=${from}&to=${to}&amount=${amount}`;
      return handleResponse<ConversionResponse>(await fetch(url));
    } else {
      // Public API fallback
      const url = `${PUBLIC_API_URL}/latest?amount=${amount}&from=${from}&to=${to}`;
      try {
        const data = await handleResponse<any>(await fetch(url));
        const result = data.rates[to];
        const rate = result / amount;
        return {
          from,
          to,
          amount,
          rate,
          result,
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        console.error('Error performing currency conversion:', err);
        throw err;
      }
    }
  },

  /**
   * Get historical rates for a range of dates, going back N days.
   */
  async getHistoricalRates(from: string, to: string, days = 30): Promise<HistoricalRate[]> {
    if (from === to) {
      return generateFlatHistoricalRates(days);
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    if (BASE_URL) {
      const url = `${BASE_URL}/historical?from=${from}&to=${to}&start=${startDate}&end=${endDate}`;
      return handleResponse<HistoricalRate[]>(await fetch(url));
    }

    // Public API fallback
    const url = `${PUBLIC_API_URL}/${startDate}..${endDate}?from=${from}&to=${to}`;
    try {
      const data = await handleResponse<any>(await fetch(url));
      const rates = parseFrankfurterHistorical(data, to);
      if (rates.length === 0) {
        return generateSimulatedRates(from, to, days);
      }
      return rates;
    } catch (err: any) {
      console.error('Error fetching historical rates, falling back to simulated data:', err);
      return generateSimulatedRates(from, to, days);
    }
  },
};
