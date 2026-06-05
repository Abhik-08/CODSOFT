import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiDownload, FiUpload, FiActivity, FiUser, FiLogOut, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/deposit', label: 'Deposit', icon: FiDownload },
  { path: '/withdraw', label: 'Withdraw', icon: FiUpload },
  { path: '/history', label: 'History', icon: FiActivity },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] glass-panel border-r border-dark-border/20 p-5 flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-dark-border/15 light:border-light-border/40 mb-6">
              <div className="flex flex-col">
                <span className="font-mono font-black text-[16px] tracking-wider text-[var(--text-primary)] leading-none uppercase">KRONOS_CORE</span>
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase font-semibold mt-0.5">ATM_NODE_04</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent cursor-pointer"
                aria-label="Close Navigation Menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-xl font-mono text-[12px] uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                        isActive
                          ? 'text-[var(--accent)] bg-[var(--surface-hover)] border border-[var(--border-hover)]'
                          : 'text-[var(--text-muted)] border border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] shadow-[0_0_8px_2px_rgba(94,106,210,0.5)]" />
                        )}
                        <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                        <span className="relative z-10 font-bold">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-dark-border/15 light:border-light-border/40">
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-dark-surface/30 light:bg-light-card/35 border border-dark-border/10">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <FiUser className="w-4.5 h-4.5 text-accent" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[12px] font-bold text-dark-text light:text-light-text truncate">Abhik Mukherjee</span>
                  <span className="text-[9px] font-mono text-dark-text/50 light:text-light-text/50 truncate">ID: KRONOS_8910</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-mono text-[11px] uppercase tracking-widest text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white border border-rose-500/15 hover:border-transparent hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer transition-all duration-300 active:translate-y-[1px] active:shadow-pressed group"
              >
                <FiLogOut className="w-4.5 h-4.5" />
                <span className="font-bold">Logout Session</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
