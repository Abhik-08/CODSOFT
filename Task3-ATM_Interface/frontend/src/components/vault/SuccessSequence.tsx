import React from 'react';
import { motion } from 'motion/react';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { FiCheckCircle } from 'react-icons/fi';

interface SuccessSequenceProps {
  mode: 'deposit' | 'withdraw';
  amount: number;
  newBalance: number;
  onConfirm: () => void;
}

export const SuccessSequence: React.FC<SuccessSequenceProps> = ({
  mode,
  amount,
  newBalance,
  onConfirm,
}) => {
  const isDeposit = mode === 'deposit';
  const announcementText = isDeposit ? 'NEXUS VAULT CREDIT CONFIRMED' : 'CURRENCY DISPENSED';

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-50 select-none">
      
      {/* Visual expanding energy shockwave */}
      <motion.div
        initial={{ scale: 0.1, opacity: 1 }}
        animate={{
          scale: 12,
          opacity: 0,
        }}
        transition={{
          duration: 1.5,
          ease: 'easeOut',
        }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute w-36 h-36 rounded-full border-4 border-cyan-400/80 blur-xs bg-cyan-400/10 pointer-events-none"
      />

      {/* Primary Success Panel container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 22,
          delay: 0.2,
        }}
        className="glass-panel border border-cyan-400/20 bg-black/60 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full mx-4 text-center space-y-6 relative"
      >
        {/* Hologram Grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,210,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,210,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-3xl" />

        {/* Success Pulse Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-400/15 border border-cyan-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_#00d2ff] relative">
          <FiCheckCircle className="w-7 h-7" />
          <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-ping" />
        </div>

        <div className="space-y-1 relative z-10">
          <h4 className="font-mono text-[10px] text-cyan-400/60 uppercase tracking-[5px] font-black">
            Vault Sync Complete
          </h4>
          <h2 className="font-mono font-black text-[15px] text-cyan-400 tracking-wider uppercase leading-snug">
            {announcementText}
          </h2>
        </div>

        {/* Dynamic Holographic Balance Display */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5.5 space-y-2 relative z-10 text-left font-mono">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-zinc-500 uppercase tracking-wider">Transaction Amount</span>
            <span className="text-cyan-400 font-bold">
              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-white/5 pt-3 flex flex-col space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Updated Ledger Balance
            </span>
            <span className="font-mono font-black text-2xl text-white tracking-wide block">
              <AnimatedCounter value={newBalance} isCurrency={true} duration={1.8} />
            </span>
          </div>
        </div>

        {/* Operation button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3.5 rounded-xl font-mono font-bold text-[11px] uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_#00d2ff] active:scale-[0.98] transition-all duration-200 cursor-pointer relative z-10"
        >
          Close Operation Vault
        </button>
      </motion.div>
    </div>
  );
};
