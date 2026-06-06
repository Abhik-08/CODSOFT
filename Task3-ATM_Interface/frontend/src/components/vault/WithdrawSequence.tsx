import React, { useEffect, useState } from 'react';
import { QuantumVaultCore } from './QuantumVaultCore';
import { EnergyRingSystem } from './EnergyRingSystem';
import { CurrencyMaterializationEffect } from './CurrencyMaterializationEffect';
import { SuccessSequence } from './SuccessSequence';

type WithdrawStage = 'materialize' | 'scanning' | 'converting' | 'success';

interface WithdrawSequenceProps {
  amount: number;
  newBalance: number;
  onFinished: () => void;
}

export const WithdrawSequence: React.FC<WithdrawSequenceProps> = ({
  amount,
  newBalance,
  onFinished,
}) => {
  const [stage, setStage] = useState<WithdrawStage>('materialize');

  useEffect(() => {
    // Sequence timelines
    const timer1 = setTimeout(() => setStage('scanning'), 2200); // gather and scan notes
    const timer2 = setTimeout(() => setStage('converting'), 5200); // fly to user
    const timer3 = setTimeout(() => setStage('success'), 6800); // shockwave & success

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const isScanning = stage === 'scanning';
  const isConverting = stage === 'converting';
  const isSuccess = stage === 'success';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* 1. Reactor Core & Ring system in background */}
      {!isSuccess && (
        <div className="relative flex items-center justify-center scale-90 sm:scale-100">
          <EnergyRingSystem stage={stage} isActive={isScanning || isConverting} />
          <QuantumVaultCore stage={stage} isDischarging={stage === 'materialize'} pulseSpeed={stage === 'materialize' ? 1.5 : 4} />
        </div>
      )}

      {/* 2. Quantum Note materializer effects */}
      <CurrencyMaterializationEffect
        mode="withdraw"
        amount={amount}
        stage={stage}
      />

      {/* 3. Success hologram rollup overlay */}
      {isSuccess && (
        <SuccessSequence
          mode="withdraw"
          amount={amount}
          newBalance={newBalance}
          onConfirm={onFinished}
        />
      )}

      {/* Stage status headers */}
      {!isSuccess && (
        <div className="absolute top-10 font-mono text-center space-y-1.5 select-none pointer-events-none">
          <span className="text-[9px] text-cyan-400/40 uppercase tracking-[6px] block font-black">
            Vault Dispense Chamber
          </span>
          <span className="text-[12px] text-cyan-400 font-bold uppercase tracking-wider block">
            {stage === 'materialize' && 'EXTRACTING LEDGER VALUES...'}
            {stage === 'scanning' && 'LASER VERIFYING CASH DENOMINATIONS...'}
            {stage === 'converting' && 'DISPENSING NOTES TO GATEWAY...'}
          </span>
        </div>
      )}
    </div>
  );
};
