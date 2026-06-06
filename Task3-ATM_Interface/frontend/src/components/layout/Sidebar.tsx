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
