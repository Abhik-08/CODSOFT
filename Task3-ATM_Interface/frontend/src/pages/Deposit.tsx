import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiCheckCircle, FiFileText, FiArrowLeft, FiCamera, FiLock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { addTransactionAtomically } from '../services/firestoreService';
import { NexusVaultTransactionChamber } from '../components/vault/NexusVaultTransactionChamber';

interface ReceiptDetails {
  id: string;
  amount: number;
  method: string;
  timestamp: string;
}

interface DepositReceiptProps {
  receipt: ReceiptDetails;
  handleReset: () => void;
}

const DepositReceipt: React.FC<DepositReceiptProps> = ({ receipt, handleReset }) => {
  return (
    <motion.div
      key="deposit-success"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', stiffness: 280, damping: 25 }}
      className="bg-[#faf8f5] text-slate-800 border-2 border-slate-300 rounded-lg p-6 flex flex-col items-center shadow-lg relative max-w-md mx-auto"
    >
      <div className="absolute -top-1 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_top,_var(--chassis)_60%,_transparent_60%)] bg-[size:12px_8px] bg-repeat-x z-20" />
      <div className="absolute -bottom-1 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_bottom,_var(--chassis)_60%,_transparent_60%)] bg-[size:12px_8px] bg-repeat-x z-20" />

      <div className="w-full flex flex-col items-center pb-4 border-b-2 border-dashed border-slate-300 font-mono text-center space-y-3">
        <span className="text-[10px] tracking-widest font-black uppercase text-slate-400">KRONOS CORE AUTOMATED</span>
        <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">
          *** DEPOSIT RECEIPT ***
        </h3>
      </div>

      <div className="w-full py-4 space-y-3 font-mono text-xs text-slate-700">
        <div className="flex justify-between">
          <span>TXN REFERENCE:</span>
          <span className="font-bold text-slate-900">{receipt.id}</span>
        </div>
        <div className="flex justify-between">
          <span>INPUT SLOT:</span>
          <span className="font-bold text-slate-900">{receipt.method}</span>
        </div>
        <div className="flex justify-between">
          <span>TIMESTAMP:</span>
          <span className="font-bold text-slate-900">{receipt.timestamp}</span>
        </div>
        <div className="flex justify-between">
          <span>SYS LOG INDX:</span>
          <span className="text-slate-900 font-bold">KRN_DEP_SETTLED_04</span>
        </div>

        <div className="border-t-2 border-dashed border-slate-300 pt-4 flex justify-between items-center">
          <span className="font-bold text-slate-900">FUNDS LOADED:</span>
          <span className="text-[20px] font-black text-slate-950">
            ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="w-full text-center border-t-2 border-dashed border-slate-300 pt-4 pb-2 font-mono text-[9px] text-slate-400 leading-normal">
        SECURE CRYPTOGRAPHIC LEDGER ENTRY AUDITED BY NODE_04.
        ALL DEPOSITS SUBJECT TO ATM ENVELOPE VERIFICATION.
      </div>

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
          className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-700 shadow-md text-center flex items-center justify-center gap-1.5 cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px]"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Console Home</span>
        </Link>
      </div>
    </motion.div>
  );
};

/** Pure helper: returns a validation error string for the deposit amount, or '' if valid. */
const getValidationError = (rawAmount: string, numAmount: number): string => {
  if (rawAmount === '') return '';
  if (Number.isNaN(numAmount) || numAmount <= 0) return 'Please enter a valid positive deposit amount';
  if (numAmount < 100) return 'Minimum deposit amount limit is ₹100';
  if (numAmount > 50000) return 'Maximum deposit amount is ₹50,000 per transaction';
  return '';
};

