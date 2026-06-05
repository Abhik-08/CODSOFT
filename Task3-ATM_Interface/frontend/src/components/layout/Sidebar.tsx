import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiDownload, FiUpload, FiActivity, FiUser, FiLogOut } from 'react-icons/fi';
import { motion } from 'motion/react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/deposit', label: 'Deposit', icon: FiDownload },
  { path: '/withdraw', label: 'Withdraw', icon: FiUpload },
  { path: '/history', label: 'History', icon: FiActivity },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Navigate back to login
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-80px)] glass-panel border-r border-dark-border/10 light:border-light-border/40 p-4 sticky top-20 select-none">
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium tracking-wide text-[14px] transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-primary'
                    : 'text-dark-text/60 light:text-light-text/60 hover:text-dark-text light:hover:text-light-text hover:bg-dark-card/30 light:hover:bg-light-card/45'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 bg-primary/10 border-l-[3px] border-primary rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-primary' : 'text-dark-text/40 light:text-light-text/40 group-hover:text-dark-text light:group-hover:text-light-text'}`} />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-dark-border/15 light:border-light-border/40">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-[14px] font-medium tracking-wide text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/5 cursor-pointer transition-all duration-300 group"
        >
          <FiLogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};
