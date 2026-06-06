import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { HeroScene } from '../components/motion/HeroScene';
import { MousePerspective } from '../components/motion/MousePerspective';
import { FloatingCard } from '../components/motion/FloatingCard';
import { ScrollExperience } from '../components/motion/ScrollExperience';



import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [isInserting, setIsInserting] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);


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
      const err = error as any;
      const code = err?.code || '';
      const message = err?.message || '';

      let friendlyMessage = 'Operator authentication failed.';
      if (
        code === 'auth/invalid-credential' ||
        message.includes('invalid-credential') ||
        code === 'auth/user-not-found' ||
        message.includes('user-not-found')
      ) {
        friendlyMessage = 'Invalid credentials. If you are a new user, please register first.';
      } else {
        friendlyMessage = message || friendlyMessage;
      }

      toast.error(friendlyMessage, { id: toastId });
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
          <ScrollExperience className="w-full flex justify-center md:justify-start">
            <HeroScene />
          </ScrollExperience>
        </div>

        {/* Right Side: Interactive Login Panel */}
        <div className="md:col-span-6 flex justify-center w-full">
          <MousePerspective maxRotation={8} maxTranslation={6} className="w-full max-w-[400px]">
            <FloatingCard maxTilt={10} className="w-full bg-white/90 dark:bg-zinc-950/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 rounded-[28px] p-8 flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 relative">
            {/* Ambient subtle glow inside the card */}
            <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl pointer-events-none" />

            <h2 className="text-[32px] font-bold font-sans text-zinc-900 dark:text-white mb-8 text-center select-none tracking-tight">
              {mode === 'signin' ? 'Login' : 'Register'}
            </h2>

            {/* Email/Password Access Form */}
            <form onSubmit={handleEmailSubmit} className="w-full space-y-4 relative z-10">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label htmlFor="auth-name" className="text-[11.5px] font-sans font-semibold text-zinc-600 dark:text-zinc-300 pl-1 block">
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
                      className="w-full py-3.5 pl-6 pr-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-primary/50 dark:focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                    />
                    <FiUser className="absolute right-4.5 text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="text-[11.5px] font-sans font-semibold text-zinc-600 dark:text-zinc-300 pl-1 block">
                  Email ID
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
                    placeholder="operator@nexus.bank"
                    className="w-full py-3.5 pl-6 pr-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-primary/50 dark:focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                  />
                  <FiUser className="absolute right-4.5 text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="text-[11.5px] font-sans font-semibold text-zinc-600 dark:text-zinc-300 pl-1 block">
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
                    placeholder="Password123"
                    className="w-full py-3.5 pl-6 pr-20 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-primary/50 dark:focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all duration-200"
                  />
                  <div className="absolute right-5 flex items-center gap-2.5 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Password visibility toggle clicked. State was:", showPassword);
                        setShowPassword(prev => !prev);
                      }}
                      className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors cursor-pointer flex items-center justify-center p-1 relative z-30 pointer-events-auto"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                    </button>
                    <FiLock className="text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action row with remember me and forgot password */}
              <div className="flex items-center justify-between w-full text-[11.5px] font-sans text-zinc-500 dark:text-zinc-450 px-3 select-none">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-accent focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => toast.success('Password recovery code sent to node email.')}
                  className="hover:underline hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isInserting}
                className="w-full py-3.5 rounded-full font-sans font-bold text-[14px] bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-950 dark:text-primary dark:border dark:border-primary dark:hover:bg-primary dark:hover:text-zinc-950 active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mt-2 flex items-center justify-center"
              >
                {mode === 'signin' ? 'Sign In' : 'Register'}
              </button>
            </form>

            {/* SSO Divider */}
            <div className="w-full flex items-center gap-3 my-4.5 relative z-10">
              <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest select-none">OR</span>
              <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isInserting}
              className="w-full py-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 font-bold text-xs tracking-wide shadow-sm relative z-10"
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Mode toggle link */}
            <div className="mt-6 text-center relative z-10 text-xs font-sans text-zinc-500 dark:text-zinc-400">
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
                className="text-zinc-900 dark:text-white font-bold hover:underline cursor-pointer ml-0.5"
              >
                {mode === 'signin' ? 'Register' : 'Login'}
              </button>
            </div>
          </FloatingCard>
        </MousePerspective>
      </div>
      </div>
    </div>
  );
};
