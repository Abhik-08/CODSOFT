import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { FiMenu } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  // Determine page title based on path with industrial mechatronic titles
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Control Interface';
      case '/deposit':
        return 'Credit Protocol';
      case '/withdraw':
        return 'Debit Protocol';
      case '/history':
        return 'Audit Ledger';
      case '/profile':
        return 'Identity Dossier';
      default:
        return 'Secure Session';
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 w-full glass-panel border-b border-dark-border/10 light:border-light-border/40 px-6 flex items-center justify-between select-none">
      {/* Left section: Symbolic Gauge Logo & Brand */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-dark-text/80 light:text-light-text/80 hover:bg-dark-card/30 light:hover:bg-light-card/45 border border-dark-border/10 light:border-light-border/40 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          {/* Linear-style geometric crosshair/telemetry ring logo */}
          <div className="w-9 h-9 rounded-xl bg-[var(--panel)] flex items-center justify-center border border-dark-border/15 shadow-sm relative group overflow-hidden">
            <svg 
              className="w-5 h-5 text-[var(--accent)] transition-transform duration-500 group-hover:rotate-45" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="8" className="opacity-30" />
              <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" className="opacity-50" />
              <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="3 3" className="opacity-50" />
              <polygon points="12,8 16,12 12,16 8,12" className="fill-[var(--accent)]/10" />
            </svg>
          </div>
          <div className="hidden sm:flex flex-col select-none">
            <span className="font-mono font-black text-[17px] tracking-wider text-[var(--text-primary)] leading-none uppercase">KRONOS_CORE</span>
            <span className="text-[10.5px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_4px_rgba(94,106,210,0.5)]" />
              <span>Terminal_Node_04</span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle section: Screen title context */}
      <div className="hidden md:flex items-center justify-center">
        <h2 className="font-mono font-bold text-[18px] tracking-widest text-dark-text/90 light:text-light-text/90 uppercase border-x border-dark-border/15 light:border-light-border/40 px-8">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Right section: Balance and Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* User Card Balance telemetry */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10.5px] font-mono text-dark-text/40 light:text-light-text/40 tracking-widest uppercase">Available Balance</span>
          <span className="font-mono font-black text-dark-text light:text-light-text text-[17px] tracking-wide">₹78,450.92</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