/* ───────────────────────────────────────────────
   Sub-component: Cash slot inputs & presets
─────────────────────────────────────────────── */
interface CashSlotProps {
  amount: string;
  validationError: string;
  isProcessing: boolean;
  presets: number[];
  onAmountChange: (v: string) => void;
  onClear: () => void;
  onPreset: (v: string) => void;
}
const CashSlotSection: React.FC<CashSlotProps> = ({
  amount, validationError, isProcessing, presets, onAmountChange, onClear, onPreset,
}) => (
  <>
    <div className="space-y-2.5">
      <label htmlFor="deposit-amount" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-0.5">
        Banknotes Load Volume (INR)
      </label>
      <div className={`relative rounded-xl bg-[var(--recessed)] shadow-recessed flex items-center overflow-hidden border transition-all duration-300 ${
        validationError ? 'border-rose-500/50' : 'border-dark-border/20 focus-within:border-[var(--accent)]'
      }`}>
        <div className="pl-4 font-mono font-bold text-[20px] text-[var(--accent)] select-none">₹</div>
        <input
          id="deposit-amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          disabled={isProcessing}
          placeholder="0"
          className="w-full py-4 px-3 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono font-bold text-2xl tracking-wide placeholder-dark-text/15 light:placeholder-light-text/20"
        />
        {amount && (
          <button type="button" onClick={onClear} className="pr-4 text-[10px] font-mono font-bold text-rose-500 hover:underline cursor-pointer">
            CLEAR
          </button>
        )}
      </div>
      {validationError && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-mono text-rose-500 font-bold pl-1 animate-pulse">
          {validationError}
        </motion.p>
      )}
    </div>

    <div className="space-y-2.5">
      <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-0.5">Quick preset selectors</span>
      <div className="grid grid-cols-4 gap-3">
        {presets.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onPreset(val.toString())}
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

    <div className="rounded-xl bg-dark-surface/35 border border-dark-border/10 p-3.5 font-mono text-[10px] leading-relaxed text-dark-text/50 light:text-light-text/55 shadow-inner">
      SECURITY ADVISORY: Ensure banknotes are clean, flat, unfolded, and free of foreign materials. Input slot automatically rejects bound stacks or clip binders.
    </div>
  </>
);

