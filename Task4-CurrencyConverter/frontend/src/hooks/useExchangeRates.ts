import { useState, useEffect, useCallback, useRef } from 'react';
import { exchangeApiService } from '../services/exchangeApi';
import API_BASE_URL from '../config/api';

export function useExchangeRates(baseCurrency: string) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Guard against race conditions from out-of-order fetches
  const requestCounterRef = useRef<number>(0);

  const fetchRates = useCallback(async (base: string) => {
    if (!base) return;

    const requestId = ++requestCounterRef.current;
    Promise.resolve().then(() => {
      if (requestId === requestCounterRef.current) {
        setLoading(true);
        setError(null);
        setRates({}); // Clear stale rates to prevent transient incorrect conversions
      }
    });

    try {
      console.debug(`Fetching latest rates for base ${base} from API: ${API_BASE_URL}`);
      const response = await exchangeApiService.getLatestRates(base);
      if (requestId === requestCounterRef.current) {
        setRates(response.rates);
        setLastUpdated(response.date || new Date().toISOString());
      }
    } catch (err: unknown) {
      if (requestId === requestCounterRef.current) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch real-time exchange rates.';
        setError(errorMsg);
      }
    } finally {
      if (requestId === requestCounterRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch rates on mount and whenever base currency changes
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchRates(baseCurrency);
    });
  }, [baseCurrency, fetchRates]);

  const refetch = useCallback(async () => {
    await fetchRates(baseCurrency);
  }, [baseCurrency, fetchRates]);

  const convert = useCallback(async (from: string, to: string, amount: number) => {
    return await exchangeApiService.convert(from, to, amount);
  }, []);

  return {
    rates,
    loading,
    error,
    lastUpdated,
    refetch,
    convert,
  };
}
