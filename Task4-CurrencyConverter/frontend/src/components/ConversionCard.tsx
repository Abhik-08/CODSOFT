import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { CurrencySelect } from './CurrencySelect';
import { AmountInput } from './AmountInput';
import { ResultCard } from './ResultCard';
import type { Currency } from '../types';

interface ConversionCardProps {
  currencies: Currency[];
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  amountInput: string;
  onChangeAmountInput: (value: string) => void;
  onChangeFromCurrency: (code: string) => void;
  onChangeToCurrency: (code: string) => void;
  onSwap: () => void;
  result: number | null;
  rate: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export const ConversionCard: React.FC<ConversionCardProps> = ({
  currencies,
  fromCurrency,
  toCurrency,
  amount,
  amountInput,
  onChangeAmountInput,
  onChangeFromCurrency,
  onChangeToCurrency,
  onSwap,
  result,
  rate,
  loading,
  error,
  lastUpdated,
}) => {
  const [isSwapping, setIsSwapping] = useState(false);

  // Trigger rotation animation on click
  const handleSwap = () => {
    setIsSwapping(true);
    onSwap();
    setTimeout(() => {
      setIsSwapping(false);
    }, 500); // Matches the transition duration
  };

  // Find symbols for the selected currencies
  const fromSymbol = currencies.find((c) => c.code === fromCurrency)?.symbol || '';
  const toSymbol = currencies.find((c) => c.code === toCurrency)?.symbol || '';

  return (
    <div className="p-6 md:p-8 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Currency Converter</span>
        </h2>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
          Live Rates
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <AmountInput
          value={amountInput}
          onChange={onChangeAmountInput}
          disabled={loading}
          symbol={fromSymbol}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <CurrencySelect
            label="From"
            value={fromCurrency}
            onChange={onChangeFromCurrency}
            currencies={currencies}
          />
          
          <div className="flex justify-center md:pb-0.5">
            <button
              onClick={handleSwap}
              type="button"
              className={`p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all duration-500 font-semibold text-sm flex items-center justify-center shadow-lg shadow-black/20 hover:shadow-blue-500/5 rotate-90 md:rotate-0 ${
                isSwapping ? 'rotate-[270deg] md:rotate-180 scale-95' : ''
              }`}
              title="Swap Currencies"
            >
              <ArrowLeftRight className="h-5 w-5 text-blue-400" />
            </button>
          </div>

          <CurrencySelect
            label="To"
            value={toCurrency}
            onChange={onChangeToCurrency}
            currencies={currencies}
          />
        </div>

        <ResultCard
          amount={amount}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          result={result}
          rate={rate}
          loading={loading}
          error={error}
          fromSymbol={fromSymbol}
          toSymbol={toSymbol}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
};
