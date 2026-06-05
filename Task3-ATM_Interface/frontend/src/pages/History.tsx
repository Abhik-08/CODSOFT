import React, { useState, useMemo, useEffect } from 'react';
import { FiActivity, FiSearch, FiCheckCircle, FiArrowUpRight, FiArrowDownLeft, FiSliders } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, type TransactionInfo } from '../services/firestoreService';

type FilterOption = 'all' | 'credit' | 'debit';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type DateInput = string | number | Date;

export const History: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [ledgerData, setLedgerData] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    const fetchLedger = async () => {
      try {
        const data = await getTransactions(user.uid);
        if (isMounted) {
          setLedgerData(data);
        }
      } catch (err) {
        console.error('Error fetching history ledger:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchLedger();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Helper function to format timestamps cleanly
  const formatTimestamp = (ts: unknown) => {
    if (!ts) return { date: 'Pending...', time: '' };
    const timestampObj = ts as { toDate?: () => Date };
    const d = typeof timestampObj.toDate === 'function' ? timestampObj.toDate() : new Date(ts as DateInput);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  // Filter & Sort Engine
  const processedData = useMemo(() => {
    const result = ledgerData.filter((item) => {
      const queryStr = search.toLowerCase();
      const matchesSearch =
        item.description.toLowerCase().includes(queryStr) ||
        item.id.toLowerCase().includes(queryStr);
      const matchesFilter = filter === 'all' || item.type === filter;
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      const timestampA = a.createdAt as { toDate?: () => Date } | null;
      const timestampB = b.createdAt as { toDate?: () => Date } | null;
      const tsA = timestampA && typeof timestampA.toDate === 'function' 
        ? timestampA.toDate().getTime() 
        : new Date(a.createdAt as DateInput).getTime();
      const tsB = timestampB && typeof timestampB.toDate === 'function' 
        ? timestampB.toDate().getTime() 
        : new Date(b.createdAt as DateInput).getTime();

      if (sortBy === 'date-desc') {
        return tsB - tsA;
      }
      if (sortBy === 'date-asc') {
        return tsA - tsB;
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [search, filter, sortBy, ledgerData]);

  // Helper render method for Desktop View
  const renderLedgerRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center text-dark-text/40 light:text-light-text/40 font-mono text-xs uppercase tracking-wider">
            Retrieving live audit ledger...
          </td>
        </tr>
      );
    }
    if (processedData.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-12 text-center text-dark-text/40 light:text-light-text/40 font-mono text-xs uppercase tracking-wider">
            No matching ledger items found
          </td>
        </tr>
      );
    }
    return processedData.map((item) => {
      const { date, time } = formatTimestamp(item.createdAt);
      return (
        <tr 
          key={item.id} 
          className="hover:bg-dark-card/10 light:hover:bg-light-card/25 transition-colors duration-150"
        >
          {/* Timestamp */}
          <td className="py-4.5 px-6 whitespace-nowrap">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-dark-text light:text-light-text">{date}</span>
              <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 mt-0.5">{time}</span>
            </div>
          </td>
          
          {/* Description */}
          <td className="py-4.5 px-6">
            <div className="flex items-center gap-2.5">
              {item.type === 'credit' ? (
                <FiArrowDownLeft className="w-4 h-4 text-primary bg-primary/10 rounded p-0.5 flex-shrink-0" />
              ) : (
                <FiArrowUpRight className="w-4 h-4 text-rose-500 bg-rose-500/10 rounded p-0.5 flex-shrink-0" />
              )}
              <span className="text-[13px] font-bold text-dark-text light:text-light-text">{item.description}</span>
            </div>
          </td>
          
          {/* Reference */}
          <td className="py-4.5 px-6 whitespace-nowrap">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-dark-text/60 light:text-light-text/60">{item.id}</span>
              <span className="text-[9px] font-mono text-dark-text/30 light:text-light-text/40">{item.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </td>

          {/* Status */}
          <td className="py-4.5 px-6 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              <FiCheckCircle className="w-3.5 h-3.5" /> Completed
            </span>
          </td>

          {/* Amount */}
          <td className="py-4.5 px-6 text-right whitespace-nowrap">
            <span className={`text-[14px] font-display font-black ${item.type === 'credit' ? 'text-primary' : 'text-rose-500'}`}>
              {item.type === 'credit' 
                ? `+₹${item.amount.toLocaleString('en-IN')}` 
                : `-₹${item.amount.toLocaleString('en-IN')}`
              }
            </span>
          </td>
        </tr>
      );
    });
  };

  // Helper render method for Mobile View
  const renderMobileCards = () => {
    if (loading) {
      return (
        <div className="py-12 text-center text-dark-text/40 light:text-light-text/40 font-mono text-xs uppercase tracking-wider">
          Retrieving live audit ledger...
        </div>
      );
    }
    if (processedData.length === 0) {
      return (
        <div className="py-12 text-center text-dark-text/40 light:text-light-text/40 font-mono text-xs uppercase tracking-wider">
          No matching ledger items found
        </div>
      );
    }
    return processedData.map((item) => {
      const { date, time } = formatTimestamp(item.createdAt);
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-card/30 dark:bg-black/10 light:bg-light-card/30 border border-dark-border/10 light:border-light-border/20 rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {item.type === 'credit' ? (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <FiArrowDownLeft className="w-4.5 h-4.5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <FiArrowUpRight className="w-4.5 h-4.5" />
                </div>
              )}
              <div>
                <h4 className="text-[13px] font-bold text-dark-text light:text-light-text line-clamp-1">
                  {item.description}
                </h4>
                <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45">
                  {date} • {time}
                </span>
              </div>
            </div>
            
            <span className={`text-[14px] font-display font-black whitespace-nowrap ${
              item.type === 'credit' ? 'text-primary' : 'text-rose-500'
            }`}>
              {item.type === 'credit' 
                ? `+₹${item.amount.toLocaleString('en-IN')}` 
                : `-₹${item.amount.toLocaleString('en-IN')}`
              }
            </span>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono border-t border-dark-border/5 light:border-light-border/20 pt-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-dark-text/30 light:text-light-text/40 uppercase">TXN ID</span>
              <span className="text-dark-text/60 light:text-light-text/60 text-[9.5px]">{item.id}</span>
            </div>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20 text-[9px] font-bold uppercase tracking-wider">
              COMPLETED
            </span>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-[32px] text-dark-text light:text-light-text tracking-tight mb-2">
            Transaction Ledger
          </h1>
          <p className="text-dark-text/60 light:text-light-text/60 text-[14px]">
            Comprehensive session logs and card transaction history.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-dark-text/45 light:text-light-text/45 bg-dark-card/30 light:bg-light-card/45 border border-dark-border/5 rounded-xl px-3.5 py-2 w-fit">
          <FiActivity className="w-4.5 h-4.5 text-accent" />
          <span>LEDGER_SYNC: SECURED (Node 04-SF)</span>
        </div>
      </div>

      {/* Control desk: Search, Filter & Sort */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Bar */}
        <div className="md:col-span-4 relative rounded-xl border border-dark-border/10 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-300">
          <FiSearch className="absolute left-4 w-5.5 h-5.5 text-dark-text/30 light:text-light-text/30" />
          <input
            type="text"
            placeholder="Search transactions, codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3.5 pl-12 pr-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text text-[13.5px] placeholder-dark-text/30 light:placeholder-light-text/35 font-mono"
          />
        </div>

        {/* Filter Selection Tabs */}
        <div className="md:col-span-5 flex rounded-xl border border-dark-border/10 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface p-1 items-center">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'credit', label: 'Deposits' },
            { id: 'debit', label: 'Withdrawals' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as FilterOption)}
              className={`flex-1 py-2 px-3 rounded-lg text-[10.5px] font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                filter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark-text/60 light:text-light-text/65 hover:text-dark-text light:hover:text-light-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="md:col-span-3 relative rounded-xl border border-dark-border/10 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-300 px-3">
          <FiSliders className="w-4.5 h-4.5 text-dark-text/35 mr-2" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full py-3.5 bg-transparent border-0 outline-none text-dark-text light:text-light-text text-[11.5px] font-bold uppercase tracking-wider cursor-pointer select-none"
          >
            <option value="date-desc" className="bg-dark-card light:bg-light-surface text-dark-text light:text-light-text">Newest First</option>
            <option value="date-asc" className="bg-dark-card light:bg-light-surface text-dark-text light:text-light-text">Oldest First</option>
            <option value="amount-desc" className="bg-dark-card light:bg-light-surface text-dark-text light:text-light-text">Highest Amount</option>
            <option value="amount-asc" className="bg-dark-card light:bg-light-surface text-dark-text light:text-light-text">Lowest Amount</option>
          </select>
        </div>

      </div>

      {/* Main ledger container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-card-shadow rounded-2xl border border-dark-border/15 light:border-light-border/40 overflow-hidden"
      >
        {/* DESKTOP TABLE VIEW (md and up) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border/15 light:border-light-border/40 bg-dark-card/35 light:bg-light-card/35 text-[10.5px] font-mono text-dark-text/45 light:text-light-text/45 uppercase tracking-widest">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Reference ID</th>
                <th className="py-4 px-6">Clearance</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/10 light:divide-light-border/40">
              <AnimatePresence>
                {renderLedgerRows()}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW (shrunk on mobile sizes) */}
        <div className="p-4 grid grid-cols-1 gap-3.5 md:hidden">
          {renderMobileCards()}
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border/15 light:border-light-border/40 bg-dark-card/10 light:bg-light-card/15">
          <span className="text-xs text-dark-text/40 light:text-light-text/40 font-mono">
            Showing {processedData.length} of {ledgerData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              disabled 
              className="px-3.5 py-1.5 rounded-lg border border-dark-border/10 light:border-light-border/40 text-[11px] font-bold tracking-wider uppercase text-dark-text/40 light:text-light-text/40 disabled:opacity-50 cursor-not-allowed"
            >
              Prev
            </button>
            <button 
              type="button" 
              disabled 
              className="px-3.5 py-1.5 rounded-lg border border-dark-border/10 light:border-light-border/40 text-[11px] font-bold tracking-wider uppercase text-dark-text/40 light:text-light-text/40 disabled:opacity-50 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

      </motion.div>

    </div>
  );
};
