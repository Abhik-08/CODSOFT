import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'motion/react';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

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
  const [showPassword, setShowPassword] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Limit rotation to maximum of 8 degrees
    setRotate({
      x: (x / (box.width / 2)) * 8,
      y: -(y / (box.height / 2)) * 8,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

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

    let formattedEmail = email.trim();
    if (formattedEmail.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formattedEmail)) {
        toast.error('Please enter a valid email address.');
        return;
      }
    } else {
      const slug = formattedEmail
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '.')
        .replace(/\.+/g, '.');
      formattedEmail = `${slug}@nexus.bank`;
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
        const loggedUser = await signUpWithEmail(formattedEmail, password, name);
        localStorage.setItem('apex_last_uid', loggedUser.uid);
        toast.success('Operator Node Registered Successfully!', { id: toastId });
      } else {
        const loggedUser = await signInWithEmail(formattedEmail, password);
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
      <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-purple-500/10 via-pink-500/5 to-transparent blur-[130px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2.5s' }} />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[1050px] grid md:grid-cols-12 gap-8 md:gap-16 items-center relative z-10">
        
        {/* Left Side: Illustration & Marketing */}
        <div className="md:col-span-6 flex flex-col justify-center text-center md:text-left select-none">
          <div className="flex items-center gap-5 justify-center md:justify-start mb-8">
            <img 
              src="/nexus_symbol.png" 
              alt="Nexus Logo" 
              className="h-24 w-24 object-contain"
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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
              transform: `perspective(1000px) rotateX(${rotate.y}deg) rotateY(${rotate.x}deg)`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-full max-w-[400px] bg-white/5 dark:bg-black/35 light:bg-white/80 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-zinc-200 rounded-[28px] p-8 flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 relative overflow-hidden"
          >
            {/* Ambient subtle glow inside the card */}
            <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl pointer-events-none" />

            <h2 className="text-[32px] font-bold font-sans text-white light:text-zinc-900 mb-8 text-center select-none tracking-tight">
              {mode === 'signin' ? 'Login' : 'Register'}
            </h2>

            {/* Email/Password Access Form */}
            <form onSubmit={handleEmailSubmit} className="w-full space-y-4 relative z-10">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label htmlFor="auth-name" className="text-[11.5px] font-sans font-semibold text-white/70 light:text-zinc-600 pl-1 block">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isInserting}
                      placeholder="Full Name"
                      className="w-full py-3.5 pl-6 pr-12 rounded-full border border-white/15 dark:border-white/10 light:border-zinc-200 bg-white/10 dark:bg-black/20 light:bg-zinc-100/50 outline-none text-sm text-white light:text-zinc-900 placeholder-white/40 light:placeholder-zinc-400 focus:border-white/30 dark:focus:border-white/20 light:focus:border-zinc-400 transition-all duration-200"
                    />
                    <FiUser className="absolute right-4.5 text-white/40 light:text-zinc-400 w-4.5 h-4.5" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="text-[11.5px] font-sans font-semibold text-white/70 light:text-zinc-600 pl-1 block">
                  Username
                </label>
                <div className="relative flex items-center">
                  <input
                    id="auth-email"
                    type="text"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isInserting}
                    placeholder="Username"
                    className="w-full py-3.5 pl-6 pr-12 rounded-full border border-white/15 dark:border-white/10 light:border-zinc-200 bg-white/10 dark:bg-black/20 light:bg-zinc-100/50 outline-none text-sm text-white light:text-zinc-900 placeholder-white/40 light:placeholder-zinc-400 focus:border-white/30 dark:focus:border-white/20 light:focus:border-zinc-400 transition-all duration-200"
                  />
                  <FiUser className="absolute right-4.5 text-white/40 light:text-zinc-400 w-4.5 h-4.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="text-[11.5px] font-sans font-semibold text-white/70 light:text-zinc-600 pl-1 block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === 'signin' ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isInserting}
                    placeholder="Password"
                    className="w-full py-3.5 pl-6 pr-20 rounded-full border border-white/15 dark:border-white/10 light:border-zinc-200 bg-white/10 dark:bg-black/20 light:bg-zinc-100/50 outline-none text-sm text-white light:text-zinc-900 placeholder-white/40 light:placeholder-zinc-400 focus:border-white/30 dark:focus:border-white/20 light:focus:border-zinc-400 transition-all duration-200"
                  />
                  <div className="absolute right-5 flex items-center gap-2.5 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Password visibility toggle clicked. State was:", showPassword);
                        setShowPassword(prev => !prev);
                      }}
                      className="text-white/40 light:text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors cursor-pointer flex items-center justify-center p-1 relative z-30 pointer-events-auto"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                    </button>
                    <FiLock className="text-white/40 light:text-zinc-400 w-4.5 h-4.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action row with remember me and forgot password */}
              <div className="flex items-center justify-between w-full text-[11.5px] font-sans text-white/60 light:text-zinc-500 px-3 select-none">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/20 bg-white/5 text-accent focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => toast.success('Password recovery code sent to node email.')}
                  className="hover:underline hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isInserting}
                className="w-full py-3.5 rounded-full font-sans font-bold text-[14px] bg-white dark:bg-white light:bg-zinc-900 text-zinc-950 dark:text-zinc-950 light:text-white hover:opacity-90 active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-md mt-2 flex items-center justify-center"
              >
                {mode === 'signin' ? 'Sign In' : 'Register'}
              </button>
            </form>

            {/* SSO Divider */}
            <div className="w-full flex items-center gap-3 my-4.5 relative z-10">
              <div className="h-[1px] flex-1 bg-white/10 dark:bg-white/10 light:bg-zinc-200" />
              <span className="text-[9px] font-mono text-white/30 light:text-zinc-400 uppercase tracking-widest select-none">OR</span>
              <div className="h-[1px] flex-1 bg-white/10 dark:bg-white/10 light:bg-zinc-200" />
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isInserting}
              className="w-full py-3.5 rounded-full border border-white/10 dark:border-white/10 light:border-zinc-200 bg-white/5 dark:bg-black/20 light:bg-zinc-100/50 text-white light:text-zinc-900 hover:bg-white/10 dark:hover:bg-black/30 light:hover:bg-zinc-200/50 active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 font-bold text-xs tracking-wide shadow-sm relative z-10"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Mode toggle link */}
            <div className="mt-6 text-center relative z-10 text-xs font-sans text-white/70 light:text-zinc-500">
              <span>{mode === 'signin' ? "Don't have an account? " : "Already have an account? "}</span>
              <button
                type="button"
                onClick={() => {
                  setMode(prev => prev === 'signin' ? 'signup' : 'signin');
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                disabled={isInserting}
                className="text-white dark:text-white light:text-zinc-900 font-bold hover:underline cursor-pointer ml-0.5"
              >
                {mode === 'signin' ? 'Register' : 'Login'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
