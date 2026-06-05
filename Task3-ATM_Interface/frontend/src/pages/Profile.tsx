import React, { useState } from 'react';
import { FiUser, FiShield, FiLock, FiSliders, FiCreditCard, FiCheck } from 'react-icons/fi';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [limit, setLimit] = useState(2000);
  
  // Password change states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handleCardFreeze = () => {
    setIsFrozen(prev => {
      const next = !prev;
      if (next) {
        toast.success('Debit card frozen. All terminal operations suspended.');
      } else {
        toast.success('Debit card active. Terminal access restored.');
      }
      return next;
    });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(e.target.value);
    setLimit(val);
  };

  const handleLimitSave = () => {
    toast.success(`Daily withdrawal limit set to $${limit.toLocaleString()}`);
  };

  const handlePinChange = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error('All PIN entries must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('New PIN does not match confirmation PIN');
      return;
    }
    
    setIsChangingPin(true);
    const toastId = toast.loading('Syncing security database...');
    
    setTimeout(() => {
      toast.success('Passcode PIN successfully updated!', { id: toastId });
      setIsChangingPin(false);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-black text-[32px] text-dark-text light:text-light-text tracking-tight mb-2">
          Account Dossier
        </h1>
        <p className="text-dark-text/60 light:text-light-text/60 text-[14px]">
          Review account privileges, configure security parameters, and manage cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: User Info & Limit controls */}
        <div className="md:col-span-7 space-y-8">
          
          {/* Card 1: User Info Dossier */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[18px] text-dark-text light:text-light-text">Abhik Mukherjee</h3>
                <span className="text-xs font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md">TIER_1_VIP_STATUS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">User Identity Code</span>
                <span className="text-[13px] font-bold text-dark-text light:text-light-text mt-0.5">APEX_8910</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">Card Association</span>
                <span className="text-[13px] font-mono text-dark-text light:text-light-text mt-0.5">•••• •••• •••• 8910</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">Checking Route</span>
                <span className="text-[13px] font-mono text-dark-text light:text-light-text mt-0.5">RTN_021000021</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 uppercase">Primary Node Node</span>
                <span className="text-[13px] font-bold text-dark-text light:text-light-text mt-0.5">ATM_NODE_04 (SF)</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Security Switches (Card Freeze & Slider) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40 space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-[16px] text-dark-text light:text-light-text uppercase tracking-wider flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-secondary" /> Card Lockdown
                </h3>
                <span className="text-[11px] text-dark-text/40 light:text-light-text/40">Freeze debit transactions instantly</span>
              </div>
              <button
                type="button"
                onClick={handleCardFreeze}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  isFrozen ? 'bg-rose-500' : 'bg-dark-border/40 light:bg-light-border/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    isFrozen ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-dark-border/10 light:border-light-border/40 pt-6 space-y-4">
              <div>
                <h3 className="font-display font-bold text-[16px] text-dark-text light:text-light-text uppercase tracking-wider flex items-center gap-2">
                  <FiSliders className="w-5 h-5 text-accent" /> Withdrawal Adjuster
                </h3>
                <span className="text-[11px] text-dark-text/40 light:text-light-text/40">Configure maximum daily cash limit</span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={limit}
                  onChange={handleLimitChange}
                  className="w-full h-1.5 bg-dark-border/20 light:bg-light-border/80 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs font-mono text-dark-text/50 light:text-light-text/50">
                  <span>Min: $200</span>
                  <span className="font-bold text-primary font-display text-sm">${limit.toLocaleString()}</span>
                  <span>Max: $5,000</span>
                </div>
              </div>

              <button
                onClick={handleLimitSave}
                className="w-fit py-2 px-4.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-card/60 hover:bg-dark-card border border-dark-border/15 light:border-light-border/40 text-dark-text light:text-light-text flex items-center gap-2 cursor-pointer transition-all duration-200"
              >
                <FiCheck className="w-4 h-4 text-primary" />
                <span>Save Limit Preference</span>
              </button>
            </div>
          </motion.div>

        </div>

        {/* Right column: Reset PIN panel */}
        <div className="md:col-span-5 w-full">
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card premium-card-shadow rounded-3xl p-6 border border-dark-border/15 light:border-light-border/40"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FiLock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[16px] text-dark-text light:text-light-text uppercase tracking-wider">Passcode Vault</h3>
                <span className="text-[11px] text-dark-text/40 light:text-light-text/40 font-mono">Reset terminal 4-digit PIN</span>
              </div>
            </div>

            <form onSubmit={handlePinChange} className="space-y-4.5">
              
              {/* Old Pin */}
              <div className="space-y-1.5">
                <label htmlFor="old-pin-input" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Current 4-Digit PIN</label>
                <div className="relative rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-200">
                  <input
                    id="old-pin-input"
                    type="password"
                    maxLength={4}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    disabled={isChangingPin}
                    placeholder="••••"
                    className="w-full py-3 px-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono tracking-[8px] text-[15px] placeholder-dark-text/15 light:placeholder-light-text/20"
                  />
                </div>
              </div>

              {/* New Pin */}
              <div className="space-y-1.5">
                <label htmlFor="new-pin-input" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">New 4-Digit PIN</label>
                <div className="relative rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-200">
                  <input
                    id="new-pin-input"
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    disabled={isChangingPin}
                    placeholder="••••"
                    className="w-full py-3 px-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono tracking-[8px] text-[15px] placeholder-dark-text/15 light:placeholder-light-text/20"
                  />
                </div>
              </div>

              {/* Confirm Pin */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-pin-input" className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Confirm New PIN</label>
                <div className="relative rounded-xl border border-dark-border/10 light:border-light-border/40 bg-dark-surface/30 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-200">
                  <input
                    id="confirm-pin-input"
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    disabled={isChangingPin}
                    placeholder="••••"
                    className="w-full py-3 px-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text font-mono tracking-[8px] text-[15px] placeholder-dark-text/15 light:placeholder-light-text/20"
                  />
                </div>
              </div>

              {/* Security Shield status warning */}
              <div className="flex gap-2.5 items-start text-[10px] text-dark-text/40 light:text-light-text/40 font-sans leading-relaxed">
                <FiShield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>PIN updates occur instantly. Once submitted, your card swipe will reject the old passcode credentials at all terminal slots.</span>
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={isChangingPin || oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}
                className="w-full py-3.5 rounded-xl font-display font-bold text-[12px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Commit PIN Update</span>
              </button>

            </form>
          </motion.div>
        </div>

      </div>

    </div>
  );
};
