import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VirtualCard } from '../components/dashboard/VirtualCard';
import { StatCard } from '../components/dashboard/StatCard';
import { AnalyticsSection } from '../components/dashboard/AnalyticsSection';
import { FiTrendingUp, FiActivity, FiArrowRight, FiDownload, FiUpload, FiList } from 'react-icons/fi';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, type TransactionInfo } from '../services/firestoreService';



export const Dashboard: React.FC = () => {
  const isFrozen = localStorage.getItem('apex_card_frozen') === 'true';
  const { user, balance } = useAuth();
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const loadTxnData = async () => {
      try {
        const data = await getTransactions(user.uid);
        if (isMounted) {
          setTransactions(data);
        }
      } catch (err) {
        console.error('Error loading dashboard transactions:', err);
      } finally {
        if (isMounted) {
          setLoadingTxns(false);
        }
      }
    };
    loadTxnData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Get short display name or fallback
  const operatorName = user?.displayName 
    ? `Operator ${user.displayName.split(' ')[0]}` 
    : 'Operator Mukherjee';

  const totalDeposited = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawn = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOperations = transactions.length;

  const displayTransactions = transactions.slice(0, 5);

  const formatTimestamp = (ts: unknown) => {
    if (!ts) return 'Pending...';
    const timestampObj = ts as { toDate?: () => Date };
    if (typeof timestampObj.toDate === 'function') {
      return timestampObj.toDate().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(ts as string | number | Date).toLocaleDateString('en-IN');
  };

  const renderTransactionsTableBody = () => {
    if (loadingTxns) {
      return (
        <tr>
          <td colSpan={4} className="py-8 text-center text-[12px] opacity-65 text-emerald-500/60">
            Retrieving live terminal logs...
          </td>
        </tr>
      );
    }
    if (displayTransactions.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="py-8 text-center text-[12px] opacity-65 text-emerald-500/60">
            No terminal dossier logs on file.
          </td>
        </tr>
      );
    }
    return displayTransactions.map((tx) => (
      <tr key={tx.id} className="hover:bg-emerald-500/5 transition-colors duration-150">
        <td className="py-3.5 px-6 whitespace-nowrap text-[12px] opacity-80">
          {formatTimestamp(tx.createdAt)}
        </td>
        <td className="py-3.5 px-6 text-[12px] font-bold">
          {tx.description}
        </td>
        <td className="py-3.5 px-6 text-[10px] opacity-65">
          {tx.id.slice(0, 10).toUpperCase()}
        </td>
        <td className="py-3.5 px-6 text-right whitespace-nowrap">
          <span className={`text-[12.5px] font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {tx.type === 'credit' ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <h1 className="font-mono font-black text-[28px] md:text-[32px] text-dark-text light:text-light-text tracking-tight mb-1.5 uppercase">
            Welcome, {operatorName}
          </h1>
          <p className="text-dark-text/60 light:text-light-text/60 text-[13px] font-mono">
            Kronos Core automated ATM shell node active. Node state: <span className="text-emerald-500 font-bold">SECURE_SYNC</span>.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="flex items-center gap-3 bg-[var(--panel)] border border-[var(--border-dark)] shadow-recessed rounded-2xl px-4.5 py-2 w-fit"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_1px_#10b981] animate-pulse" />
          <span className="text-[11px] font-mono text-dark-text/75 light:text-light-text/75 uppercase tracking-wider">Session Active</span>
        </motion.div>
      </div>

      {/* 2. Top row: Virtual ATM Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Virtual ATM Card Display */}
        <motion.div 
          initial={{ opacity: 0, x: -25, scale: 0.98, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start"
        >
          <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase mb-3 block font-bold self-start pl-1">
            Active Debit Token Card
          </span>
          <VirtualCard
            name={(user?.displayName || "ABHIK MUKHERJEE").toUpperCase()}
            cardNumber="••••  ••••  ••••  8910"
            balance={78450.92}
            isFrozen={isFrozen}
          />
        </motion.div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-7 flex flex-col">
          <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase mb-3 block font-bold pl-1">
            ATM Console Quick Desk
          </span>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Action 1: Deposit */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="flex"
            >
              <Link
                to="/deposit"
                className="flex flex-col justify-between w-full glass-card border border-[var(--border-dark)] rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-[var(--shadow-floating)] active:translate-y-[1px] active:shadow-pressed transition-all duration-200 group relative overflow-hidden"
              >
                {/* Corner Screws */}
                <div className="absolute top-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute top-2 right-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 right-2 corner-screw opacity-35 z-20" />

                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-primary bg-primary/10 border border-dark-border/20 shadow-recessed transition-all duration-300 group-hover:scale-105 mt-1">
                  <FiDownload className="w-4 h-4" />
                </div>

                {/* Deposit Schematic Illustration Image */}
                <div className="w-full h-36 my-3.5 rounded-xl overflow-hidden border border-dark-border/10 bg-dark-surface/30 relative flex items-center justify-center">
                  <img 
                    src="/deposit.png" 
                    alt="Deposit mechatronic illustration" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mb-1 px-1">
                  <h4 className="font-mono font-bold text-[14.5px] text-dark-text light:text-light-text group-hover:text-primary transition-colors duration-200 uppercase tracking-wider leading-none">
                    Deposit / Credit
                  </h4>
                  <p className="text-[11.5px] text-dark-text/50 light:text-light-text/50 mt-1.5 leading-normal font-sans font-medium">
                    Insert cash envelopes / checks
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Action 2: Withdraw */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              className="flex"
            >
              <Link
                to="/withdraw"
                className="flex flex-col justify-between w-full glass-card border border-[var(--border-dark)] rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-[var(--shadow-floating)] active:translate-y-[1px] active:shadow-pressed transition-all duration-200 group relative overflow-hidden"
              >
                {/* Corner Screws */}
                <div className="absolute top-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute top-2 right-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 right-2 corner-screw opacity-35 z-20" />

                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-secondary bg-secondary/10 border border-dark-border/20 shadow-recessed transition-all duration-300 group-hover:scale-105 mt-1">
                  <FiUpload className="w-4 h-4" />
                </div>

                {/* Withdraw Schematic Illustration Image */}
                <div className="w-full h-36 my-3.5 rounded-xl overflow-hidden border border-dark-border/10 bg-dark-surface/30 relative flex items-center justify-center">
                  <img 
                    src="/withdraw.png" 
                    alt="Withdraw mechatronic illustration" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mb-1 px-1">
                  <h4 className="font-mono font-bold text-[14.5px] text-dark-text light:text-light-text group-hover:text-secondary transition-colors duration-200 uppercase tracking-wider leading-none">
                    Withdraw / Debit
                  </h4>
                  <p className="text-[11.5px] text-dark-text/50 light:text-light-text/50 mt-1.5 leading-normal font-sans font-medium">
                    Dispense vault paper bills
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Action 3: Ledger */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
              className="flex"
            >
              <Link
                to="/history"
                className="flex flex-col justify-between w-full glass-card border border-[var(--border-dark)] rounded-2xl p-5 hover:translate-y-[-2px] hover:shadow-[var(--shadow-floating)] active:translate-y-[1px] active:shadow-pressed transition-all duration-200 group relative overflow-hidden"
              >
                {/* Corner Screws */}
                <div className="absolute top-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute top-2 right-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 left-2 corner-screw opacity-35 z-20" />
                <div className="absolute bottom-2 right-2 corner-screw opacity-35 z-20" />

                <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-accent bg-accent/10 border border-dark-border/20 shadow-recessed transition-all duration-300 group-hover:scale-105 mt-1">
                  <FiList className="w-4 h-4" />
                </div>

                {/* Ledger Schematic Illustration Image */}
                <div className="w-full h-36 my-3.5 rounded-xl overflow-hidden border border-dark-border/10 bg-dark-surface/30 relative flex items-center justify-center">
                  <img 
                    src="/ledger.png" 
                    alt="Ledger mechatronic illustration" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="mb-1 px-1">
                  <h4 className="font-mono font-bold text-[14.5px] text-dark-text light:text-light-text group-hover:text-accent transition-colors duration-200 uppercase tracking-wider leading-none">
                    Account / Ledger
                  </h4>
                  <p className="text-[11.5px] text-dark-text/50 light:text-light-text/50 mt-1.5 leading-normal font-sans font-medium">
                    Full transaction search audit
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

      </div>

      {/* 3. Statistics Cards */}
      <div className="space-y-3">
        <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-1">
          Ledger Balance Statistics
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Net Balance"
            value={balance}
            icon={FiTrendingUp}
            gradientId="primary-grad"
            isCurrency={true}
            trendText="Live balance"
            trendType="neutral"
            delay={0.05}
          />
          <StatCard
            title="Total Liquidity Deposited"
            value={totalDeposited}
            icon={FiDownload}
            gradientId="secondary-grad"
            isCurrency={true}
            trendText="Sum credits"
            trendType="up"
            delay={0.1}
          />
          <StatCard
            title="Total Liquidity Withdrawn"
            value={totalWithdrawn}
            icon={FiUpload}
            gradientId="rose-grad"
            isCurrency={true}
            trendText="Sum debits"
            trendType="down"
            delay={0.15}
          />
          <StatCard
            title="Total System Operations"
            value={totalOperations}
            icon={FiActivity}
            gradientId="accent-grad"
            isCurrency={false}
            trendText={`${totalOperations} logs`}
            trendType="neutral"
            delay={0.2}
          />
        </div>
      </div>

      {/* 3.5 Analytics Section */}
      <AnalyticsSection />

      {/* 4. Recent Activity Log - styled as a CRT Green-Screen Terminal */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <span className="text-[9px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase font-bold">
            Recent Terminal Dossier Logs
          </span>
          <Link
            to="/history"
            className="flex items-center gap-1 text-[9px] font-mono font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors duration-200"
          >
            <span>Full Ledger Audit</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="crt-screen rounded-2xl border border-[var(--border-dark)] overflow-hidden shadow-recessed p-1"
        >
          {/* CRT Screen Frame overlay shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30 pointer-events-none z-10" />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-dark-border/30 bg-black/60 text-[9px] text-emerald-500/60 uppercase tracking-widest">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Activity details</th>
                  <th className="py-3.5 px-6">Reference token</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10 text-emerald-400 bg-black/45">
                {renderTransactionsTableBody()}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
