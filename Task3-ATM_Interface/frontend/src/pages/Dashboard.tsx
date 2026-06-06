import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VirtualCard } from '../components/dashboard/VirtualCard';
import { StatCard } from '../components/dashboard/StatCard';
import { AnalyticsSection } from '../components/dashboard/AnalyticsSection';
import FinancialInsightsCard from '../components/FinancialInsightsCard';
import { FiTrendingUp, FiActivity, FiArrowRight, FiDownload, FiUpload, FiList, FiLock } from 'react-icons/fi';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, type TransactionInfo } from '../services/firestoreService';
import toast from 'react-hot-toast';



export const Dashboard: React.FC = () => {
  const isFrozen = localStorage.getItem('apex_card_frozen') === 'true';
  const { user, balance } = useAuth();
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  // Secure PIN Setup Modal State
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirmPin, setSetupConfirmPin] = useState('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);

  useEffect(() => {
    if (user) {
      const storedUserPin = localStorage.getItem(`profile_pin_${user.uid}`);
      if (!storedUserPin) {
        setShowPinSetup(true);
      }
    }
  }, [user]);

  const handleActivateCard = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (setupPin.length !== 4 || setupConfirmPin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }
    if (setupPin !== setupConfirmPin) {
      toast.error('PIN codes do not match');
      return;
    }
    if (setupPin === '1234' || setupPin === '0000' || setupPin === '1111') {
      toast.error('Security Alert: Simple PINs (e.g. 1234, 0000) are not allowed. Please choose a more secure code.');
      return;
    }

    setIsSubmittingPin(true);
    const toastId = toast.loading('Syncing security database...');
    
    setTimeout(() => {
      if (user) {
        localStorage.setItem(`profile_pin_${user.uid}`, setupPin);
        localStorage.setItem('profile_pin', setupPin); // Legacy sync fallback
      }
      toast.success('Secure ATM PIN configured and card activated successfully!', { id: toastId });
      setIsSubmittingPin(false);
      setShowPinSetup(false);
    }, 1500);
  };

  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('profile_name') || user?.displayName || 'ABHIK MUKHERJEE';
  });
  const [profileCardNo, setProfileCardNo] = useState(() => {
    return localStorage.getItem('profile_card_number') || '4532781290128910';
  });
  const [profileExpiry, setProfileExpiry] = useState(() => {
    return localStorage.getItem('profile_expiry') || '06/31';
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileName(localStorage.getItem('profile_name') || user?.displayName || 'ABHIK MUKHERJEE');
      setProfileCardNo(localStorage.getItem('profile_card_number') || '4532781290128910');
      setProfileExpiry(localStorage.getItem('profile_expiry') || '06/31');
    };
    globalThis.addEventListener('profile_update', handleProfileUpdate);
    return () => {
      globalThis.removeEventListener('profile_update', handleProfileUpdate);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const loadTxnData = async () => {
      try {
        const data = await getTransactions(user.uid);
        if (isMounted) {
          setTransactions(data);
        }
      } catch (err) {
        console.error('Error loading dashboard transactions:', err);
      } finally {
        if (isMounted) {
          setLoadingTxns(false);
        }
      }
    };
    loadTxnData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Get short display name or fallback
  const operatorName = `Operator ${profileName.split(' ')[0]}`;

  const totalDeposited = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawn = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOperations = transactions.length;

  const displayTransactions = transactions.slice(0, 5);

  const formatTimestamp = (ts: unknown) => {
    if (!ts) return 'Pending...';
    const timestampObj = ts as { toDate?: () => Date };
    if (typeof timestampObj.toDate === 'function') {
      return timestampObj.toDate().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(ts as string | number | Date).toLocaleDateString('en-IN');
  };

  const renderTransactionsTableBody = () => {
    if (loadingTxns) {
      return (
        <tr>
          <td colSpan={4} className="py-8 text-center text-[12px] opacity-65 text-cyan-500/60">
            Retrieving live terminal logs...
          </td>
        </tr>
      );
    }
    if (displayTransactions.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="py-8 text-center text-[12px] opacity-65 text-cyan-500/60">
            No terminal dossier logs on file.
          </td>
        </tr>
      );
    }
    return displayTransactions.map((tx) => (
      <tr key={tx.id} className="hover:bg-cyan-500/5 transition-colors duration-150">
        <td className="py-3.5 px-6 whitespace-nowrap text-[12px] opacity-80">
          {formatTimestamp(tx.createdAt)}
        </td>
        <td className="py-3.5 px-6 text-[12px] font-bold">
          {tx.description}
        </td>
        <td className="py-3.5 px-6 text-[10px] opacity-65">
          {tx.id.slice(0, 10).toUpperCase()}
        </td>
        <td className="py-3.5 px-6 text-right whitespace-nowrap">
          <span className={`text-[12.5px] font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {tx.type === 'credit' ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <h1 className="font-mono font-black text-[28px] md:text-[32px] text-dark-text light:text-light-text tracking-tight mb-1.5 uppercase">
            Welcome, {operatorName}
          </h1>
          <p className="text-dark-text/60 light:text-light-text/60 text-[13px] font-mono">
            Nexus Core automated ATM secure vault active. Node state: <span className="text-emerald-500 font-bold">SECURE_SYNC</span>.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="flex items-center gap-3 bg-[var(--panel)] border border-[var(--border-dark)] shadow-recessed rounded-2xl px-4.5 py-2 w-fit"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_1px_#10b981] animate-pulse" />
          <span className="text-[11px] font-mono text-dark-text/75 light:text-light-text/75 uppercase tracking-wider">Session Active</span>
        </motion.div>
      </div>

      {/* 2. Top row: Virtual ATM Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Virtual ATM Card Display */}
        <motion.div 
          initial={{ opacity: 0, x: -25, scale: 0.98, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start"
        >
          <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase mb-3 block font-bold self-start pl-1">
            Active Debit Token Card
          </span>
          <VirtualCard
            name={profileName.toUpperCase()}
            cardNumber={profileCardNo}
            expiry={profileExpiry}
            isFrozen={isFrozen}
          />
        </motion.div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-7 flex flex-col">
          <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase mb-3 block font-bold pl-1">
            ATM Console Quick Desk
          </span>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Action 1: Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="flex"
            >
              <Link
                to="/deposit"
                className="flex flex-col justify-between w-full glass-card border border-[var(--border-dark)] rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-[var(--shadow-floating)] active:translate-y-[1px] active:shadow-pressed transition-all duration-200 group relative overflow-hidden"
              >
                {/* Corner Screws */}
                <div className="absolute top-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute top-2 right-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 right-2 corner-screw opacity-35 z-20" />

                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-primary bg-primary/10 border border-dark-border/20 shadow-recessed transition-all duration-300 group-hover:scale-105 mt-1">
                  <FiDownload className="w-4 h-4" />
                </div>

                {/* Deposit Vector Graphic */}
                <div className="w-full h-36 my-3.5 rounded-xl border border-dark-border/10 light:border-[var(--border-dark)] bg-[var(--recessed)] relative flex items-center justify-center overflow-hidden transition-all duration-300">
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/5 light:bg-emerald-500/10 blur-[20px] group-hover:bg-emerald-500/10 transition-all duration-300" />
                  <div className="relative z-10 flex flex-col items-center">
                    <svg className="w-24 h-24 text-emerald-400 transition-all duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(16,185,129,0.4)]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <defs>
                        <linearGradient id="depositGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.1"/>
                        </linearGradient>
                        <linearGradient id="slotGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8"/>
                          <stop offset="50%" stopColor="#10b981" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.8"/>
                        </linearGradient>
                      </defs>
                      <path d="M20 20h60v60H20z" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-15" />
                      <path d="M50 10v80M10 50h80" stroke="currentColor" strokeWidth="0.25" className="opacity-10" />

                      <rect x="15" y="70" width="70" height="12" rx="4" fill="url(#slotGrad)" stroke="#10b981" strokeWidth="1.5" className="opacity-80" />
                      <line x1="20" y1="76" x2="80" y2="76" stroke="#10b981" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />

                      <g className="transition-transform duration-500 ease-in-out group-hover:translate-y-3">
                        <rect x="30" y="25" width="40" height="40" rx="3" fill="url(#depositGrad)" stroke="#10b981" strokeWidth="1.5" />
                        <circle cx="50" cy="45" r="7" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
                        <path d="M47 45h6M50 42v6" stroke="#10b981" strokeWidth="1" strokeLinecap="round" />
                        <rect x="35" y="30" width="8" height="6" rx="1" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="0.75" />
                        <line x1="35" y1="58" x2="65" y2="58" stroke="#10b981" strokeWidth="1" strokeDasharray="1 3" />
                        <line x1="35" y1="61" x2="55" y2="61" stroke="#10b981" strokeWidth="1" strokeDasharray="1 2" />
                      </g>

                      <line x1="25" y1="42" x2="75" y2="42" stroke="#34d399" strokeWidth="1.5" className="opacity-60 group-hover:animate-[bounce_2s_infinite]" />
                      <path d="M50 12v10M46 18l4 4 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 animate-bounce" />
                    </svg>
                  </div>
                </div>

                <div className="mb-1 px-1">
                  <h4 className="font-mono font-bold text-[14.5px] text-dark-text light:text-light-text group-hover:text-primary transition-colors duration-200 uppercase tracking-wider leading-none">
                    Deposit / Credit
                  </h4>
                  <p className="text-[11.5px] text-dark-text/50 light:text-light-text/50 mt-1.5 leading-normal font-sans font-medium">
                    Insert cash envelopes / checks
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Action 2: Withdraw */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              className="flex"
            >
              <Link
                to="/withdraw"
                className="flex flex-col justify-between w-full glass-card border border-[var(--border-dark)] rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-[var(--shadow-floating)] active:translate-y-[1px] active:shadow-pressed transition-all duration-200 group relative overflow-hidden"
              >
                {/* Corner Screws */}
                <div className="absolute top-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute top-2 right-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 right-2 corner-screw opacity-35 z-20" />

                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-secondary bg-secondary/10 border border-dark-border/20 shadow-recessed transition-all duration-300 group-hover:scale-105 mt-1">
                  <FiUpload className="w-4 h-4" />
                </div>

                {/* Withdraw Vector Graphic */}
                <div className="w-full h-36 my-3.5 rounded-xl border border-dark-border/10 light:border-[var(--border-dark)] bg-[var(--recessed)] relative flex items-center justify-center overflow-hidden transition-all duration-300">
                  <div className="absolute w-24 h-24 rounded-full bg-blue-500/5 light:bg-blue-500/10 blur-[20px] group-hover:bg-blue-500/10 transition-all duration-300" />
                  <div className="relative z-10 flex flex-col items-center">
                    <svg className="w-24 h-24 text-blue-400 transition-all duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(59,130,246,0.4)]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <defs>
                        <linearGradient id="withdrawGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1"/>
                        </linearGradient>
                        <linearGradient id="dispenserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8"/>
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8"/>
                        </linearGradient>
                      </defs>
                      <path d="M20 20h60v60H20z" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-15" />
                      <path d="M50 10v80M10 50h80" stroke="currentColor" strokeWidth="0.25" className="opacity-10" />

                      <rect x="15" y="20" width="70" height="12" rx="4" fill="url(#dispenserGrad)" stroke="#3b82f6" strokeWidth="1.5" className="opacity-80" />
                      <line x1="20" y1="26" x2="80" y2="26" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />

                      <g className="transition-transform duration-500 ease-in-out group-hover:translate-y-[-3px] group-hover:scale-105" style={{ transformOrigin: '50px 45px' }}>
                        <rect x="25" y="32" width="50" height="30" rx="3" fill="url(#withdrawGrad)" stroke="#3b82f6" strokeWidth="1.5" />
                        <circle cx="50" cy="47" r="8" stroke="#3b82f6" strokeWidth="1" fill="#1d4ed8" fillOpacity="0.1" />
                        <path d="M47 43h6M47 46.5h6M49.5 43c0 2 3.5 3 3.5 3.5 0 2-3.5 3.5-3.5 3.5M47 43v7M49.5 50l3.5 3.5" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="29" y="36" width="42" height="22" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 2" className="opacity-60" />
                        <circle cx="33" cy="39" r="1.5" fill="#3b82f6" className="opacity-60" />
                        <circle cx="67" cy="39" r="1.5" fill="#3b82f6" className="opacity-60" />
                        <circle cx="33" cy="55" r="1.5" fill="#3b82f6" className="opacity-60" />
                        <circle cx="67" cy="55" r="1.5" fill="#3b82f6" className="opacity-60" />
                      </g>

                      <path d="M50 72v12M46 78l4 4 4-4" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 animate-bounce" />
                    </svg>
                  </div>
                </div>

                <div className="mb-1 px-1">
                  <h4 className="font-mono font-bold text-[14.5px] text-dark-text light:text-light-text group-hover:text-secondary transition-colors duration-200 uppercase tracking-wider leading-none">
                    Withdraw / Debit
                  </h4>
                  <p className="text-[11.5px] text-dark-text/50 light:text-light-text/50 mt-1.5 leading-normal font-sans font-medium">
                    Dispense vault paper bills
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Action 3: Ledger */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
              className="flex"
            >
              <Link
                to="/history"
                className="flex flex-col justify-between w-full glass-card border border-[var(--border-dark)] rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-[var(--shadow-floating)] active:translate-y-[1px] active:shadow-pressed transition-all duration-200 group relative overflow-hidden"
              >
                {/* Corner Screws */}
                <div className="absolute top-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute top-2 right-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 right-2 corner-screw opacity-35 z-20" />

                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-accent bg-accent/10 border border-dark-border/20 shadow-recessed transition-all duration-300 group-hover:scale-105 mt-1">
                  <FiList className="w-4 h-4" />
                </div>

                {/* Ledger Vector Graphic */}
                <div className="w-full h-36 my-3.5 rounded-xl border border-dark-border/10 light:border-[var(--border-dark)] bg-[var(--recessed)] relative flex items-center justify-center overflow-hidden transition-all duration-300">
                  <div className="absolute w-24 h-24 rounded-full bg-purple-500/5 light:bg-purple-500/10 blur-[20px] group-hover:bg-purple-500/10 transition-all duration-300" />
                  <div className="relative z-10 flex flex-col items-center">
                    <svg className="w-24 h-24 text-purple-400 transition-all duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.4)]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <defs>
                        <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2"/>
                        </linearGradient>
                      </defs>
                      <path d="M20 20h60v60H20z" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" className="opacity-15" />
                      <path d="M50 10v80M10 50h80" stroke="currentColor" strokeWidth="0.25" className="opacity-10" />

                      <circle cx="50" cy="50" r="38" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-45 group-hover:animate-[spin_20s_linear_infinite]" style={{ transformOrigin: '50px 50px' }} />
                      <circle cx="50" cy="50" r="32" stroke="#8b5cf6" strokeWidth="0.75" strokeDasharray="10 5" className="opacity-30 group-hover:animate-[spin_10s_linear_infinite]" style={{ transformOrigin: '50px 50px' }} />

                      <g className="transition-transform duration-500 ease-in-out group-hover:translate-y-[-2px]">
                        <ellipse cx="50" cy="32" rx="16" ry="6" fill="url(#dbGrad)" stroke="#8b5cf6" strokeWidth="1.5" />
                        <path d="M34 32v10c0 3.3 7.2 6 16 6s16-2.7 16-6V32" stroke="#8b5cf6" strokeWidth="1.5" />
                        
                        <ellipse cx="50" cy="46" rx="16" ry="6" fill="url(#dbGrad)" fillOpacity="0.3" stroke="#8b5cf6" strokeWidth="1.25" />
                        <path d="M34 46v10c0 3.3 7.2 6 16 6s16-2.7 16-6V46" stroke="#8b5cf6" strokeWidth="1.5" />
                        
                        <ellipse cx="50" cy="60" rx="16" ry="6" fill="url(#dbGrad)" fillOpacity="0.1" stroke="#8b5cf6" strokeWidth="1" />
                        <path d="M34 60v10c0 3.3 7.2 6 16 6s16-2.7 16-6V60" stroke="#8b5cf6" strokeWidth="1.5" />

                        <circle cx="50" cy="32" r="1.5" fill="#c084fc" className="animate-ping" />
                        <circle cx="50" cy="46" r="1.5" fill="#c084fc" className="opacity-70" />
                        <circle cx="50" cy="60" r="1.5" fill="#c084fc" className="opacity-70" />
                      </g>

                      <rect x="22" y="58" width="3" height="12" rx="0.5" fill="#8b5cf6" className="opacity-40 group-hover:animate-pulse" />
                      <rect x="27" y="52" width="3" height="18" rx="0.5" fill="#8b5cf6" className="opacity-50 group-hover:animate-pulse" />
                      <rect x="70" y="55" width="3" height="15" rx="0.5" fill="#a78bfa" className="opacity-45 group-hover:animate-pulse" />
                      <rect x="75" y="62" width="3" height="8" rx="0.5" fill="#a78bfa" className="opacity-35 group-hover:animate-pulse" />
                    </svg>
                  </div>
                </div>

                <div className="mb-1 px-1">
                  <h4 className="font-mono font-bold text-[14.5px] text-dark-text light:text-light-text group-hover:text-accent transition-colors duration-200 uppercase tracking-wider leading-none">
                    Account / Ledger
                  </h4>
                  <p className="text-[11.5px] text-dark-text/50 light:text-light-text/50 mt-1.5 leading-normal font-sans font-medium">
                    Full transaction search audit
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

      </div>

      {/* 3. Statistics Cards */}
      <div className="space-y-3">
        <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-1">
          Ledger Balance Statistics
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Net Balance"
            value={balance}
            icon={FiTrendingUp}
            gradientId="primary-grad"
            isCurrency={true}
            trendText="Live balance"
            trendType="neutral"
            delay={0.05}
          />
          <StatCard
            title="Total Deposited"
            value={totalDeposited}
            icon={FiDownload}
            gradientId="secondary-grad"
            isCurrency={true}
            trendText="Sum credits"
            trendType="up"
            delay={0.1}
          />
          <StatCard
            title="Total Withdrawn"
            value={totalWithdrawn}
            icon={FiUpload}
            gradientId="rose-grad"
            isCurrency={true}
            trendText="Sum debits"
            trendType="down"
            delay={0.15}
          />
          <StatCard
            title="Total System Operations"
            value={totalOperations}
            icon={FiActivity}
            gradientId="accent-grad"
            isCurrency={false}
            trendText={`${totalOperations} logs`}
            trendType="neutral"
            delay={0.2}
          />
        </div>
      </div>

      {/* 3.5 Analytics Section */}
      <AnalyticsSection transactions={transactions} />

      {/* AI Financial Insights Section */}
      <FinancialInsightsCard />

      {/* 4. Recent Activity Log - styled as a CRT Green-Screen Terminal */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold">
            Recent Terminal Dossier Logs
          </span>
          <Link
            to="/history"
            className="flex items-center gap-1 text-[9px] font-mono font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors duration-200"
          >
            <span>Full Ledger Audit</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="crt-screen rounded-2xl border border-[var(--border-dark)] overflow-hidden shadow-recessed p-1"
        >
          {/* CRT Screen Frame overlay shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30 pointer-events-none z-10" />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-dark-border/30 bg-black/60 text-[9px] text-cyan-500/60 uppercase tracking-widest">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Activity details</th>
                  <th className="py-3.5 px-6">Reference token</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10 text-cyan-400 bg-black/45">
                {renderTransactionsTableBody()}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ATM Card Security PIN Activation Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[430px] glass-card premium-card-shadow border border-dark-border/25 light:border-light-border/60 rounded-3xl p-5 md:p-6 relative overflow-hidden text-center"
          >
            {/* Ambient glows */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Shield and Lock Header */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent p-[1px] flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <div className="w-full h-full rounded-2xl bg-dark-surface light:bg-light-surface flex items-center justify-center">
                <FiLock className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>

            <h3 className="font-mono font-black text-[20px] tracking-wider text-dark-text light:text-light-text uppercase mb-1.5">
              Secure Card Activation
            </h3>
            <p className="text-[12px] text-dark-text/60 light:text-light-text/60 leading-relaxed mb-4.5 font-sans px-2">
              Welcome to <strong>Nexus Vault</strong>. To activate your secure debit token card, configure a personalized 4-digit PIN code. This PIN is required to authorize withdrawals and secure terminal access.
            </p>

            <form onSubmit={handleActivateCard} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* PIN Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="setup-pin" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-1">Choose PIN</label>
                  <input
                    id="setup-pin"
                    type="password"
                    maxLength={4}
                    value={setupPin}
                    onChange={(e) => setSetupPin(e.target.value.replace(/\D/g, ''))}
                    disabled={isSubmittingPin}
                    placeholder="••••"
                    autoComplete="new-password"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-300 bg-zinc-900/90 dark:bg-black/60 light:bg-zinc-50 outline-none text-[18px] text-dark-text light:text-light-text font-mono tracking-[8px] text-center placeholder-dark-text/20 light:placeholder-light-text/30 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 shadow-inner"
                  />
                </div>

                {/* Confirm PIN Input */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="confirm-setup-pin" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-1">Confirm PIN</label>
                  <input
                    id="confirm-setup-pin"
                    type="password"
                    maxLength={4}
                    value={setupConfirmPin}
                    onChange={(e) => setSetupConfirmPin(e.target.value.replace(/\D/g, ''))}
                    disabled={isSubmittingPin}
                    placeholder="••••"
                    autoComplete="new-password"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-300 bg-zinc-900/90 dark:bg-black/60 light:bg-zinc-50 outline-none text-[18px] text-dark-text light:text-light-text font-mono tracking-[8px] text-center placeholder-dark-text/20 light:placeholder-light-text/30 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 shadow-inner"
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={isSubmittingPin || setupPin.length !== 4 || setupConfirmPin.length !== 4}
                className="w-full py-3 rounded-xl font-display font-bold text-[12px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
              >
                {isSubmittingPin ? 'Encrypting Code...' : 'Activate ATM Token & PIN'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
