import React, { useState } from 'react';
import { FiDownload, FiDollarSign, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export const Deposit: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'check'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickAdd = (value: number) => {
    const current = Number.parseFloat(amount) || 0;
    setAmount((current + value).toString());
  };

  const handleClear = () => setAmount('');

  const handleDeposit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = Number.parseFloat(amount);
    
    if (Number.isNaN(val) || val <= 0) {
      toast.error('Please enter a valid positive deposit amount');
      return;
    }

    if (val > 10000) {
      toast.error('Deposits above $10,000 require verification at an Apex branch');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(`Preparing deposit slot for ${method === 'cash' ? 'cash bundle' : 'check document'}...`);

    setTimeout(() => {
      toast.success(`Successfully deposited $${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}!`, {
        id: toastId,
        duration: 4000,
      });
      setIsProcessing(false);
      setAmount('');
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-[32px] text-dark-text light:text-light-text tracking-tight mb-2">
          Deposit Credit Desk
        </h1>
        <p className="text-dark-text/60 light:text-light-text/60 text-[14px]">
          Increase account liquidity by inserting cash envelopes or check drafts.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-card-shadow rounded-3xl p-6 md:p-8 border border-dark-border/15 light:border-light-border/40"
      >
        <form onSubmit={handleDeposit} className="space-y-6">
          
          {/* Method Selection (Fintech tabs) */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Deposit Protocol</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-3.5 px-4 rounded-xl border font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  method === 'cash'
                    ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                    : 'border-dark-border/10 light:border-light-border/40 hover:bg-dark-card/30 light:hover:bg-light-card/45 text-dark-text/60 light:text-light-text/65'
                }`}
              >
                <FiCheckCircle className="w-4.5 h-4.5" />
                <span>Cash Envelope</span>
              </button>
              
              <button
                type="button"
                onClick={() => setMethod('check')}
                className={`py-3.5 px-4 rounded-xl border font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  method === 'check'
                    ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                    : 'border-dark-border/10 light:border-light-border/40 hover:bg-dark-card/30 light:hover:bg-light-card/45 text-dark-text/60 light:text-light-text/65'
                }`}
              >
                <FiFileText className="w-4.5 h-4.5" />
                <span>Check Imaging</span>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2.5">
            <label htmlFor="deposit-amount" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block">Amount in USD</label>
            <div className="relative rounded-xl border border-dark-border/15 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-300">
              <div className="pl-4 text-dark-text/40 light:text-light-text/40">
                <FiDollarSign className="w-6 h-6" />
              </div>
              <input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                placeholder="0.00"
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

          {/* Quick additions grid */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block">Quick Increment</span>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  disabled={isProcessing}
                  className="py-3 rounded-xl border border-dark-border/5 light:border-light-border/40 bg-dark-surface/60 light:bg-light-surface text-xs font-bold text-dark-text/80 light:text-light-text/80 hover:border-primary/30 hover:bg-dark-card light:hover:bg-light-card active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  +${val}
                </button>
              ))}
            </div>
          </div>

          {/* Warning / Terms notice */}
          <div className="rounded-xl bg-dark-card/30 light:bg-light-card/45 border border-dark-border/5 p-4 text-[11px] leading-relaxed text-dark-text/50 light:text-light-text/55">
            By executing this transaction, you verify that the bills inserted in the envelope match the stated amount. False credentials may lead to card suspension.
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
            className="w-full py-4.5 rounded-xl font-display font-bold text-[14px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiDownload className="w-4.5 h-4.5" />
            <span>Process Deposit</span>
          </button>

        </form>
      </motion.div>

    </div>
  );
};
