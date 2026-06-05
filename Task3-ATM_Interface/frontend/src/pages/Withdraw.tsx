import React, { useState } from 'react';
import { FiUpload, FiDollarSign, FiInfo, FiSliders } from 'react-icons/fi';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export const Withdraw: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [mix, setMix] = useState<'balanced' | 'large' | 'small'>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentBalance = 78450.92;
  const dailyLimit = 2000;

  const handleQuickCash = (value: number) => {
    setAmount(value.toString());
  };

  const handleClear = () => setAmount('');

  const handleWithdraw = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = Number.parseFloat(amount);
    
    if (Number.isNaN(val) || val <= 0) {
      toast.error('Please enter a valid positive withdrawal amount');
      return;
    }

    if (val % 10 !== 0) {
      toast.error('ATM note mix only dispenses multiples of $10 ($10, $20, $50 bills)');
      return;
    }

    if (val > dailyLimit) {
      toast.error(`Transaction exceeds your daily limit of $${dailyLimit.toLocaleString()}`);
      return;
    }

    if (val > currentBalance) {
      toast.error('Insufficient funds in checking account');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Authenticating secure transaction...');

    setTimeout(() => {
      toast.loading('Dispensing cash from slot...', { id: toastId });
      setTimeout(() => {
        toast.success(`Dispense successful! Please collect your cash.`, {
          id: toastId,
          duration: 5000,
        });
        setIsProcessing(false);
        setAmount('');
      }, 2000);
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-[32px] text-dark-text light:text-light-text tracking-tight mb-2">
          Withdraw Debit Desk
        </h1>
        <p className="text-dark-text/60 light:text-light-text/60 text-[14px]">
          Dispense paper bills from the safe cash vault. Multiples of $10 only.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-card-shadow rounded-3xl p-6 md:p-8 border border-dark-border/15 light:border-light-border/40"
      >
        <form onSubmit={handleWithdraw} className="space-y-6">
          
          {/* Quick Cash Presets */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block">Quick Cash Presets</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[20, 50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickCash(val)}
                  disabled={isProcessing}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    amount === val.toString()
                      ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                      : 'border-dark-border/5 light:border-light-border/40 bg-dark-surface/60 light:bg-light-surface text-dark-text/80 light:text-light-text/80 hover:border-primary/20 hover:bg-dark-card'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2.5">
            <label htmlFor="withdraw-amount" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block">Custom Cash Amount</label>
            <div className="relative rounded-xl border border-dark-border/15 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-300">
              <div className="pl-4 text-dark-text/40 light:text-light-text/40">
                <FiDollarSign className="w-6 h-6" />
              </div>
              <input
                id="withdraw-amount"
                type="number"
                step="10"
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                placeholder="0"
                className="w-full py-4.5 px-3 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-display font-black text-2xl tracking-wide placeholder-dark-text/15 light:placeholder-light-text/20"
              />
              {amount && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="pr-4 text-xs font-mono text-rose-500 hover:underline cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Note Mix Preference (Fintech sliders/options) */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase flex items-center gap-1">
              <FiSliders className="w-3.5 h-3.5" /> Note Dispenser Mix
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'balanced', label: 'Balanced Mix' },
                { id: 'large', label: 'Large Bills ($100s)' },
                { id: 'small', label: 'Small Bills ($20s)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMix(item.id as 'balanced' | 'large' | 'small')}
                  className={`py-2 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
                    mix === item.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-transparent bg-dark-card/30 light:bg-light-card/45 text-dark-text/50 light:text-light-text/55 hover:bg-dark-card'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Informational Limit Warning Banner */}
          <div className="flex items-start gap-3 rounded-xl bg-dark-card/30 light:bg-light-card/45 border border-dark-border/5 p-4 text-[11px] leading-relaxed text-dark-text/50 light:text-light-text/55">
            <FiInfo className="w-5.5 h-5.5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              Daily cash withdrawals are capped at $2,000 for debit card security. Double check note mix selector before dispensing. Multiples of $10, $20, or $50 will be distributed.
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
            className="w-full py-4.5 rounded-xl font-display font-bold text-[14px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiUpload className="w-4.5 h-4.5" />
            <span>Dispense Cash</span>
          </button>

        </form>
      </motion.div>

    </div>
  );
};
