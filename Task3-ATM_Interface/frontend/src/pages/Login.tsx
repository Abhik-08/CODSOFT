import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCreditCard, FiArrowRight, FiShield, FiRadio } from 'react-icons/fi';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [pin, setPin] = useState<string>('');
  const [isInserting, setIsInserting] = useState(false);
  const navigate = useNavigate();

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = (e?: React.SyntheticEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      toast.error('Passcode must be exactly 4 digits');
      return;
    }

    setIsInserting(true);
    toast.loading('Authenticating secure chip...', { id: 'auth' });

    setTimeout(() => {
      if (pin === '1234' || pin === '0000' || pin.length === 4) { // accept any 4 digit pin for shell demo
        toast.success('Access Granted. Welcome, Abhik Mukherjee', { id: 'auth' });
        navigate('/dashboard');
      } else {
        toast.error('Invalid Secure Token PIN', { id: 'auth' });
        setIsInserting(false);
        setPin('');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark-bg light:bg-light-bg text-dark-text light:text-light-text relative flex items-center justify-center p-4 md:p-6 overflow-hidden transition-colors duration-300">
      {/* Laser scan line */}
      <div className="cyber-scanline" />

      {/* Floating Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[1000px] grid md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
        
        {/* Left column: Branding details */}
        <div className="md:col-span-6 flex flex-col justify-center text-center md:text-left select-none">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent p-[1px] flex items-center justify-center shadow-lg shadow-primary/20">
              <div className="w-full h-full rounded-2xl bg-dark-surface light:bg-light-surface flex items-center justify-center">
                <span className="font-display font-black text-[22px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">A</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-[20px] tracking-wider text-dark-text light:text-light-text leading-tight">APEX_BANK</span>
              <span className="text-[11px] font-mono tracking-widest text-primary font-semibold uppercase flex items-center justify-center md:justify-start gap-1">
                <FiRadio className="w-3.5 h-3.5 animate-pulse" /> ATM_NODE_04
              </span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-[36px] sm:text-[44px] leading-tight text-dark-text light:text-light-text mb-6 tracking-tight">
            The next generation of <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">safe banking</span> terminal.
          </h1>

          <p className="text-dark-text/65 light:text-light-text/65 text-[15px] leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
            Insert your digital debit token and authenticate using your secure 4-digit PIN. Engineered with military-grade encryption and real-time ledger sync.
          </p>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-dark-text/40 light:text-light-text/40 text-xs font-mono tracking-widest uppercase">
              <FiShield className="w-4.5 h-4.5 text-primary" /> SECURE_SHA256
            </div>
            <div className="flex items-center gap-2 text-dark-text/40 light:text-light-text/40 text-xs font-mono tracking-widest uppercase">
              <FiCreditCard className="w-4.5 h-4.5 text-secondary" /> EMV_CHIP_COMPLIANT
            </div>
          </div>
        </div>

        {/* Right column: Interactive ATM panel */}
        <div className="md:col-span-6 flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[400px] glass-card premium-card-shadow rounded-3xl p-6 md:p-8 flex flex-col items-center"
          >
            {/* Visual Chip Card */}
            <motion.div
              animate={isInserting ? { y: 200, scale: 0.8, opacity: 0 } : { y: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#121214] border border-white/5 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden group select-none mb-8"
            >
              {/* Card design styling */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-30 pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-10%] w-36 h-36 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Debit Token</span>
                  <span className="font-display font-extrabold text-[15px] text-white tracking-wider mt-0.5">APEX_DECK</span>
                </div>
                {/* Microchip */}
                <div className="w-9 h-7 rounded-md bg-gradient-to-r from-amber-400 to-amber-200 p-[1px] relative overflow-hidden">
                  <div className="w-full h-full border border-black/10 rounded-md flex flex-wrap p-0.5 opacity-60">
                    <div className="w-1/2 h-1/2 border-r border-b border-black/20" />
                    <div className="w-1/2 h-1/2 border-b border-black/20" />
                    <div className="w-1/2 h-1/2 border-r border-black/20" />
                    <div className="w-1/2 h-1/2" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col relative z-10">
                <span className="font-mono text-white/90 text-[15px] tracking-[4px]">••••  ••••  ••••  8910</span>
                <div className="flex justify-between items-end mt-4">
                  <span className="font-display font-semibold text-[12px] text-white/80">ABHIK MUKHERJEE</span>
                  <span className="font-mono text-white/60 text-[10px]">12 / 29</span>
                </div>
              </div>
            </motion.div>

            {/* ATM Console Display Screen */}
            <div className="w-full glass-panel border border-dark-border/25 light:border-light-border/60 rounded-2xl p-5 mb-6 text-center select-none">
              <div className="flex items-center justify-center gap-2 mb-3 text-dark-text/40 light:text-light-text/40 font-mono text-xs uppercase tracking-widest">
                <FiLock className="w-3.5 h-3.5" /> Security Shield Active
              </div>
              
              <div className="text-[13px] font-medium text-dark-text/70 light:text-light-text/70 mb-4 font-sans">
                ENTER 4-DIGIT SECURITY PIN
              </div>

              {/* Password indicator bubbles */}
              <div className="flex justify-center gap-3.5 mb-2">
                {[0, 1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    animate={pin.length > index ? { scale: 1.15, backgroundColor: 'var(--color-primary)' } : { scale: 1 }}
                    className={`w-3.5 h-3.5 rounded-full border border-dark-text/20 light:border-light-text/25 transition-colors duration-200 ${pin.length > index ? 'bg-primary border-primary' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>

            {/* Virtual PIN Keypad */}
            <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  disabled={isInserting}
                  className="py-3.5 rounded-xl border border-dark-border/5 light:border-light-border/40 bg-dark-surface/50 light:bg-light-surface/90 text-[16px] font-bold text-dark-text light:text-light-text hover:bg-dark-card/80 light:hover:bg-light-card/85 hover:border-primary/20 active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                disabled={isInserting}
                className="py-3.5 rounded-xl border border-dark-border/5 light:border-light-border/40 bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 text-[12px] font-bold tracking-wider uppercase active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                disabled={isInserting}
                className="py-3.5 rounded-xl border border-dark-border/5 light:border-light-border/40 bg-dark-surface/50 light:bg-light-surface/90 text-[16px] font-bold text-dark-text light:text-light-text hover:bg-dark-card/80 light:hover:bg-light-card/85 active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                disabled={isInserting}
                className="py-3.5 rounded-xl border border-dark-border/5 light:border-light-border/40 bg-dark-surface/50 light:bg-light-surface/90 text-[14px] font-bold text-dark-text/80 light:text-light-text/80 hover:bg-dark-card/80 light:hover:bg-light-card/85 active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {/* Authenticate Submit Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={isInserting || pin.length !== 4}
              className="w-full py-4 rounded-xl font-display font-bold text-[14px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authenticate Session</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
