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
                <span className="font-display font-extrabold text-[16px] tracking-wide text-dark-text light:text-light-text leading-tight">APEX_BANK</span>
                <span className="text-[10px] font-mono text-primary/80 uppercase font-semibold">ATM_NODE_04</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-dark-text/70 light:text-light-text/70 hover:bg-dark-card/30 light:hover:bg-light-card/45 cursor-pointer"
                aria-label="Close Navigation Menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium tracking-wide text-[15px] transition-all duration-300 relative group overflow-hidden ${
                        isActive
                          ? 'text-primary'
                          : 'text-dark-text/60 light:text-light-text/60 hover:text-dark-text light:hover:text-light-text hover:bg-dark-card/30 light:hover:bg-light-card/45'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/10 border-l-[3px] border-primary rounded-xl" />
                        )}
                        <Icon className={`w-5.5 h-5.5 relative z-10 ${isActive ? 'text-primary' : 'text-dark-text/40 light:text-light-text/40'}`} />
                        <span className="relative z-10">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-4 border-t border-dark-border/15 light:border-light-border/40">
              <div className="flex items-center gap-3 px-4 py-3.5 mb-4 rounded-xl bg-dark-card/30 light:bg-light-card/35 border border-dark-border/5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <FiUser className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[12px] font-bold text-dark-text light:text-light-text truncate">Abhik Mukherjee</span>
                  <span className="text-[10px] font-mono text-dark-text/50 light:text-light-text/50 truncate">User ID: APEX_8910</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl text-[14px] font-medium tracking-wide text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/5 cursor-pointer transition-all duration-300 group"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout Session</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
