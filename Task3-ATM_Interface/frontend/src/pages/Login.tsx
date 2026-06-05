import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';

// Custom Animated Banking Illustration
const BankingIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Pulse Ambient Glow */}
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] animate-pulse-glow" />
      
      {/* Floating Card and Particles container */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full relative"
      >
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
          {/* Custom linear gradients */}
          <defs>
            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Secure shield contour in background */}
          <path 
            d="M200,60 L290,100 L290,220 C290,280 250,330 200,350 C150,330 110,280 110,220 L110,100 Z" 
            fill="url(#shieldGrad)" 
            stroke="rgba(255,255,255,0.06)" 
            strokeWidth="1.5" 
          />
          
          {/* Hologram card representing account credentials */}
          <rect x="80" y="130" width="240" height="150" rx="18" fill="url(#cardGrad)" opacity="0.95" />
          
          {/* Card Details */}
          <rect x="100" y="150" width="32" height="24" rx="5" fill="rgba(255,255,255,0.25)" />
          <circle cx="270" cy="240" r="18" fill="rgba(255,255,255,0.18)" />
          <circle cx="290" cy="240" r="18" fill="rgba(255,255,255,0.18)" />
          <rect x="100" y="200" width="110" height="8" rx="2" fill="rgba(255,255,255,0.35)" />
          <rect x="100" y="220" width="70" height="6" rx="2" fill="rgba(255,255,255,0.2)" />

          {/* Floating Gold Coin 1 */}
          <g className="animate-float" style={{ transformOrigin: '70px 105px' }}>
            <circle cx="70" cy="105" r="16" fill="url(#coinGrad)" />
            <text x="66" y="110" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="monospace">$</text>
          </g>
          
          {/* Floating Gold Coin 2 */}
          <g className="animate-float" style={{ transformOrigin: '320px 95px', animationDelay: '1.2s' }}>
            <circle cx="320" cy="95" r="12" fill="url(#coinGrad)" />
            <text x="317" y="99" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="monospace">$</text>
          </g>

          {/* Floating Gold Coin 3 */}
          <g className="animate-float" style={{ transformOrigin: '325px 285px', animationDelay: '2.2s' }}>
            <circle cx="325" cy="285" r="14" fill="url(#coinGrad)" />
            <text x="321" y="289" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="monospace">$</text>
          </g>

          {/* Central Secure Lock core */}
          <circle cx="200" cy="205" r="28" fill="rgba(10,10,12,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <path d="M193,205 L193,198 C193,194 196,191 200,191 C204,191 207,194 207,198 L207,205" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="189" y="204" width="22" height="16" rx="3.5" fill="#10b981" />
        </svg>
      </motion.div>
    </div>
  );
};

import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [isInserting, setIsInserting] = useState(false);
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  // Redirect if user is already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setIsInserting(true);
    const toastId = toast.loading('Syncing Google Single Sign-On...', { id: 'auth' });

    try {
      const loggedUser = await signInWithGoogle();
      localStorage.setItem('apex_last_uid', loggedUser.uid);
      toast.success('Google Authentication Successful!', { id: toastId });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError?.code === 'auth/popup-closed-by-user') {
        toast.error('Google Sign-In canceled.', { id: toastId });
      } else {
        toast.error(firebaseError?.message || 'Google Authentication failed.', { id: toastId });
      }
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg light:bg-light-bg text-dark-text light:text-light-text relative flex items-center justify-center p-4 md:p-8 overflow-hidden transition-colors duration-300">
      {/* Cyber overlay */}
      <div className="cyber-scanline" />

      {/* Ambient Gradient Orbs */}
      <div className="absolute top-[-25%] left-[-20%] w-[65vw] h-[65vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-20%] w-[65vw] h-[65vw] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[1050px] grid md:grid-cols-12 gap-8 md:gap-16 items-center relative z-10">
        
        {/* Left Side: Illustration & Marketing */}
        <div className="md:col-span-6 flex flex-col justify-center text-center md:text-left select-none">
          <div className="flex items-center gap-5 justify-center md:justify-start mb-8">
            <img 
              src="/nexus_symbol.jpg" 
              alt="Nexus Logo" 
              className="h-24 w-24 rounded-3xl object-contain shadow-[0_0_35px_rgba(6,182,212,0.3)] border border-dark-border/20"
            />
            <div className="flex flex-col text-left justify-center">
              <span className="font-mono tracking-wider font-black text-[44px] flex items-center leading-none mb-2.5">
                <span className="text-dark-text light:text-light-text font-black">NEXUS</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 ml-3.5 font-black">VAULT</span>
              </span>
              <span className="text-[12.5px] font-mono tracking-[0.2em] text-primary font-black uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#10b981]" /> NEXUS_NODE_04
              </span>
            </div>
          </div>

          <h1 className="font-display font-black text-[34px] sm:text-[46px] leading-[115%] text-dark-text light:text-light-text mb-6 tracking-tight">
            The next generation of <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">safe banking</span> terminal.
          </h1>

          <p className="text-dark-text/65 light:text-light-text/65 text-[15px] leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
            Insert your digital debit token and authenticate using Google Single Sign-On. Engineered with military-grade encryption and real-time ledger sync.
          </p>

          {/* Core Banking Illustration */}
          <div className="w-full flex justify-center md:justify-start">
            <BankingIllustration />
          </div>
        </div>

        {/* Right Side: Interactive Login Panel */}
        <div className="md:col-span-6 flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[400px] glass-card premium-card-shadow rounded-3xl p-6 md:p-8 flex flex-col items-center border border-dark-border/20 light:border-light-border/45"
          >
            {/* ATM Console Display Screen */}
            <div className="w-full glass-panel border border-dark-border/25 light:border-light-border/60 rounded-2xl p-6 mb-6 text-center select-none flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-pulse-glow">
                <FiShield className="w-6 h-6" />
              </div>
              
              <div className="text-[14px] font-mono tracking-wider font-bold text-dark-text light:text-light-text mb-2 uppercase">
                ATM SESSION TERMINAL
              </div>
              
              <p className="text-xs text-dark-text/50 light:text-light-text/50 leading-relaxed">
                Connect your card ledger. Please authenticate using your secure Google account.
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isInserting}
              className="w-full py-4 rounded-xl border border-dark-border/20 light:border-light-border/60 bg-dark-surface/40 light:bg-light-surface text-dark-text light:text-light-text hover:bg-dark-card light:hover:bg-light-card hover:border-primary/20 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-3.5 font-bold text-sm tracking-wide shadow-sm"
            >
              <FcGoogle className="w-6 h-6" />
              <span>Continue with Google</span>
            </button>
            
            <div className="text-[10px] font-mono text-dark-text/30 light:text-light-text/30 mt-6 tracking-widest uppercase">
              Secure SSL 256-bit Encrypted
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
