import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiDownload, FiUpload, FiActivity, FiUser, FiLogOut } from 'react-icons/fi';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/deposit', label: 'Deposit', icon: FiDownload },
  { path: '/withdraw', label: 'Withdraw', icon: FiUpload },
  { path: '/history', label: 'History', icon: FiActivity },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const toastId = toast.loading('Terminating secure session...');
    try {
      await logout();
      toast.success('Logged out successfully. Secure session ended.', { id: toastId });
      navigate('/login');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed.';
      toast.error(errorMsg, { id: toastId });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-80px)] bg-transparent p-4 sticky top-20 select-none">
      {/* Navigation Links */}
      <nav className="flex-1 space-y-3 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-mono text-[11px] uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--surface-hover)] border border-[var(--border-hover)]'
                    : 'text-[var(--text-muted)] border border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--accent)] shadow-[0_0_8px_2px_rgba(94,106,210,0.5)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4.5 h-4.5 relative z-10 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
                  <span className="relative z-10 font-bold">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Decorative Cyber Diagnostics Widget (Replaces /atm_hero.png) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-2 my-4 p-4 rounded-2xl bg-black/40 light:bg-[var(--accent)]/5 border border-dark-border/20 light:border-primary/10 shadow-recessed flex flex-col gap-3 relative overflow-hidden group hover:border-[var(--accent)]/30 transition-all duration-300"
      >
        {/* Scanning laser line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan z-10 pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors duration-300 uppercase tracking-widest font-black">
            VAULT TELEMETRY
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">SECURE</span>
          </span>
        </div>

        {/* High-tech SVG visualization */}
        <div className="w-full h-24 flex items-center justify-center relative overflow-hidden bg-black/60 light:bg-[var(--accent)]/10 rounded-xl border border-dark-border/10 light:border-primary/10 p-2">
          {/* Radar Sweep Line */}
          <div className="absolute inset-0 rounded-xl opacity-40 group-hover:opacity-60 pointer-events-none bg-[conic-gradient(from_0deg,rgba(16,182,212,0.15)_0deg,rgba(16,182,212,0)_180deg)] animate-[spin_4s_linear_infinite] transition-opacity duration-300" />
          
          <svg className="w-full h-full text-[var(--accent)]" viewBox="0 0 100 50">
            {/* Concentric telemetry rings */}
            <circle cx="50" cy="25" r="22" className="stroke-primary/20 stroke-dasharray-[2,2] fill-none" />
            <circle cx="50" cy="25" r="16" className="stroke-secondary/25 stroke-dasharray-[4,2] fill-none animate-[spin_12s_linear_infinite]" style={{ transformOrigin: '50px 25px' }} />
            <circle cx="50" cy="25" r="10" className="stroke-[var(--accent)]/30 fill-none animate-[spin_6s_linear_reverse_infinite]" style={{ transformOrigin: '50px 25px' }} />
            <circle cx="50" cy="25" r="4" className="stroke-emerald-500/40 fill-none" />
            
            {/* Radar crosshairs */}
            <line x1="15" y1="25" x2="85" y2="25" className="stroke-white/5" strokeWidth="0.5" />
            <line x1="50" y1="2" x2="50" y2="48" className="stroke-white/5" strokeWidth="0.5" />
            
            {/* Waveform overlapping the radar */}
            <path 
              d="M10,25 Q30,10 50,25 T90,25" 
              fill="none" 
              stroke="url(#radarWaveGrad)" 
              strokeWidth="1.25" 
              className="opacity-70"
            />
            
            {/* Pulsing Lock / Node Status Indicator */}
            <circle cx="50" cy="25" r="2" className="fill-emerald-400 animate-ping" />
            <circle cx="50" cy="25" r="1.5" className="fill-emerald-400" />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="radarWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Tiny grid cells */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,182,212,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,182,212,0.02)_1px,transparent_1px)] bg-[size:6px_6px] pointer-events-none" />
        </div>

        {/* Status readouts */}
        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
          <div className="flex flex-col bg-white/[0.02] light:bg-[var(--accent)]/5 p-1.5 rounded-lg border border-white/[0.03] light:border-primary/5">
            <span className="opacity-45 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_4px_rgba(34,211,238,0.5)]" /> CORE_HEAT
            </span>
            <span className="font-bold text-dark-text light:text-light-text mt-0.5">38.6 °C</span>
          </div>
          <div className="flex flex-col bg-white/[0.02] light:bg-[var(--accent)]/5 p-1.5 rounded-lg border border-white/[0.03] light:border-primary/5">
            <span className="opacity-45 uppercase">CRYPT_CIPHER</span>
            <span className="font-bold text-primary mt-0.5">AES_256_GCM</span>
          </div>
        </div>
      </motion.div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-dark-border/10 light:border-light-border/40">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl font-mono text-[11px] uppercase tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white border border-rose-500/15 hover:border-transparent hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer transition-all duration-300 active:translate-y-[1px] active:shadow-pressed group"
        >
          <FiLogOut className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span className="font-bold">Logout Session</span>
        </button>
      </div>
    </aside>
  );
};
