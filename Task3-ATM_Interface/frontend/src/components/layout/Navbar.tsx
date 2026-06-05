import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { FiMenu, FiRadio } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'System Terminal';
      case '/deposit':
        return 'Credit Desk';
      case '/withdraw':
        return 'Debit Desk';
      case '/history':
        return 'Transaction Ledger';
      case '/profile':
        return 'Account Dossier';
      default:
        return 'Secure Session';
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 w-full glass-panel border-b border-dark-border/10 light:border-light-border/40 px-6 flex items-center justify-between select-none">
      {/* Left section: Logo or Page title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-dark-text/80 light:text-light-text/80 hover:bg-dark-card/30 light:hover:bg-light-card/45 border border-dark-border/10 light:border-light-border/40 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {/* Logo emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent p-[1px] flex items-center justify-center shadow-lg shadow-primary/10">
            <div className="w-full h-full rounded-xl bg-dark-surface light:bg-light-surface flex items-center justify-center">
              <span className="font-display font-extrabold text-[18px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">A</span>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-extrabold text-[16px] tracking-wide text-dark-text light:text-light-text leading-tight">APEX_BANK</span>
            <span className="text-[10px] font-mono tracking-widest text-primary/80 uppercase font-semibold flex items-center gap-1">
              <FiRadio className="w-2.5 h-2.5 animate-pulse" /> ATM_NODE_04
            </span>
          </div>
        </div>
      </div>

      {/* Middle section: Screen title context */}
      <div className="hidden md:flex items-center justify-center">
        <h2 className="font-display font-bold text-[18px] tracking-widest text-dark-text/90 light:text-light-text/90 uppercase border-x border-dark-border/15 light:border-light-border/40 px-8">
          {getPageTitle(location.pathname)}
        </h2>
      </div>

      {/* Right section: Balance and Theme Toggle */}
      <div className="flex items-center gap-4">
        {/* User Card Balance telemetry */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[10px] font-mono text-dark-text/40 light:text-light-text/40 tracking-widest uppercase">Available Balance</span>
          <span className="font-display font-black text-dark-text light:text-light-text text-[16px] tracking-wide">$78,450.92</span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
};
