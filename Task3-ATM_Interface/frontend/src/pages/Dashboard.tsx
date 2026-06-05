import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiArrowRight, FiLock, FiCalendar } from 'react-icons/fi';
import { motion } from 'motion/react';

const recentTransactions = [
  { id: '1', date: '2026-06-04', desc: 'Cash Withdrawal - Terminal #49', amount: -200, type: 'debit', status: 'completed' },
  { id: '2', date: '2026-06-03', desc: 'Interbank Cash Deposit', amount: 1500, type: 'credit', status: 'completed' },
  { id: '3', date: '2026-06-01', desc: 'Pre-Authorized Transfer', amount: 450, type: 'credit', status: 'completed' },
  { id: '4', date: '2026-05-28', desc: 'Atm Cash Withdrawal', amount: -100, type: 'debit', status: 'completed' },
  { id: '5', date: '2026-05-25', desc: 'Card Processing Fee', amount: -5.99, type: 'debit', status: 'completed' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 select-none">
      
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[30px] md:text-[36px] text-dark-text light:text-light-text tracking-tight mb-1">
            Welcome back, Abhik Mukherjee
          </h1>
          <p className="text-dark-text/60 light:text-light-text/60 text-[14px]">
            Your session is protected with 256-bit encryption. System online.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-dark-card/50 light:bg-light-surface/90 border border-dark-border/10 light:border-light-border/40 rounded-2xl px-4.5 py-2.5 w-fit">
          <FiCalendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-dark-text/75 light:text-light-text/75">SESSION_EXPIRE: 14m 55s</span>
        </div>
      </div>

      {/* Grid: Financial Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Balance */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card premium-card-shadow rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiTrendingUp className="w-4.5 h-4.5 text-primary" />
            </div>
          </div>
          <h3 className="font-display font-black text-[30px] md:text-[34px] text-dark-text light:text-light-text tracking-wide mb-1">$78,450.92</h3>
          <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">APEX_CHECKING_04</span>
        </motion.div>

        {/* Card 2: Limit available */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card premium-card-shadow rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Daily Withdraw Limit</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FiTrendingDown className="w-4.5 h-4.5 text-secondary" />
            </div>
          </div>
          <h3 className="font-display font-black text-[30px] md:text-[34px] text-dark-text light:text-light-text tracking-wide mb-1">$2,000.00</h3>
          <div className="w-full bg-dark-border/20 light:bg-light-border/80 h-1.5 rounded-full overflow-hidden mt-3 mb-1">
            <div className="bg-secondary h-full rounded-full w-[15%]" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-dark-text/40 light:text-light-text/40">
            <span>$300.00 spent</span>
            <span>$1,700.00 left</span>
          </div>
        </motion.div>

        {/* Card 3: Security Dossier */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card premium-card-shadow rounded-2xl p-6 sm:col-span-2 lg:col-span-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase">Shield Telemetry</span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <FiLock className="w-4.5 h-4.5 text-accent" />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-[18px] text-dark-text light:text-light-text mb-2 uppercase tracking-wide">SHIELD STATUS: OK</h3>
          <p className="text-[12px] text-dark-text/60 light:text-light-text/60 leading-relaxed mb-1">
            Your card chip security protocol is updated. FaceID authorization option is synced.
          </p>
        </motion.div>

      </div>

      {/* Main Row: Trend Graph & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Trend Graph - Visual Fintech UI */}
        <div className="lg:col-span-7 flex">
          <div className="w-full glass-card premium-card-shadow rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-display font-bold text-[18px] text-dark-text light:text-light-text uppercase tracking-wider">Account Analytics</h3>
                  <span className="text-xs text-dark-text/40 light:text-light-text/40">Real-time credit/debit statistics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Credit
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Debit
                  </div>
                </div>
              </div>

              {/* Graphic Plot using SVG (fintech dashboard style) */}
              <div className="h-48 w-full relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" className="light:stroke-black/5" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" className="light:stroke-black/5" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.2" className="light:stroke-black/5" />
                  
                  {/* SVG Gradient paths for charts */}
                  <defs>
                    <linearGradient id="chart-grad-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="chart-grad-2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Credit Line Path */}
                  <path d="M0,30 Q15,20 30,10 T60,25 T90,5 T100,8 L100,40 L0,40 Z" fill="url(#chart-grad-1)" />
                  <path d="M0,30 Q15,20 30,10 T60,25 T90,5 T100,8" fill="none" stroke="var(--color-primary)" strokeWidth="1.2" />

                  {/* Debit Line Path */}
                  <path d="M0,35 Q20,38 40,25 T70,30 T90,15 T100,10 L100,40 L0,40 Z" fill="url(#chart-grad-2)" />
                  <path d="M0,35 Q20,38 40,25 T70,30 T90,15 T100,10" fill="none" stroke="var(--color-secondary)" strokeWidth="1.2" />
                </svg>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-dark-border/10 light:border-light-border/40 pt-4 mt-6">
              <span className="text-xs text-dark-text/45 light:text-light-text/45">Data updated 3s ago</span>
              <button className="text-xs font-mono text-primary font-bold tracking-wider uppercase hover:underline cursor-pointer">Export Telemetry</button>
            </div>
          </div>
        </div>

        {/* Ledger Transaction Log Summary */}
        <div className="lg:col-span-5 flex">
          <div className="w-full glass-card premium-card-shadow rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-bold text-[18px] text-dark-text light:text-light-text uppercase tracking-wider">Recent Logs</h3>
                  <span className="text-xs text-dark-text/40 light:text-light-text/40">Latest session movements</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border/5 light:bg-light-card flex items-center justify-center">
                  <FiActivity className="w-4.5 h-4.5 text-accent" />
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center">
                    <div className="flex flex-col overflow-hidden pr-2">
                      <span className="text-[13px] font-bold text-dark-text light:text-light-text truncate">{tx.desc}</span>
                      <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 mt-0.5">{tx.date}</span>
                    </div>
                    <span className={`text-[14px] font-display font-black whitespace-nowrap ${tx.amount > 0 ? 'text-primary' : 'text-rose-500'}`}>
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/history"
              className="mt-6 pt-4 border-t border-dark-border/10 light:border-light-border/40 flex items-center justify-between text-xs font-mono font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors duration-200"
            >
              <span>Full Transaction Ledger</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
