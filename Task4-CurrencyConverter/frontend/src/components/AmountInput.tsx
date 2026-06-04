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

    if (val === '') {
      onChange('');
      return;
    }

    const regex = /^\d*\.?\d*$/;
    if (regex.test(val)) {
      const digitCount = val.replace('.', '').length;
      if (digitCount <= 15) {
        onChange(val);
      }
    }
  };

  return (
    <div className="w-full font-cyber-body">
      <label htmlFor="amount-input" className="text-xs font-semibold text-cyber-muted-fg uppercase tracking-widest block mb-2 font-cyber-accent">
        {"// TRANSACTION_AMOUNT"}
      </label>
      <div className="relative cyber-chamfer-sm p-[1px] bg-cyber-border focus-within:bg-cyber-accent focus-within:shadow-[0_0_10px_rgba(0,255,136,0.4)] transition-all duration-300">
        <div className="relative cyber-chamfer-sm bg-cyber-input flex items-center w-full">
          {symbol && (
            <div className="pl-4 text-cyber-accent-tertiary font-bold text-lg select-none pointer-events-none font-cyber-accent">
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
            className={`w-full py-3.5 bg-transparent border-none outline-none focus:outline-none text-cyber-accent font-bold text-lg placeholder-cyber-muted-fg/40 disabled:opacity-50 ${
              symbol ? 'pl-2 pr-4' : 'px-4'
            }`}
            placeholder="0.00"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};
