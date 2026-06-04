import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { currencyService } from '../services/api';
import { exchangeApiService } from '../services/exchangeApi';
import { useExchangeRates } from './useExchangeRates';
import { getCurrencyMetadata, SUPPORTED_CURRENCIES } from '../data/currencies';
import type { HistoricalRate, Currency } from '../types';

export function useCurrency() {
  const [currencies, setCurrencies] = useState<Currency[]>(SUPPORTED_CURRENCIES);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  
  // Manage raw input as a string to allow fluid typing of decimal points
  const [amountInput, setAmountInput] = useState('1');
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  // Parse and validate the string amount dynamically
  const amount = useMemo(() => {
    const parsed = Number.parseFloat(amountInput);
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      return 0;
    }
    if (parsed < 0) return 0;
    if (parsed > 1e15) return 1e15; // Enforce safe numeric upper boundary
    return parsed;
  }, [amountInput]);

  // Hook into the new real-time exchange rates fetcher
  const {
    rates,
    loading: loadingRates,
    error: ratesError,
    lastUpdated,
    refetch: refetchRates,
    convert,
  } = useExchangeRates(fromCurrency);

  // Historical chart states
  const [historicalRates, setHistoricalRates] = useState<HistoricalRate[]>([]);
  const [chartDays, setChartDays] = useState(30);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const historyRequestRef = useRef<number>(0);

  // Load list of supported currencies from API on mount
  useEffect(() => {
    async function loadCurrencies() {
      setLoadingCurrencies(true);
      try {
        const ratesResponse = await exchangeApiService.getLatestRates('USD');
        const codes = Object.keys(ratesResponse.rates);
        const compiled = codes.map((code) => getCurrencyMetadata(code));
        compiled.sort((a, b) => a.code.localeCompare(b.code));

        if (compiled.length > 0) {
          setCurrencies(compiled);
        }
      } catch (err) {
        console.error('Failed to load dynamic currencies, using defaults:', err);
      } finally {
        setLoadingCurrencies(false);
      }
    }
    loadCurrencies();
  }, []);

  // Perform conversion calling the backend API POST /convert
  useEffect(() => {
    if (amount <= 0) {
      Promise.resolve().then(() => {
        setResult(0);
      });
      return;
    }

    let active = true;

    async function performConversion() {
      try {
        const data = await convert(fromCurrency, toCurrency, amount);
        if (active) {
          setRate(data.exchangeRate);
          setResult(data.convertedAmount);
        }
      } catch (err) {
        console.error('Conversion failed, falling back to local calculation:', err);
        const currentRate = rates[toCurrency];
        if (active) {
          if (currentRate === undefined) {
            setRate(null);
            setResult(null);
          } else {
            setRate(currentRate);
            setResult(amount * currentRate);
          }
        }
      }
    }

    performConversion();

    return () => {
      active = false;
    };
  }, [amount, fromCurrency, toCurrency, rates, convert]);

  // Fetch historical data for charts
  const fetchHistory = useCallback(async (from: string, to: string, days: number) => {
    const requestId = ++historyRequestRef.current;
    Promise.resolve().then(() => {
      if (requestId === historyRequestRef.current) {
        setLoadingHistory(true);
      }
    });
    try {
      const data = await currencyService.getHistoricalRates(from, to, days);
      if (requestId === historyRequestRef.current) {
        setHistoricalRates(data);
      }
    } catch (err: unknown) {
      if (requestId === historyRequestRef.current) {
        console.error('History fetch failed:', err);
      }
    } finally {
      if (requestId === historyRequestRef.current) {
        setLoadingHistory(false);
      }
    }
  }, []);

  // Effect to load chart history on source/target changes
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchHistory(fromCurrency, toCurrency, chartDays);
    });
  }, [fromCurrency, toCurrency, chartDays, fetchHistory]);

  // Swap currencies
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  return {
    currencies,
    loadingCurrencies,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    amount,
    setAmount: (val: number) => setAmountInput(String(val)),
    amountInput,
    setAmountInput,
    result,
    rate,
    loading: loadingRates || loadingCurrencies,
    error: ratesError,
    lastUpdated,
    historicalRates,
    chartDays,
    setChartDays,
    loadingHistory,
    swapCurrencies,
    triggerConvert: refetchRates,
    triggerFetchHistory: () => fetchHistory(fromCurrency, toCurrency, chartDays),
  };
}
