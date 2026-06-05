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
        className="mx-2 my-4 p-4.5 rounded-2xl bg-black/40 light:bg-[var(--accent)]/5 border border-dark-border/20 light:border-primary/10 shadow-recessed flex flex-col gap-3.5 relative overflow-hidden group hover:border-[var(--accent)]/30 transition-all duration-300"
      >
        {/* Scanning laser line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan z-10 pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors duration-300 uppercase tracking-widest font-black">
            VAULT STATUS
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider">ONLINE</span>
          </span>
        </div>

        {/* High-tech SVG visualization */}
        <div className="w-full h-16 flex items-center justify-center relative overflow-hidden bg-black/60 light:bg-[var(--accent)]/10 rounded-xl border border-dark-border/10 light:border-primary/10 p-2">
          {/* Animated background graph line */}
          <svg className="w-full h-full text-[var(--accent)] opacity-40 group-hover:opacity-75 transition-opacity duration-300" viewBox="0 0 100 40">
            <path 
              d="M0,20 Q15,5 30,25 T60,15 T90,30 L100,20" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round"
              className="stroke-dasharray-100 stroke-dashoffset-100 animate-[dash_3s_ease-in-out_infinite]"
            />
            {/* Concentric telemetry rings */}
            <circle cx="50" cy="20" r="12" className="stroke-secondary/30 stroke-dasharray-[2,2] fill-none animate-spin-slow" />
            <circle cx="50" cy="20" r="6" className="stroke-primary/40 fill-none animate-spin-reverse-slow" />
            <circle cx="50" cy="20" r="2" className="fill-primary/60 animate-pulse" />
          </svg>
          {/* Tiny grid cells */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
        </div>

        {/* Status readouts */}
        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
          <div className="flex flex-col bg-white/[0.02] light:bg-[var(--accent)]/5 p-1.5 rounded-lg border border-white/[0.03] light:border-primary/5">
            <span className="opacity-45 uppercase">TEMP</span>
            <span className="font-bold text-dark-text light:text-light-text mt-0.5">34.2 °C</span>
          </div>
          <div className="flex flex-col bg-white/[0.02] light:bg-[var(--accent)]/5 p-1.5 rounded-lg border border-white/[0.03] light:border-primary/5">
            <span className="opacity-45 uppercase">SYNC_RATE</span>
            <span className="font-bold text-primary mt-0.5">99.98%</span>
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
