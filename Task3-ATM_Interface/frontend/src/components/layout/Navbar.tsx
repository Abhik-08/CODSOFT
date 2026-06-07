import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { FiMenu } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { balance } = useAuth();

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
    <header className="sticky top-0 z-50 h-24 w-full glass-panel border-b border-dark-border/10 light:border-light-border/40 px-6 flex items-center justify-between select-none">
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

        <div className="flex items-center select-none py-1 gap-5">
          <img 
            src="/nexus_symbol.png" 
            alt="Nexus Logo" 
            className="h-[75.6px] w-[75.6px] object-contain"
          />
          <span className="font-mono tracking-wider font-extrabold text-[38px] flex items-center leading-none">
            <span className="text-dark-text light:text-light-text font-black">NEXUS</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 ml-2 font-black">VAULT</span>
          </span>
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
          <span className="font-mono font-black text-dark-text light:text-light-text text-[17px] tracking-wide">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
