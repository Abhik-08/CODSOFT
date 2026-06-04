import React from 'react';

interface ResultCardProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  result: number | null;
  rate: number | null;
  loading: boolean;
  error?: string | null;
  fromSymbol?: string;
  toSymbol?: string;
  lastUpdated?: string | null;
}

/**
 * Format currency numbers safely using Intl.NumberFormat with local fallback defaults.
 */
function formatCurrency(val: number, currencyCode: string, fallbackSymbol = ''): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(val);
  } catch {
    const symbol = fallbackSymbol || currencyCode;
    const formattedNum = val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    return `${symbol} ${formattedNum}`;
  }
}

/**
 * Format timestamp to a localized date-time string
 */
function formatLocalTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

export const ResultCard: React.FC<ResultCardProps> = ({
  amount,
  fromCurrency,
  toCurrency,
  result,
  rate,
  loading,
  error = null,
  fromSymbol = '',
  toSymbol = '',
  lastUpdated = null,
}) => {
  let content;

  if (error) {
    // 1. Elegant Error Card UI
    content = (
      <div className="flex flex-col items-center justify-center text-center p-4 gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 text-lg shadow-lg">
          ⚠️
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Unable to fetch exchange rates</h4>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Please try again later. Network error or invalid API response detected.
          </p>
        </div>
      </div>
    );
  } else if (loading) {
    // 2. High-fidelity Skeleton Loader Placeholder
    content = (
      <div className="flex flex-col gap-4 animate-pulse">
        <div>
          <div className="h-3 w-28 bg-white/10 rounded-md mb-2" />
          <div className="h-4 w-16 bg-white/5 rounded-md mb-1.5" />
          <div className="h-9 w-[70%] bg-white/20 rounded-xl mt-1" />
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-24 bg-white/5 rounded" />
            <div className="h-3.5 w-32 bg-white/10 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-24 bg-white/5 rounded" />
            <div className="h-3.5 w-32 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  } else if (result !== null && rate !== null) {
    // 3. Conversion Results with Primary & Reverse Rates + Last Updated Time
    const formattedInput = formatCurrency(amount, fromCurrency, fromSymbol);
    const formattedResult = formatCurrency(result, toCurrency, toSymbol);
    
    const reverseRateVal = rate > 0 ? 1 / rate : 0;
    const formattedRate = formatCurrency(1, toCurrency, toSymbol).replace(/[\d.,]/g, '').trim() + ' ' + rate.toFixed(4);
    const formattedReverseRate = formatCurrency(1, fromCurrency, fromSymbol).replace(/[\d.,]/g, '').trim() + ' ' + reverseRateVal.toFixed(4);
    const updatedTime = formatLocalTimestamp(lastUpdated);

    content = (
      <div key={`${fromCurrency}-${toCurrency}-${result}`} className="animate-fade-in flex flex-col gap-3.5">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Conversion Result
          </span>
          <p className="text-sm text-slate-400 font-medium">
            {formattedInput} =
          </p>
          <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-50 to-cyan-300">
            {formattedResult}
          </p>
        </div>

        {/* Double-Sided Exchange Rates & Local Timestamp */}
        <div className="mt-3 pt-3.5 border-t border-white/5 flex flex-col gap-2.5 text-xs font-semibold">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Primary Rate</span>
            <span className="text-slate-200">1 {fromCurrency} = {formattedRate} {toCurrency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Reverse Rate</span>
            <span className="text-slate-200">1 {toCurrency} = {formattedReverseRate} {fromCurrency}</span>
          </div>
          
          {updatedTime && (
            <div className="mt-1 flex justify-between items-center text-[10px] text-slate-500 font-medium">
              <span>Last Updated</span>
              <span>{updatedTime}</span>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="text-center py-6 animate-fade-in">
        <p className="text-slate-400 text-sm font-medium">
          Enter an amount above to view currency conversions
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-5 md:p-6 bg-gradient-to-b from-white/5 to-white/[0.01] border border-white/5 rounded-2xl min-h-[110px] flex flex-col justify-center shadow-inner relative overflow-hidden transition-all duration-300">
      {content}
    </div>
  );
};
