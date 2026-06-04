import React from 'react';
import { motion } from 'motion/react';
import type { HistoricalRate } from '../types';

interface RateChartProps {
  historicalRates: HistoricalRate[];
  fromCurrency: string;
  toCurrency: string;
  days: number;
  onChangeDays: (days: number) => void;
  loading: boolean;
}

export const RateChart: React.FC<RateChartProps> = ({
  historicalRates,
  fromCurrency,
  toCurrency,
  days,
  onChangeDays,
  loading,
}) => {
  // SVG drawing logic
  const width = 500;
  const height = 200;
  const padding = 30;

  const validRates = historicalRates.filter((r) => !Number.isNaN(r.rate) && r.rate > 0);
  const minRate = validRates.length > 0 ? Math.min(...validRates.map((r) => r.rate)) : 0;
  const maxRate = validRates.length > 0 ? Math.max(...validRates.map((r) => r.rate)) : 1;
  const rateRange = maxRate - minRate || 1;

  // Calculate points
  const points = validRates.map((r, index) => {
    const x = padding + (index / (validRates.length - 1 || 1)) * (width - padding * 2);
    // Invert y because SVG y goes down
    const y =
      height - padding - ((r.rate - minRate) / rateRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Calculate area points for the gradient fill below the line
  const bottomY = height - padding;
  const startX = padding;
  const endX = width - padding;
  const areaPoints = validRates.length > 0 
    ? `${startX},${bottomY} ${points} ${endX},${bottomY}`
    : '';

  // Extract nested ternary to satisfy linter rules
  let chartView;
  if (loading) {
    chartView = (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Loading trend data...</p>
      </div>
    );
  } else if (validRates.length < 2) {
    chartView = (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Insufficient historical data available</p>
      </div>
    );
  } else {
    chartView = (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="chart-fill-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            {/* Line Stroke Gradient */}
            <linearGradient id="chart-stroke-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4,4"
          />
          <line
            x1={padding}
            y1={padding + (height - padding * 2) / 2}
            x2={width - padding}
            y2={padding + (height - padding * 2) / 2}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="4,4"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(255, 255, 255, 0.08)"
          />

          {/* Y Axis Bounds */}
          <text
            x={padding - 8}
            y={padding + 4}
            textAnchor="end"
            className="text-[9px] fill-slate-500 font-bold"
          >
            {maxRate.toFixed(4)}
          </text>
          <text
            x={padding - 8}
            y={height - padding + 4}
            textAnchor="end"
            className="text-[9px] fill-slate-500 font-bold"
          >
            {minRate.toFixed(4)}
          </text>

          {/* Area under the line */}
          <polygon
            fill="url(#chart-fill-gradient)"
            points={areaPoints}
          />

          {/* Chart Line */}
          <polyline
            fill="none"
            stroke="url(#chart-stroke-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* X Axis Labels */}
          <text
            x={padding}
            y={height - padding + 16}
            textAnchor="start"
            className="text-[9px] fill-slate-500 font-bold"
          >
            {validRates[0]?.date}
          </text>
          <text
            x={width - padding}
            y={height - padding + 16}
            textAnchor="end"
            className="text-[9px] fill-slate-500 font-bold"
          >
            {validRates.at(-1)?.date}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">Historical Rates</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {fromCurrency} to {toCurrency} conversion trend
          </p>
        </div>

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl text-xs font-semibold border border-white/5 relative z-0">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => onChangeDays(d)}
              className={`relative px-3 py-1.5 rounded-lg transition-all duration-300 font-semibold cursor-pointer overflow-hidden z-10 ${
                days === d
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {days === d && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    background: 'linear-gradient(137deg, #3b82f6 0%, #22d3ee 100%)',
                    boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {d}D
            </button>
          ))}
        </div>
      </div>

      <div className="relative border border-white/5 rounded-2xl bg-white/[0.02] p-4 flex items-center justify-center min-h-[220px] flex-1">
        {chartView}
      </div>
    </div>
  );
};
