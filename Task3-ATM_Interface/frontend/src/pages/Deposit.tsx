import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { addTransactionAtomically } from '../services/firestoreService';

interface ReceiptDetails {
  id: string;
  amount: number;
  method: string;
  timestamp: string;
}

export const Deposit: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'check'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const { user } = useAuth();

  // Quick preset options
  const presets = [500, 1000, 2000, 5000];

  // Validation rules (Min ₹100, Max ₹50,000)
  const numAmount = Number.parseFloat(amount);
  let validationError = '';
  if (amount !== '') {
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      validationError = 'Please enter a valid positive deposit amount';
    } else if (numAmount < 100) {
      validationError = 'Minimum deposit amount limit is ₹100';
    } else if (numAmount > 50000) {
      validationError = 'Maximum deposit amount is ₹50,000 per transaction';
    }
  }

  const isSubmitDisabled = isProcessing || !amount || validationError !== '';

  const handleDepositSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitDisabled || !user) return;

    setIsProcessing(true);
    const toastId = toast.loading(`Opening vault slot for ${method === 'cash' ? 'cash bundle' : 'check document'}...`);

    try {
      const liveTxnId = await addTransactionAtomically(
        user.uid,
        'credit',
        numAmount,
        `Deposit - ${method === 'cash' ? 'Cash' : 'Check Imaging'}`
      );
      
      toast.success('Funds successfully parsed and credited!', { id: toastId });
      setReceipt({
        id: liveTxnId.toUpperCase(),
        amount: numAmount,
        method: method === 'cash' ? 'Cash Envelope Slot' : 'Digital Check Imaging Scanner',
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      });
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : 'Deposit failed. System slot error.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setShowSuccess(false);
    setReceipt(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-mono font-black text-[28px] text-dark-text light:text-light-text tracking-tight mb-2 uppercase">
          Liquidity Inflow Protocol
        </h1>
        <p className="text-dark-text/60 light:text-light-text/60 text-[13px] font-mono">
          Initialize currency slots to digest paper banknotes or check drafts.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          /* ==================== TACTILE PAPER RECEIPT SLIP ==================== */
          <motion.div
            key="deposit-success"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            className="bg-[#faf8f5] text-slate-800 border-2 border-slate-300 rounded-lg p-6 flex flex-col items-center shadow-lg relative max-w-md mx-auto"
          >
            {/* Skeuomorphic Paper slip jagged edge highlights */}
            <div className="absolute -top-1 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_top,_var(--chassis)_60%,_transparent_60%)] bg-[size:12px_8px] bg-repeat-x z-20" />
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_bottom,_var(--chassis)_60%,_transparent_60%)] bg-[size:12px_8px] bg-repeat-x z-20" />

            <div className="w-full flex flex-col items-center pb-4 border-b-2 border-dashed border-slate-300 font-mono text-center space-y-3">
              <span className="text-[10px] tracking-widest font-black uppercase text-slate-400">KRONOS CORE AUTOMATED</span>
              <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                *** DEPOSIT RECEIPT ***
              </h3>
            </div>

            {/* Receipt Details Table */}
            <div className="w-full py-4 space-y-3 font-mono text-xs text-slate-700">
              <div className="flex justify-between">
                <span>TXN REFERENCE:</span>
                <span className="font-bold text-slate-900">{receipt?.id}</span>
              </div>
              <div className="flex justify-between">
                <span>INPUT SLOT:</span>
                <span className="font-bold text-slate-900">{receipt?.method}</span>
              </div>
              <div className="flex justify-between">
                <span>TIMESTAMP:</span>
                <span className="font-bold text-slate-900">{receipt?.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>SYS LOG INDX:</span>
                <span className="text-slate-900 font-bold">KRN_DEP_SETTLED_04</span>
              </div>

              <div className="border-t-2 border-dashed border-slate-300 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-900">FUNDS LOADED:</span>
                <span className="text-[20px] font-black text-slate-950">
                  ₹{receipt?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Receipt Stamp Info */}
            <div className="w-full text-center border-t-2 border-dashed border-slate-300 pt-4 pb-2 font-mono text-[9px] text-slate-400 leading-normal">
              SECURE CRYPTOGRAPHIC LEDGER ENTRY AUDITED BY NODE_04.
              ALL DEPOSITS SUBJECT TO ATM ENVELOPE VERIFICATION.
            </div>

            {/* Actions - styled as tactile keys */}
            <div className="w-full grid grid-cols-2 gap-3.5 pt-4 z-30">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider tactile-key cursor-pointer text-center"
              >
                Insert More
              </button>

              <Link
                to="/"
                className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 shadow-md text-center flex items-center justify-center gap-1.5 cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Console Home</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ==================== FORM VIEW ==================== */
          <motion.div
            key="deposit-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-card premium-card-shadow rounded-3xl p-6 md:p-8 border border-[var(--border-dark)] relative overflow-hidden"
          >
            {/* Bolted details */}
            <div className="absolute top-2.5 left-2.5 corner-screw opacity-30 z-20" />
            <div className="absolute top-2.5 right-2.5 corner-screw opacity-30 z-20" />
            <div className="absolute bottom-2.5 left-2.5 corner-screw opacity-30 z-20" />
            <div className="absolute bottom-2.5 right-2.5 corner-screw opacity-30 z-20" />

            <form onSubmit={handleDepositSubmit} className="space-y-6 px-1 mt-1">
              
              {/* Method Selection */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-0.5">
                  Deposit Protocol Slot
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod('cash')}
                    disabled={isProcessing}
                    className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      method === 'cash'
                        ? 'border-[var(--accent)] bg-dark-surface/10 dark:bg-black/35 text-[var(--accent)] shadow-recessed'
                        : 'tactile-key'
                    }`}
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Cash Slot</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setMethod('check')}
                    disabled={isProcessing}
                    className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      method === 'check'
                        ? 'border-[var(--accent)] bg-dark-surface/10 dark:bg-black/35 text-[var(--accent)] shadow-recessed'
                        : 'tactile-key'
                    }`}
                  >
                    <FiFileText className="w-4.5 h-4.5" />
                    <span>Check Scanner</span>
                  </button>
                </div>
              </div>

              {/* Amount input - Recessed Well */}
              <div className="space-y-2.5">
                <label htmlFor="deposit-amount" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-0.5">
                  Banknotes Load Volume (INR)
                </label>
                <div className={`relative rounded-xl bg-[var(--recessed)] shadow-recessed flex items-center overflow-hidden border transition-all duration-300 ${
                  validationError ? 'border-rose-500/50' : 'border-dark-border/20 focus-within:border-[var(--accent)]'
                }`}>
                  <div className="pl-4 font-mono font-bold text-[20px] text-[var(--accent)] select-none">
                    ₹
                  </div>
                  <input
                    id="deposit-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isProcessing}
                    placeholder="0"
                    className="w-full py-4 px-3 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono font-bold text-2xl tracking-wide placeholder-dark-text/15 light:placeholder-light-text/20"
                  />
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="pr-4 text-[10px] font-mono font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
                {/* Visual Real-Time Error Message */}
                {validationError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-mono text-rose-500 font-bold pl-1 animate-pulse"
                  >
                    {validationError}
                  </motion.p>
                )}
              </div>

              {/* Quick Preset Amount Buttons */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-0.5">
                  Quick preset selectors
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      disabled={isProcessing}
                      className={`py-2.5 rounded-xl border text-[10.5px] font-mono font-bold transition-all duration-200 cursor-pointer ${
                        amount === val.toString()
                          ? 'border-[var(--accent)] bg-dark-surface/10 dark:bg-black/35 text-[var(--accent)] shadow-recessed'
                          : 'tactile-key'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms notice */}
              <div className="rounded-xl bg-dark-surface/35 border border-dark-border/10 p-3.5 font-mono text-[10px] leading-relaxed text-dark-text/50 light:text-light-text/55 shadow-inner">
                SECURITY ADVISORY: Ensure check vouchers are flat, faces up. Ingested notes splits are scanned and logged to prevents double-deposit routing violations.
              </div>

              {/* Submit Action - Tactile Primary Button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full py-4 rounded-xl text-xs tracking-wider tactile-key-primary flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
              >
                <FiDownload className="w-4 h-4" />
                <span>{isProcessing ? 'Mounting vault slot...' : 'Process transaction'}</span>
              </button>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
