import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DepositSequence } from './DepositSequence';
import { WithdrawSequence } from './WithdrawSequence';

interface NexusVaultTransactionChamberProps {
  isOpen: boolean;
  mode: 'deposit' | 'withdraw';
  amount: number;
  newBalance: number;
  onFinished: () => void;
}

export const NexusVaultTransactionChamber: React.FC<NexusVaultTransactionChamberProps> = ({
  isOpen,
  mode,
  amount,
  newBalance,
  onFinished,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#02040a] flex flex-col items-center justify-center overflow-hidden font-mono"
        >
          {/* Cyber scanlines overlay */}
          <div className="cyber-scanline pointer-events-none absolute inset-0 z-50 opacity-[0.08]" />

          {/* Ambient space glows */}
          <div className="absolute top-[-25%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-25%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-blue-600/5 blur-[140px] pointer-events-none" />

          {/* Background Matrix-like Digital streams */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0, 210, 255, 0.1) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0, 210, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Core sequence mount */}
          <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center px-4">
            {mode === 'deposit' ? (
              <DepositSequence
                amount={amount}
                newBalance={newBalance}
                onFinished={onFinished}
              />
            ) : (
              <WithdrawSequence
                amount={amount}
                newBalance={newBalance}
                onFinished={onFinished}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
