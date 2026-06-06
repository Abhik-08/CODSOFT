import React, { useEffect, useState } from 'react';
import { QuantumVaultCore } from './QuantumVaultCore';
import { EnergyRingSystem } from './EnergyRingSystem';
import { CurrencyMaterializationEffect } from './CurrencyMaterializationEffect';
import { SuccessSequence } from './SuccessSequence';

type DepositStage = 'materialize' | 'scanning' | 'converting' | 'success';

interface DepositSequenceProps {
  amount: number;
  newBalance: number;
  onFinished: () => void;
}

export const DepositSequence: React.FC<DepositSequenceProps> = ({
  amount,
  newBalance,
  onFinished,
}) => {
  const [stage, setStage] = useState<DepositStage>('materialize');

  useEffect(() => {
    // Sequence timelines
    const timer1 = setTimeout(() => setStage('scanning'), 2500); // scan notes
    const timer2 = setTimeout(() => setStage('converting'), 5500); // absorb energy
    const timer3 = setTimeout(() => setStage('success'), 7200); // shockwave & success

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
          <QuantumVaultCore stage={stage} isCharging={isConverting} pulseSpeed={isConverting ? 1.5 : 4} />
        </div>
      )}

      {/* 2. Quantum Note materializer effects */}
      <CurrencyMaterializationEffect
        mode="deposit"
        amount={amount}
        stage={stage}
      />

      {/* 3. Success hologram rollup overlay */}
      {isSuccess && (
        <SuccessSequence
          mode="deposit"
          amount={amount}
          newBalance={newBalance}
          onConfirm={onFinished}
        />
      )}

      {/* Cinematic stage title display at the top of the chamber */}
      {!isSuccess && (
        <div className="absolute top-10 font-mono text-center space-y-1.5 select-none pointer-events-none">
          <span className="text-[9px] text-cyan-400/40 uppercase tracking-[6px] block font-black">
            Vault Intake Chamber
          </span>
          <span className="text-[12px] text-cyan-400 font-bold uppercase tracking-wider block">
            {stage === 'materialize' && 'DIGITIZING CURRENCY BUNDLES...'}
            {stage === 'scanning' && 'CLEARING CREDITS AUTH NODE_04...'}
            {stage === 'converting' && 'ABSORBING INTEGRATED CORES...'}
          </span>
        </div>
      )}
    </div>
  );
};
