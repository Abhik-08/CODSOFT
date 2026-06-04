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

  const handleSwap = () => {
    setIsSwapping(true);
    onSwap();
    setTimeout(() => {
      setIsSwapping(false);
    }, 500);
  };

  const fromSymbol = currencies.find((c) => c.code === fromCurrency)?.symbol || '';
  const toSymbol = currencies.find((c) => c.code === toCurrency)?.symbol || '';

  return (
    <div className="p-6 md:p-8 flex flex-col justify-between h-full font-cyber-body relative">
      {/* Circuit Trace Accent Overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-cyber-accent/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-cyber-accent/20 pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-sm font-bold text-cyber-accent tracking-widest uppercase flex items-center gap-2 font-cyber-headings">
          <span className="text-cyber-accent font-bold animate-pulse">&gt;</span>
          <span>SYS_CONVERSION</span>
          <span className="w-1.5 h-3.5 bg-cyber-accent animate-blink inline-block align-middle" />
        </h2>
        <span className="px-2.5 py-0.5 border border-cyber-accent-tertiary/30 text-[9px] font-bold text-cyber-accent-tertiary uppercase tracking-widest bg-cyber-accent-tertiary/10 font-cyber-accent">
          FEED_ACTIVE
        </span>
      </div>

      <div className="flex flex-col gap-5 relative z-10">
        <AmountInput
          value={amountInput}
          onChange={onChangeAmountInput}
          disabled={loading}
          symbol={fromSymbol}
        />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <CurrencySelect
            label="Source Code"
            value={fromCurrency}
            onChange={onChangeFromCurrency}
            currencies={currencies}
          />
          
          <div className="flex justify-center md:pb-0.5">
            <button
              onClick={handleSwap}
              type="button"
              className={`cyber-chamfer-sm p-3.5 bg-cyber-muted hover:bg-cyber-accent-secondary border border-cyber-accent-secondary/50 hover:border-cyber-accent-secondary text-cyber-accent-secondary hover:text-cyber-bg transition-all duration-300 font-cyber-accent text-sm flex items-center justify-center cursor-pointer hover:shadow-[0_0_12px_rgba(255,0,255,0.45)] rotate-90 md:rotate-0 ${
                isSwapping ? 'rotate-[270deg] md:rotate-180 scale-95' : ''
              }`}
              title="Swap Currencies"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          <CurrencySelect
            label="Target Code"
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
