import React, { useState, useMemo } from 'react';
import { FiActivity, FiSearch, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'motion/react';

const ledgerData = [
  { id: '1', date: '2026-06-04', time: '14:23:10', desc: 'Cash Withdrawal - Terminal #49', reference: 'REF_9918231', amount: -200, type: 'debit', status: 'completed' },
  { id: '2', date: '2026-06-03', time: '09:41:55', desc: 'Interbank Cash Deposit', reference: 'REF_0192837', amount: 1500, type: 'credit', status: 'completed' },
  { id: '3', date: '2026-06-01', time: '18:15:30', desc: 'Pre-Authorized Transfer', reference: 'REF_7718290', amount: 450, type: 'credit', status: 'completed' },
  { id: '4', date: '2026-05-28', time: '11:02:41', desc: 'Atm Cash Withdrawal', reference: 'REF_4812390', amount: -100, type: 'debit', status: 'completed' },
  { id: '5', date: '2026-05-25', time: '03:10:04', desc: 'Card Processing Fee', reference: 'REF_9018274', amount: -5.99, type: 'debit', status: 'completed' },
  { id: '6', date: '2026-05-22', time: '15:20:12', desc: 'Secure Mobile Deposit', reference: 'REF_3129847', amount: 3200, type: 'credit', status: 'completed' },
  { id: '7', date: '2026-05-18', time: '10:04:10', desc: 'Cash Withdrawal - Terminal #12', reference: 'REF_0091823', amount: -400, type: 'debit', status: 'completed' },
  { id: '8', date: '2026-05-15', time: '13:55:00', desc: 'Online Refund - Apex Tech', reference: 'REF_8812736', amount: 49.99, type: 'credit', status: 'completed' },
];

export const History: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const filteredData = useMemo(() => {
    return ledgerData.filter((item) => {
      const matchesSearch = item.desc.toLowerCase().includes(search.toLowerCase()) || 
                            item.reference.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || item.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

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
        <div className="flex items-center gap-2 text-xs font-mono text-dark-text/45 light:text-light-text/45 bg-dark-card/30 light:bg-light-card/45 border border-dark-border/5 rounded-xl px-3.5 py-2">
          <FiActivity className="w-4 h-4 text-accent" />
          <span>LEDGER_SYNC: OK (100% compliant)</span>
        </div>
      </div>

      {/* Search & Filter tools */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Input */}
        <div className="md:col-span-7 relative rounded-xl border border-dark-border/10 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface flex items-center overflow-hidden focus-within:border-primary/50 transition-all duration-300">
          <FiSearch className="absolute left-4 w-5 h-5 text-dark-text/30 light:text-light-text/30" />
          <input
            type="text"
            placeholder="Search by description, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3.5 pl-12 pr-4 bg-transparent border-0 outline-none text-dark-text light:text-light-text text-[14px] placeholder-dark-text/30 light:placeholder-light-text/35"
          />
        </div>

        {/* Filter Tabs */}
        <div className="md:col-span-5 flex rounded-xl border border-dark-border/10 light:border-light-border/60 bg-dark-surface/50 light:bg-light-surface p-1 items-center">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'credit', label: 'Credits' },
            { id: 'debit', label: 'Debits' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'credit' | 'debit')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                filter === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-dark-text/60 light:text-light-text/60 hover:text-dark-text light:hover:text-light-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Main Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-card-shadow rounded-2xl border border-dark-border/15 light:border-light-border/40 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark-border/15 light:border-light-border/40 bg-dark-card/35 light:bg-light-card/35 text-[10px] font-mono text-dark-text/45 light:text-light-text/45 uppercase tracking-widest">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Reference ID</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/10 light:divide-light-border/40">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-card/10 light:hover:bg-light-card/25 transition-colors duration-150">
                    {/* Timestamp */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-dark-text light:text-light-text">{item.date}</span>
                        <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 mt-0.5">{item.time}</span>
                      </div>
                    </td>
                    
                    {/* Description */}
                    <td className="py-4.5 px-6">
                      <span className="text-[13px] font-bold text-dark-text light:text-light-text">{item.desc}</span>
                    </td>
                    
                    {/* Reference */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <span className="text-[11px] font-mono text-dark-text/50 light:text-light-text/55">{item.reference}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4.5 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4.5 px-6 text-right whitespace-nowrap">
                      <span className={`text-[14px] font-display font-black ${item.amount > 0 ? 'text-primary' : 'text-rose-500'}`}>
                        {item.amount > 0 ? `+$${item.amount.toFixed(2)}` : `-$${Math.abs(item.amount).toFixed(2)}`}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-dark-text/40 light:text-light-text/40 font-mono text-xs uppercase tracking-wider">
                    No matching ledger items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-border/15 light:border-light-border/40 bg-dark-card/10 light:bg-light-card/15">
          <span className="text-xs text-dark-text/40 light:text-light-text/40 font-mono">
            Showing {filteredData.length} of {ledgerData.length} records
          </span>
          <div className="flex items-center gap-2">
            <button disabled className="px-3.5 py-1.5 rounded-lg border border-dark-border/10 light:border-light-border/40 text-[11px] font-bold tracking-wider uppercase text-dark-text/40 light:text-light-text/40 disabled:opacity-50">
              Prev
            </button>
            <button disabled className="px-3.5 py-1.5 rounded-lg border border-dark-border/10 light:border-light-border/40 text-[11px] font-bold tracking-wider uppercase text-dark-text/40 light:text-light-text/40 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>

      </motion.div>

    </div>
  );
};
