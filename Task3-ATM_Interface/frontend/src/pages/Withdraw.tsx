import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUpload, FiSliders, FiInfo, FiArrowLeft, FiCheck, FiLock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { addTransactionAtomically } from '../services/firestoreService';

interface WithdrawReceipt {
  id: string;
  amount: number;
  method: string;
  timestamp: string;
  notes500: number;
  notes100: number;
}

type MixPreference = 'balanced' | 'large' | 'small';
type ProcessingStage = 'auth' | 'counting' | 'dispensing' | 'success';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getNoteDistribution = (totalAmount: number, preference: MixPreference) => {
  if (preference === 'large') {
    const count500 = Math.floor(totalAmount / 500);
    const count100 = Math.floor((totalAmount % 500) / 100);
    return { count500, count100 };
  }
  if (preference === 'small') {
    return { count500: 0, count100: Math.floor(totalAmount / 100) };
  }
  // Balanced: ~60% in 500s, rest in 100s
  const target500Value = totalAmount * 0.6;
  const count500 = Math.floor(target500Value / 500);
  const remainingValue = totalAmount - (count500 * 500);
  const count100 = Math.round(remainingValue / 100);
  return { count500, count100 };
};

export const Withdraw: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [mix, setMix] = useState<MixPreference>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('auth');
  const [showSuccess, setShowSuccess] = useState(false);
  const [receipt, setReceipt] = useState<WithdrawReceipt | null>(null);
  
  // PIN Verification states
  const [showPinModal, setShowPinModal] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const { user, balance, refreshBalance } = useAuth();

  const [dailyLimit, setDailyLimit] = useState(() => {
    const saved = localStorage.getItem('profile_daily_limit');
    return saved ? Number.parseInt(saved) : 20000;
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem('profile_daily_limit');
      setDailyLimit(saved ? Number.parseInt(saved) : 20000);
    };
    globalThis.addEventListener('profile_update', handleProfileUpdate);
    return () => {
      globalThis.removeEventListener('profile_update', handleProfileUpdate);
    };
  }, []);

  const currentBalance = balance;

  const parsedAmt = Number.parseFloat(amount);
  const isValidAmountForPreview = !Number.isNaN(parsedAmt) && parsedAmt > 0 && parsedAmt % 100 === 0 && parsedAmt <= dailyLimit && (currentBalance === undefined || parsedAmt <= currentBalance);
  const previewNotes = isValidAmountForPreview ? getNoteDistribution(parsedAmt, mix) : null;

  // Preset cash options
  const presets = [100, 500, 1000, 2000, 5000, 10000];

  // Validation rules
  const numAmount = Number.parseFloat(amount);
  let validationError = '';
  if (amount !== '') {
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      validationError = 'Please enter a valid positive withdrawal amount';
    } else if (numAmount % 100 !== 0) {
      validationError = 'ATM note mix only dispenses multiples of ₹100';
    } else if (numAmount > dailyLimit) {
      validationError = `Transaction exceeds your daily limit of ₹${dailyLimit.toLocaleString('en-IN')}`;
    } else if (numAmount > currentBalance) {
      validationError = 'Insufficient funds in checking dossier';
    }
  }

  const isSubmitDisabled = isProcessing || !amount || validationError !== '' || !user;

  const getMethodName = (preference: MixPreference) => {
    if (preference === 'balanced') return 'Balanced Note Mix';
    if (preference === 'large') return 'Large Bills (₹500s)';
    return 'Small Bills (₹100s)';
  };

  const handleWithdrawSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitDisabled || !user) return;
    setShowPinModal(true);
  };

  const handleVerifyAndExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || verificationPin.length !== 4) return;

    setIsVerifyingPin(true);
    const userPinKey = user ? `profile_pin_${user.uid}` : 'profile_pin';
    const storedPin = localStorage.getItem(userPinKey) || localStorage.getItem('profile_pin') || '8910';

    if (verificationPin !== storedPin) {
      toast.error('Verification failed. Incorrect security PIN.');
      setIsVerifyingPin(false);
      setVerificationPin('');
      return;
    }

    setIsVerifyingPin(false);
    setShowPinModal(false);
    setVerificationPin('');

    await executeWithdrawal();
  };

  const executeWithdrawal = async () => {
    setIsProcessing(true);
    setProcessingStage('auth');

    try {
      await sleep(800);
      setProcessingStage('counting');
      
      // Execute the database transaction atomically while the dispenser is counting
      const liveTxnId = await addTransactionAtomically(
        user!.uid,
        'debit',
        numAmount,
        `Withdrawal - ${getMethodName(mix)}`
      );

      await refreshBalance();

      await sleep(1000);
      setProcessingStage('dispensing');
      
      await sleep(1200);
      const { count500, count100 } = getNoteDistribution(numAmount, mix);
      setReceipt({
        id: liveTxnId.toUpperCase(),
        amount: numAmount,
        method: getMethodName(mix),
        timestamp: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        notes500: count500,
        notes100: count100,
      });
      setProcessingStage('success');
      setIsProcessing(false);
      setShowSuccess(true);
      toast.success('Withdrawal cleared! Please collect your cash notes.');
    } catch (error) {
      console.warn('Withdrawal validation/execution failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Withdrawal failed. System error.';
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setShowSuccess(false);
    setReceipt(null);
  };

  // Helper render method to keep visual blocks flat and satisfy ternary restrictions
  const renderContent = () => {
    if (showSuccess) {
      return (
        /* ==================== SUCCESS STATE RECEIPT ==================== */
        <motion.div
          key="withdraw-success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
          className="glass-card premium-card-shadow rounded-3xl p-6 md:p-8 border border-dark-border/15 light:border-light-border/40 flex flex-col items-center text-center space-y-6"
        >
          {/* Shimmering success icon container */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-lg shadow-primary/10"
          >
            <FiCheck className="w-8 h-8 stroke-[3]" />
          </motion.div>

          <div>
            <h3 className="font-display font-black text-[22px] tracking-tight text-dark-text light:text-light-text uppercase">
              Dispense Successful
            </h3>
            <p className="text-[12px] text-dark-text/50 light:text-light-text/50 mt-1">
              Please collect your cash bundles from the dispenser slot.
            </p>
          </div>

          {/* Receipt details layout */}
          <div className="w-full rounded-2xl bg-dark-surface/40 light:bg-light-card/40 border border-dark-border/10 light:border-light-border/30 p-5 space-y-3.5 text-left font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-dark-text/35 light:text-light-text/40 uppercase">Transaction ID</span>
              <span className="text-dark-text light:text-light-text font-bold">{receipt?.id}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-dark-text/35 light:text-light-text/40 uppercase">Dispense Channel</span>
              <span className="text-dark-text light:text-light-text font-bold">{receipt?.method}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-dark-text/35 light:text-light-text/40 uppercase">Timestamp</span>
              <span className="text-dark-text light:text-light-text font-bold">{receipt?.timestamp}</span>
            </div>
            
            {/* Note bundle distribution breakdown */}
            <div className="border-t border-dark-border/10 light:border-light-border/30 pt-3.5 space-y-2 text-[11px]">
              <span className="text-dark-text/35 light:text-light-text/40 uppercase block mb-1">
                Vault Note Distribution
              </span>
              <div className="flex justify-between items-center bg-white/[0.02] dark:bg-black/10 border border-white/5 rounded-lg px-3 py-1.5">
                <span className="text-dark-text/75 light:text-light-text/75">₹500 Notes</span>
                <span className="font-bold text-secondary">{receipt?.notes500}x</span>
              </div>
              <div className="flex justify-between items-center bg-white/[0.02] dark:bg-black/10 border border-white/5 rounded-lg px-3 py-1.5">
                <span className="text-dark-text/75 light:text-light-text/75">₹100 Notes</span>
                <span className="font-bold text-secondary">{receipt?.notes100}x</span>
              </div>
            </div>

            <div className="border-t border-dark-border/10 light:border-light-border/30 pt-3.5 flex justify-between items-end">
              <span className="text-[11px] text-dark-text/35 light:text-light-text/40 uppercase">Amount Dispensed</span>
              <span className="font-display font-black text-[22px] text-primary leading-none">
                ₹{receipt?.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Receipt Footer Notice */}
          <div className="flex gap-2 items-center text-[10.5px] text-dark-text/40 light:text-light-text/40 leading-relaxed max-w-sm">
            <FiInfo className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
            <span>Ensure notes correspond to your receipt summary before leaving the ATM console.</span>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-3.5 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="py-3 rounded-xl font-display font-bold text-[11.5px] uppercase tracking-wider bg-dark-card/60 hover:bg-dark-card dark:bg-dark-card/50 dark:hover:bg-dark-card/85 light:bg-light-surface light:hover:bg-light-card border border-dark-border/20 light:border-light-border/50 text-dark-text light:text-light-text transition-all duration-200 cursor-pointer text-center"
            >
              New Withdrawal
            </button>

            <Link
              to="/"
              className="py-3 rounded-xl font-display font-bold text-[11.5px] uppercase tracking-wider bg-gradient-to-r from-primary to-secondary text-white hover:shadow-md transition-all duration-200 text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </motion.div>
      );
    }

    if (isProcessing) {
      return (
        /* ==================== VAULT DISPENSER LOADER PANEL ==================== */
        <motion.div
          key="withdraw-processing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
          className="glass-card premium-card-shadow rounded-3xl p-6 md:p-8 border border-dark-border/15 light:border-light-border/40 flex flex-col items-center text-center space-y-6"
        >
          {/* Spinning Loader */}
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-2" />
          
          <div className="space-y-1.5">
            <h3 className="font-display font-black text-lg text-dark-text light:text-light-text uppercase">
              Executing Cash Dispense
            </h3>
            <p className="text-xs text-dark-text/45 light:text-light-text/45 max-w-sm">
              Securing node connection to safe vaults. Please wait while notes are counted.
            </p>
          </div>

          {/* Checklist of stages */}
          <div className="w-full max-w-sm bg-dark-surface/40 light:bg-light-card/45 border border-dark-border/10 rounded-2xl p-5 space-y-4 text-left font-mono text-[11px]">
            {[
              { key: 'auth', label: 'Security Verification & Token Check' },
              { key: 'counting', label: 'Vault Note Counter (Multi-Bill Audit)' },
              { key: 'dispensing', label: 'Safe Dispenser Gate Activation' },
            ].map((s, index) => {
              const isDone = (processingStage === 'counting' && index === 0) || 
                             (processingStage === 'dispensing' && index <= 1) || 
                             (processingStage === 'success');
              const isActive = (processingStage === 'auth' && index === 0) ||
                               (processingStage === 'counting' && index === 1) ||
                               (processingStage === 'dispensing' && index === 2);
              
              let textClass = 'text-dark-text/30';
              if (isDone) {
                textClass = 'text-primary font-bold';
              } else if (isActive) {
                textClass = 'text-secondary font-bold animate-pulse';
              }

              let statusLabel = 'PENDING';
              if (isDone) {
                statusLabel = '✓ OK';
              } else if (isActive) {
                statusLabel = 'RUNNING...';
              }

              return (
                <div key={s.key} className="flex items-center justify-between">
                  <span className={textClass}>
                    {index + 1}. {s.label}
                  </span>
                  <span className="font-bold text-[10px]">
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    return (
      /* ==================== FORM VIEW PANEL ==================== */
      <motion.div
        key="withdraw-form"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-card premium-card-shadow rounded-3xl p-6 md:p-8 border border-dark-border/15 light:border-light-border/40"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-6">
          
          {/* Quick Cash Presets */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold">
              Quick Cash Presets
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  disabled={isProcessing}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                    amount === val.toString()
                      ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                      : 'border-dark-border/10 light:border-light-border/40 bg-dark-surface/40 light:bg-light-card/40 text-dark-text/80 light:text-light-text/85 hover:border-primary/30 hover:bg-dark-card light:hover:bg-light-card'
                  }`}
                >
                  ₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2.5">
            <label htmlFor="withdraw-amount" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold">
              Custom Cash Amount
            </label>
            <div className={`relative rounded-xl border bg-dark-surface/50 light:bg-light-surface flex items-center overflow-hidden transition-all duration-300 ${
              validationError ? 'border-rose-500/50' : 'border-dark-border/15 light:border-light-border/60 focus-within:border-primary/50'
            }`}>
              <div className="pl-4 font-display font-black text-[22px] text-primary select-none">
                ₹
              </div>
              <input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                placeholder="0"
                className="w-full py-4.5 px-3 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-display font-black text-2xl tracking-wide placeholder-dark-text/15 light:placeholder-light-text/20"
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="pr-4 text-xs font-mono text-rose-500 hover:underline cursor-pointer"
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
                className="text-[11px] font-mono text-rose-500 font-bold pl-1"
              >
                {validationError}
              </motion.p>
            )}
          </div>

          {/* Note Mix Preference (Fintech sliders/options) */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase flex items-center gap-1 font-bold">
              <FiSliders className="w-3.5 h-3.5" /> Note Dispenser Mix
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'balanced', label: 'Balanced Mix' },
                { id: 'large', label: 'Large Bills (₹500s)' },
                { id: 'small', label: 'Small Bills (₹100s)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMix(item.id as MixPreference)}
                  disabled={isProcessing}
                  className={`py-2 rounded-lg border text-[9.5px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
                    mix === item.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-dark-border/10 light:border-light-border/40 text-dark-text/50 light:text-light-text/55 hover:bg-dark-card'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {previewNotes && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-2xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface/40 p-3.5 flex justify-around items-center"
              >
                {/* 500 Bills */}
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[9px] font-mono uppercase text-dark-text/40 light:text-light-text/50">₹500 Notes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[9px] text-emerald-400 font-bold select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      500
                    </div>
                    <span className="text-[12px] font-mono font-black text-dark-text light:text-light-text">
                      {previewNotes.count500}x
                    </span>
                  </div>
                </div>

                <div className="h-6 w-[1px] bg-dark-border/10 light:bg-light-border/40" />

                {/* 100 Bills */}
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-[9px] font-mono uppercase text-dark-text/40 light:text-light-text/50">₹100 Notes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-4 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[9px] text-blue-400 font-bold select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      100
                    </div>
                    <span className="text-[12px] font-mono font-black text-dark-text light:text-light-text">
                      {previewNotes.count100}x
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Informational Limit Warning Banner */}
          <div className="flex items-start gap-3 rounded-xl bg-dark-card/30 light:bg-light-card/45 border border-dark-border/5 p-4 text-[11px] leading-relaxed text-dark-text/50 light:text-light-text/55">
            <FiInfo className="w-5.5 h-5.5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              Daily cash withdrawals are capped at ₹20,000 for debit card security. Double check note mix selector before dispensing. Multiples of ₹100 will be distributed.
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-4 rounded-xl font-display font-bold text-[13px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiUpload className="w-4.5 h-4.5" />
            <span>{isProcessing ? 'Dispensing Notes...' : 'Dispense Cash'}</span>
          </button>

        </form>
      </motion.div>
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-[32px] text-dark-text light:text-light-text tracking-tight mb-2">
          Withdraw Debit Desk
        </h1>
        <p className="text-dark-text/60 light:text-light-text/60 text-[14px]">
          Dispense paper bills from the safe cash vault. Multiples of ₹100 only.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {/* ATM Card Security PIN Authorization Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[430px] glass-card premium-card-shadow border border-dark-border/25 light:border-light-border/60 rounded-3xl p-5 md:p-6 relative overflow-hidden text-center"
          >
            <button
              type="button"
              onClick={() => {
                setShowPinModal(false);
                setVerificationPin('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-dark-text/40 hover:text-dark-text hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Shield and Lock Header */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary to-primary p-[1px] flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <div className="w-full h-full rounded-2xl bg-dark-surface light:bg-light-surface flex items-center justify-center">
                <FiLock className="w-6 h-6 text-secondary" />
              </div>
            </div>

            <h3 className="font-mono font-black text-[18px] tracking-wider text-dark-text light:text-light-text uppercase mb-1.5">
              Security Authorization
            </h3>
            <p className="text-[12px] text-dark-text/60 light:text-light-text/60 leading-relaxed mb-4.5 font-sans px-2">
              Enter your 4-digit secure ATM PIN to authorize this withdrawal of <strong>₹{numAmount.toLocaleString('en-IN')}</strong>.
            </p>

            <form onSubmit={handleVerifyAndExecute} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="verify-pin" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-1 block text-center">Enter PIN</label>
                <input
                  id="verify-pin"
                  type="password"
                  maxLength={4}
                  value={verificationPin}
                  onChange={(e) => setVerificationPin(e.target.value.replace(/\D/g, ''))}
                  disabled={isVerifyingPin}
                  placeholder="••••"
                  autoFocus
                  autoComplete="one-time-code"
                  className="w-48 mx-auto block py-2.5 px-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-300 bg-zinc-900/90 dark:bg-black/60 light:bg-zinc-50 outline-none text-[18px] text-dark-text light:text-light-text font-mono tracking-[8px] text-center placeholder-dark-text/20 light:placeholder-light-text/30 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 shadow-inner animate-pulse"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingPin || verificationPin.length !== 4}
                className="w-full py-3 rounded-xl font-display font-bold text-[12px] uppercase tracking-widest bg-gradient-to-r from-secondary to-primary text-white hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
              >
                {isVerifyingPin ? 'Verifying...' : 'Authorize Withdrawal'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
