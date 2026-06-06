import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

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

  const handleEmailSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all operator credentials.');
      return;
    }
    if (mode === 'signup' && !name) {
      toast.error('Please enter your operator name.');
      return;
    }

    setIsInserting(true);
    const toastId = toast.loading(
      mode === 'signup' 
        ? 'Registering operator node...' 
        : 'Connecting to secure session...', 
      { id: 'auth' }
    );

    try {
      if (mode === 'signup') {
        const loggedUser = await signUpWithEmail(email, password, name);
        localStorage.setItem('apex_last_uid', loggedUser.uid);
        toast.success('Operator Node Registered Successfully!', { id: toastId });
      } else {
        const loggedUser = await signInWithEmail(email, password);
        localStorage.setItem('apex_last_uid', loggedUser.uid);
        toast.success('Operator Session Authenticated!', { id: toastId });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const err = error as Error;
      toast.error(err.message || 'Operator authentication failed.', { id: toastId });
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
            Insert your digital debit token and authenticate using Google Single Sign-On or secure operator credentials. Engineered with military-grade encryption and real-time ledger sync.
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
            <div className="w-full glass-panel border border-dark-border/25 light:border-light-border/60 rounded-2xl p-5 mb-5 text-center select-none flex flex-col items-center">
              <div className="relative w-12 h-12 mb-3.5 flex items-center justify-center">
                {/* Rotating Outer Ring */}
                <div className="absolute inset-0 rounded-full border border-dashed border-primary/30 animate-[spin_8s_linear_infinite]" />
                
                {/* Cyber Biometric Core */}
                <div className="w-9 h-9 rounded-full bg-dark-bg/60 light:bg-light-bg/40 border border-primary/20 flex items-center justify-center text-primary relative overflow-hidden group shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]">
                  <svg 
                    className="w-5 h-5 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-3.517-1.009-6.799-2.753-9.571m-3.44 2.04l.054-.09A13.916 13.916 0 009 11a13.917 13.917 0 002.212 7.448m3.44-2.04L15 16.5m-7.44-7.44a13.916 13.916 0 00-2.212-7.448m0 0A13.91 13.91 0 003 11a13.918 13.918 0 002.212 7.448M12 11c0 3.517 1.009 6.799 2.753 9.571m3.44-2.04l-.054.09A13.912 13.912 0 0015 11a13.915 13.915 0 00-2.212-7.448m-3.44 2.04L9 4.5M10.5 22.5A9.012 9.012 0 012.25 12c0-1.285.268-2.508.75-3.622m8.25 14.122a9.012 9.012 0 008.25-10.5c0-1.285-.268-2.508-.75-3.622M12 2.25c-4.97 0-9 4.03-9 9 0 1.206.237 2.355.667 3.407" />
                  </svg>
                  <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping pointer-events-none opacity-40" />
                </div>
              </div>

              <div className="text-[12.5px] font-mono tracking-wider font-bold text-dark-text light:text-light-text mb-1 uppercase">
                {mode === 'signin' ? 'Operator Sign In' : 'Operator Register'}
              </div>
              
              <p className="text-[10.5px] text-dark-text/50 light:text-light-text/50 leading-relaxed px-2">
                {mode === 'signin' 
                  ? 'Connect your checking ledger session. Provide your email credentials.' 
                  : 'Enroll checking node details into the security directory.'}
              </p>
            </div>

            {/* Email/Password Access Form */}
            <form onSubmit={handleEmailSubmit} className="w-full space-y-3.5">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label htmlFor="auth-name" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-0.5">Operator Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isInserting}
                    placeholder="e.g. ABHIK MUKHERJEE"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-zinc-900/60 dark:bg-black/45 light:bg-zinc-50 outline-none text-xs text-dark-text light:text-light-text font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-email" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-0.5">Secure Email</label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isInserting}
                  placeholder="operator@nexus.bank"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-zinc-900/60 dark:bg-black/45 light:bg-zinc-50 outline-none text-xs text-dark-text light:text-light-text font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="auth-password" className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold pl-0.5">Session Passphrase</label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isInserting}
                  placeholder="••••••••"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-zinc-200 bg-zinc-900/60 dark:bg-black/45 light:bg-zinc-50 outline-none text-xs text-dark-text light:text-light-text font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isInserting}
                className="w-full py-3 rounded-xl font-display font-bold text-[11.5px] uppercase tracking-widest bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1"
              >
                {mode === 'signin' ? 'Connect Operator Node' : 'Register Checking Profile'}
              </button>
            </form>

            {/* SSO Divider */}
            <div className="w-full flex items-center gap-3 my-4">
              <div className="h-[1px] flex-1 bg-dark-border/10 light:bg-light-border/40" />
              <span className="text-[9px] font-mono text-dark-text/30 light:text-light-text/30 uppercase tracking-widest select-none">OR AUTHENTICATE VIA</span>
              <div className="h-[1px] flex-1 bg-dark-border/10 light:bg-light-border/40" />
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isInserting}
              className="w-full py-3 rounded-xl border border-dark-border/20 light:border-light-border/60 bg-dark-surface/40 light:bg-light-surface text-dark-text light:text-light-text hover:bg-dark-card light:hover:bg-light-card hover:border-primary/20 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 font-bold text-xs tracking-wide shadow-sm"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Mode toggle link */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(prev => prev === 'signin' ? 'signup' : 'signin');
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                disabled={isInserting}
                className="text-[10px] font-mono tracking-wider text-secondary hover:text-primary hover:underline transition-colors uppercase font-bold"
              >
                {mode === 'signin' 
                  ? 'First time here? Register checking node' 
                  : 'Already registered? Login to Node Session'}
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
