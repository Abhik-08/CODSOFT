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
    content = (
      <div className="flex flex-col items-center justify-center text-center p-4 gap-3">
        <div className="cyber-chamfer-sm w-12 h-12 bg-cyber-destructive/10 border border-cyber-destructive/30 flex items-center justify-center text-cyber-destructive text-lg">
          ⚠️
        </div>
        <div>
          <h4 className="text-sm font-bold text-cyber-destructive mb-1 font-cyber-headings uppercase">
            {"// CONNECTION_ERROR"}
          </h4>
          <p className="text-xs text-cyber-muted-fg leading-relaxed font-cyber-body">
            Failed to sync exchange rates with host. Retrying connection protocol...
          </p>
        </div>
      </div>
    );
  } else if (loading) {
    content = (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-32 bg-cyber-accent/20 border border-cyber-accent/10" />
          <div className="h-10 w-[80%] bg-cyber-accent-tertiary/20 border border-cyber-accent-tertiary/10" />
        </div>
        <div className="mt-4 pt-4 border-t border-cyber-border/40 flex flex-col gap-3">
          <div className="h-3.5 w-full bg-cyber-muted-fg/20" />
          <div className="h-3.5 w-[70%] bg-cyber-muted-fg/20" />
        </div>
      </div>
    );
  } else if (result !== null && rate !== null) {
    const formattedInput = formatCurrency(amount, fromCurrency, fromSymbol);
    const formattedResult = formatCurrency(result, toCurrency, toSymbol);
    
    const reverseRateVal = rate > 0 ? 1 / rate : 0;
    const formattedRate = formatCurrency(1, toCurrency, toSymbol).replace(/[\d.,]/g, '').trim() + ' ' + rate.toFixed(4);
    const formattedReverseRate = formatCurrency(1, fromCurrency, fromSymbol).replace(/[\d.,]/g, '').trim() + ' ' + reverseRateVal.toFixed(4);
    const updatedTime = formatLocalTimestamp(lastUpdated);

    content = (
      <div key={`${fromCurrency}-${toCurrency}-${result}`} className="flex flex-col gap-3.5 font-cyber-body">
        <div>
          <span className="text-[10px] font-bold text-cyber-accent-tertiary uppercase tracking-widest block mb-1 font-cyber-accent">
            {"// CONVERSION_SUCCESS"}
          </span>
          <p className="text-xs text-cyber-muted-fg font-medium">
            {formattedInput} =
          </p>
          <p className="text-3xl md:text-4xl font-black text-cyber-accent tracking-widest font-cyber-headings animate-chromatic my-1">
            {formattedResult}
          </p>
        </div>

        <div className="mt-3 pt-3.5 border-t border-cyber-border/50 flex flex-col gap-2.5 text-xs font-semibold font-cyber-accent">
          <div className="flex justify-between items-center">
            <span className="text-cyber-muted-fg">PRIMARY_RATE</span>
            <span className="text-cyber-fg">{"1 "}{fromCurrency}{" = "}{formattedRate}{" "}{toCurrency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyber-muted-fg">REVERSE_RATE</span>
            <span className="text-cyber-fg">{"1 "}{toCurrency}{" = "}{formattedReverseRate}{" "}{fromCurrency}</span>
          </div>
          
          {updatedTime && (
            <div className="mt-1 flex justify-between items-center text-[10px] text-cyber-muted-fg/80 font-medium">
              <span>SYNC_TIMESTAMP</span>
              <span>{updatedTime}</span>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="text-center py-6">
        <p className="text-cyber-muted-fg text-sm font-medium uppercase tracking-wider font-cyber-accent">
          {"> Awaiting transaction amount input..."}
          <span className="w-1.5 h-3 bg-cyber-muted-fg animate-blink inline-block ml-1 align-middle" />
        </p>
      </div>
    );
  }

  return (
    <div className="cyber-chamfer-sm mt-4 p-[1px] bg-cyber-border hover:bg-cyber-border/80 transition-all duration-300">
      <div className="cyber-chamfer-sm p-5 md:p-6 bg-cyber-muted min-h-[110px] flex flex-col justify-center relative overflow-hidden">
        {/* Inside grid overlay */}
        <div className="absolute inset-0 bg-cyber-grid opacity-[0.25] pointer-events-none" />
        <div className="relative z-10">
          {content}
        </div>
      </div>
    </div>
  );
};
