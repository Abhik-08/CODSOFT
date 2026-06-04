import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  symbol?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  disabled = false,
  symbol = '',
}) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Allow empty input
    if (val === '') {
      onChange('');
      return;
    }

    // Regex to match only positive decimal numbers
    const regex = /^\d*\.?\d*$/;
    if (regex.test(val)) {
      // Limit total digits to 15 to prevent overflow and scientific notation issues
      const digitCount = val.replace('.', '').length;
      if (digitCount <= 15) {
        onChange(val);
      }
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="amount-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
        Amount
      </label>
      <div className="relative">
        {symbol && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none pointer-events-none">
            {symbol}
          </div>
        )}
        <input
          id="amount-input"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleValueChange}
          disabled={disabled}
          className={`w-full py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white font-bold text-lg placeholder-slate-500 transition-all disabled:opacity-50 ${
            symbol ? 'pl-12 pr-4' : 'px-4'
          }`}
          placeholder="1.00"
          autoComplete="off"
        />
      </div>
    </div>
  );
};