/* ───────────────────────────────────────────────
   Sub-component: Check scanner slot
─────────────────────────────────────────────── */
interface CheckScannerProps {
  checkScanStage: 'idle' | 'scanning' | 'success';
  amount: string;
  checkNumber: string;
  displayName: string;
  isProcessing: boolean;
  onStartScan: () => void;
  onAmountChange: (v: string) => void;
}
const CheckScannerSection: React.FC<CheckScannerProps> = ({
  checkScanStage, amount, checkNumber, displayName, isProcessing, onStartScan, onAmountChange,
}) => (
  <div className="space-y-5">
    <div className="space-y-2.5">
      <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-0.5">
        Check Scanner Processing Unit
      </span>

      {checkScanStage === 'idle' && (
        <button type="button" onClick={onStartScan} className="w-full py-6 rounded-2xl border border-dashed border-dark-border/20 hover:border-cyan-500/40 bg-dark-surface/40 hover:bg-dark-surface/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer text-center group">
          <FiCamera className="w-8 h-8 text-dark-text/30 group-hover:text-cyan-500 transition-colors duration-300" />
          <span className="font-mono text-xs font-bold text-dark-text/60 group-hover:text-dark-text transition-colors duration-300 uppercase">Feed Check Draft into Slot</span>
          <span className="font-mono text-[9px] text-dark-text/35">Accepts CTS-2010 standard clearing checks</span>
        </button>
      )}

      {checkScanStage === 'scanning' && (
        <div className="w-full h-36 rounded-2xl border border-cyan-500/25 bg-black/45 relative flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 shadow-[0_0_10px_3px_#06b6d4] animate-scan z-20" />
          <div className="flex flex-col items-center gap-3 text-center z-10">
            <div className="w-7 h-7 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
            <span className="font-mono text-xs font-bold text-cyan-500 tracking-widest uppercase animate-pulse">Scanning Image...</span>
          </div>
        </div>
      )}

      {checkScanStage === 'success' && (
        <div className="w-full space-y-4">
          <div className="w-full h-36 rounded-2xl border border-cyan-500/35 bg-gradient-to-tr from-[#fbfaf7] to-[#e8e6df] text-slate-800 p-4 font-mono relative overflow-hidden shadow-md">
            <div className="absolute top-2 left-2 text-[8px] text-slate-400 uppercase tracking-widest font-black">APEX CHECK SECURE</div>
            <div className="absolute top-2 right-4 text-[9px] text-slate-700 font-bold">CTS-2010</div>
            <div className="mt-5 space-y-1 text-slate-700">
              <div className="text-[10px] border-b border-slate-300 pb-1 flex justify-between">
                <span>PAY TO:</span>
                <span className="font-bold text-slate-900">{displayName}</span>
              </div>
              <div className="text-[10px] border-b border-slate-300 pb-1 flex justify-between">
                <span>SUM OF:</span>
                <span className="font-bold text-slate-900">RUPEES {amount ? Number(amount).toLocaleString('en-IN').toUpperCase() : ''} ONLY</span>
              </div>
            </div>
            <div className="absolute bottom-2.5 left-0 right-0 text-center text-[10px] tracking-[4px] font-bold text-slate-900">
              ⑆ {checkNumber} ⑆ 110002022 ⑈ 013490 ⑈ 22
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="parsed-amount" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-0.5">
              Verify Parsed Check Value (INR)
            </label>
            <div className="relative rounded-xl bg-[var(--recessed)] shadow-recessed flex items-center overflow-hidden border border-cyan-500/20">
              <div className="pl-4 font-mono font-bold text-[20px] text-cyan-500 select-none">₹</div>
              <input
                id="parsed-amount"
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                disabled={isProcessing}
                className="w-full py-4.5 px-3 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono font-bold text-2xl tracking-wide"
              />
              <button type="button" onClick={onStartScan} className="pr-4 text-[9px] font-mono font-bold text-cyan-500 hover:underline cursor-pointer">
                RE-SCAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="rounded-xl bg-dark-surface/35 border border-dark-border/10 p-3.5 font-mono text-[10px] leading-relaxed text-dark-text/50 light:text-light-text/55 shadow-inner">
      ELECTRONIC IMAGE EXCHANGE NOTICE: Ingested checks are processed electronically under the Cheque Truncation System (CTS-2010). Funds are credited after cryptographic clearing house approval.
    </div>
  </div>
);


export const Deposit: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'check'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  
  // PIN Verification states
  const [showPinModal, setShowPinModal] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Check Scanner Specific States
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [checkScanStage, setCheckScanStage] = useState<'idle' | 'scanning' | 'success'>('idle');

  // Cinematic Chamber States
  const [showChamber, setShowChamber] = useState(false);
  const [chamberBalance, setChamberBalance] = useState(0);

  const { user, refreshBalance, balance } = useAuth();

  // Quick preset options
  const presets = [500, 1000, 2000, 5000];

  // Validation rules (Min ₹100, Max ₹50,000)
  const numAmount = Number.parseFloat(amount);
  const validationError = getValidationError(amount, numAmount);

  const isCheckNotScanned = method === 'check' && checkScanStage !== 'success';
  const isSubmitDisabled = isProcessing || !amount || validationError !== '' || isCheckNotScanned;

  const handleStartScan = async () => {
    if (isProcessing) return;
    setCheckScanStage('scanning');
    const toastId = toast.loading('Initializing check imaging scanner...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const randomAmount = (Math.floor(Math.random() * 9) + 1) * 2000; // Random multiple of 2000 (2k to 18k)
    const randomCheckNo = Math.floor(100000 + Math.random() * 900000).toString();
    
    setAmount(randomAmount.toString());
    setCheckNumber(randomCheckNo);
    setCheckScanStage('success');
    toast.success('Check draft parsed successfully!', { id: toastId });
  };

  const handleMethodChange = (newMethod: 'cash' | 'check') => {
    setMethod(newMethod);
    setAmount('');
    setCheckNumber('');
    setCheckScanStage('idle');
  };

  const handleDepositSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitDisabled || !user) return;
    setShowPinModal(true);
  };

  const handleVerifyAndExecute = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

    const calculatedNewBalance = balance + numAmount;
    setChamberBalance(calculatedNewBalance);
    setShowChamber(true);

    await executeDeposit();
  };

  const executeDeposit = async () => {
    if (!user) return;
    const isCash = method === 'cash';
    const depositLabel = isCash ? 'Deposit - Cash' : `Deposit - Check #${checkNumber}`;
    const depositMethodName = isCash ? 'Cash Envelope Slot' : `Digital Check #${checkNumber} Scanner`;
    const vaultSlotLabel = isCash ? 'cash bundle' : 'check document';

    setIsProcessing(true);
    const toastId = toast.loading(`Opening vault slot for ${vaultSlotLabel}...`);

    try {
      const liveTxnId = await addTransactionAtomically(user.uid, 'credit', numAmount, depositLabel);
      await refreshBalance();
      toast.success('Funds successfully parsed and credited!', { id: toastId });
      setReceipt({
        id: liveTxnId.toUpperCase(),
        amount: numAmount,
        method: depositMethodName,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      });
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : 'Deposit failed. System slot error.';
      toast.error(errorMsg, { id: toastId });
      setShowChamber(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAmount('');
    setCheckNumber('');
    setCheckScanStage('idle');
    setShowSuccess(false);
    setReceipt(null);
  };

  const getSubmitButtonText = () => {
    if (isProcessing) return 'Mounting vault slot...';
    if (method === 'check' && checkScanStage !== 'success') return 'Scan Check First';
    return 'Process transaction';
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono font-black text-[28px] text-dark-text light:text-light-text tracking-tight mb-2 uppercase">
            Liquidity Inflow Protocol
          </h1>
          <p className="text-dark-text/60 light:text-light-text/60 text-[13px] font-mono">
            Initialize currency slots to digest paper banknotes or check drafts.
          </p>
        </div>
        {/* Deposit illustration */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden sm:block flex-shrink-0 group cursor-default"
        >
          <img
            src="/deposit_illus.png"
            alt="Deposit illustration"
            className="w-24 h-24 md:w-32 md:h-32 object-contain opacity-80 group-hover:opacity-30 transition-opacity duration-500 rounded-2xl drop-shadow-lg"
            draggable={false}
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {showSuccess && receipt ? (
          <DepositReceipt receipt={receipt} handleReset={handleReset} />
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
                    onClick={() => handleMethodChange('cash')}
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
                    onClick={() => handleMethodChange('check')}
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

              {/* Conditional Render: Cash vs Check via dedicated sub-components */}
              {method === 'cash' ? (
                <CashSlotSection
                  amount={amount}
                  validationError={validationError}
                  isProcessing={isProcessing}
                  presets={presets}
                  onAmountChange={setAmount}
                  onClear={() => setAmount('')}
                  onPreset={setAmount}
                />
              ) : (
                <CheckScannerSection
                  checkScanStage={checkScanStage}
                  amount={amount}
                  checkNumber={checkNumber}
                  displayName={user?.displayName?.toUpperCase() ?? 'ATM OPERATOR'}
                  isProcessing={isProcessing}
                  onStartScan={handleStartScan}
                  onAmountChange={setAmount}
                />
              )}

              {/* Submit Action - Tactile Primary Button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full py-4 rounded-xl text-xs tracking-wider tactile-key-primary flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:pointer-events-none"
              >
                <FiDownload className="w-4 h-4" />
                <span>
                  {getSubmitButtonText()}
                </span>
              </button>

            </form>
          </motion.div>
        )}
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
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Shield and Lock Header */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-[1px] flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <div className="w-full h-full rounded-2xl bg-dark-surface light:bg-light-surface flex items-center justify-center">
                <FiLock className="w-6 h-6 text-primary" />
              </div>
            </div>

            <h3 className="font-mono font-black text-[18px] tracking-wider text-dark-text light:text-light-text uppercase mb-1.5">
              Security Authorization
            </h3>
            <p className="text-[12px] text-dark-text/60 light:text-light-text/60 leading-relaxed mb-4.5 font-sans px-2">
              Enter your 4-digit secure ATM PIN to authorize this deposit of <strong>₹{numAmount.toLocaleString('en-IN')}</strong>.
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
                className="w-full py-3 rounded-xl font-display font-bold text-[12px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
              >
                {isVerifyingPin ? 'Verifying...' : 'Authorize Deposit'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <NexusVaultTransactionChamber
        isOpen={showChamber}
        mode="deposit"
        amount={numAmount}
        newBalance={chamberBalance}
        onFinished={() => setShowChamber(false)}
      />

    </div>
  );
};
