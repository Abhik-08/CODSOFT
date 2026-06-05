import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import type { TransactionInfo } from '../../services/firestoreService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface AnalyticsSectionProps {
  transactions: TransactionInfo[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ transactions }) => {
  const { theme } = useTheme();
  const { balance } = useAuth();

  const currentBalance = balance ?? 0;

  const dynamicData = React.useMemo(() => {
    // Generate the last 6 months names ending with current month
    const months: { name: string; year: number; monthIndex: number; deposits: number; withdrawals: number; balance: number }[] = [];
    const date = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('en-IN', { month: 'short' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        deposits: 0,
        withdrawals: 0,
        balance: 0,
      });
    }

    // Helper to extract Date safely from Firestore timestamp or standard inputs
    const getTxnDate = (createdAt: unknown): Date => {
      if (!createdAt) return new Date();
      const tsObj = createdAt as { toDate?: () => Date };
      if (typeof tsObj.toDate === 'function') {
        return tsObj.toDate();
      }
      return new Date(createdAt as string | number | Date);
    };

    // Group transaction aggregates by calendar month
    transactions.forEach((txn) => {
      const txnDate = getTxnDate(txn.createdAt);
      const txnYear = txnDate.getFullYear();
      const txnMonth = txnDate.getMonth();

      const match = months.find((m) => m.year === txnYear && m.monthIndex === txnMonth);
      if (match) {
        if (txn.type === 'credit') {
          match.deposits += txn.amount;
        } else if (txn.type === 'debit') {
          match.withdrawals += txn.amount;
        }
      }
    });

    // Work backwards to calculate cumulative balance at the end of each month
    let runningBalance = currentBalance;
    for (let i = months.length - 1; i >= 0; i--) {
      months[i].balance = runningBalance;
      runningBalance = runningBalance - (months[i].deposits - months[i].withdrawals);
    }

    return months.map((m) => ({
      month: m.name,
      deposits: m.deposits,
      withdrawals: m.withdrawals,
      balance: m.balance,
    }));
  }, [transactions, currentBalance]);
  const isDark = theme === 'dark';

  // Dynamic Theme Colors for Recharts styling
  const labelColor = isDark ? 'rgba(244, 244, 246, 0.45)' : 'rgba(30, 41, 59, 0.55)';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const tooltipBg = isDark ? '#0f0f12' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const tooltipText = isDark ? '#f4f4f6' : '#1e293b';

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined) return '₹0';
    const num = Number(value);
    if (Number.isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-mono text-dark-text/45 light:text-light-text/45 tracking-widest uppercase block font-bold pl-1">
        Telemetry Ledger Analytics
      </span>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* ==================== CHART 1: DEPOSITS VS WITHDRAWALS ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
          whileHover={{
            y: -4,
            scale: 1.01,
            boxShadow: 'var(--shadow-floating)',
            borderColor: 'var(--border-dark)',
          }}
          className="glass-card premium-card-shadow rounded-2xl p-5 border border-[var(--border-dark)] flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
        >
          {/* Structural Corner Screws */}
          <div className="absolute top-2.5 left-2.5 corner-screw opacity-30 z-20" />
          <div className="absolute top-2.5 right-2.5 corner-screw opacity-30 z-20" />
          <div className="absolute bottom-2.5 left-2.5 corner-screw opacity-30 z-20" />
          <div className="absolute bottom-2.5 right-2.5 corner-screw opacity-30 z-20" />

          {/* Mechatronic Ventilation Slots */}
          <div className="absolute top-3.5 right-13 flex gap-0.5 z-10 opacity-40">
            <div className="h-3.5 w-0.75 rounded-full bg-[var(--recessed)] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)]" />
            <div className="h-3.5 w-0.75 rounded-full bg-[var(--recessed)] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)]" />
            <div className="h-3.5 w-0.75 rounded-full bg-[var(--recessed)] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)]" />
          </div>

          <div className="mb-4 mt-1 px-1">
            <h4 className="font-mono font-bold text-[14px] text-dark-text light:text-light-text uppercase tracking-wider">
              Transaction Flows
            </h4>
            <p className="text-[10px] text-dark-text/45 light:text-light-text/50 font-mono mt-0.5">
              Deposits vs Withdrawals over the last 6 months
            </p>
          </div>

          <div className="w-full mt-2 font-mono text-[10px]">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dynamicData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  {/* Green Deposit Gradient */}
                  <linearGradient id="colorDeposits" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  {/* Rose Withdraw Gradient */}
                  <linearGradient id="colorWithdrawals" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={labelColor} 
                  dy={8}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={labelColor} 
                  tickFormatter={formatYAxis}
                />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '12px',
                    color: tooltipText,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value) => [
                    formatCurrency(Array.isArray(value) ? value[0] : value),
                    '',
                  ]}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={6}
                  wrapperStyle={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                />

                <Area
                  type="monotone"
                  name="Deposits"
                  dataKey="deposits"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDeposits)"
                  isAnimationActive={true}
                />
                <Area
                  type="monotone"
                  name="Withdrawals"
                  dataKey="withdrawals"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWithdrawals)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ==================== CHART 2: BALANCE TREND ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.2 }}
          whileHover={{
            y: -4,
            scale: 1.01,
            boxShadow: 'var(--shadow-floating)',
            borderColor: 'var(--border-dark)',
          }}
          className="glass-card premium-card-shadow rounded-2xl p-5 border border-[var(--border-dark)] flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
        >
          {/* Structural Corner Screws */}
          <div className="absolute top-2.5 left-2.5 corner-screw opacity-30 z-20" />
          <div className="absolute top-2.5 right-2.5 corner-screw opacity-30 z-20" />
          <div className="absolute bottom-2.5 left-2.5 corner-screw opacity-30 z-20" />
          <div className="absolute bottom-2.5 right-2.5 corner-screw opacity-30 z-20" />

          {/* Mechatronic Ventilation Slots */}
          <div className="absolute top-3.5 right-13 flex gap-0.5 z-10 opacity-40">
            <div className="h-3.5 w-0.75 rounded-full bg-[var(--recessed)] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)]" />
            <div className="h-3.5 w-0.75 rounded-full bg-[var(--recessed)] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)]" />
            <div className="h-3.5 w-0.75 rounded-full bg-[var(--recessed)] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.15)]" />
          </div>

          <div className="mb-4 mt-1 px-1">
            <h4 className="font-mono font-bold text-[14px] text-dark-text light:text-light-text uppercase tracking-wider">
              Balance Trend
            </h4>
            <p className="text-[10px] text-dark-text/45 light:text-light-text/50 font-mono mt-0.5">
              Checking account balance trend
            </p>
          </div>

          <div className="w-full mt-2 font-mono text-[10px]">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dynamicData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  {/* Blue/Purple Royal Gradient */}
                  <linearGradient id="colorBalance" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={labelColor} 
                  dy={8}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={labelColor} 
                  tickFormatter={formatYAxis}
                />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '12px',
                    color: tooltipText,
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value) => [
                    formatCurrency(Array.isArray(value) ? value[0] : value),
                    'Current Balance',
                  ]}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}
                />

                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                  isAnimationActive={true}
                  dot={{ r: 3, stroke: '#8b5cf6', strokeWidth: 1.5, fill: tooltipBg }}
                  activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
