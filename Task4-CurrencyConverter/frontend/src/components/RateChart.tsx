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
  const width = 500;
  const height = 200;
  const padding = 30;

  const validRates = historicalRates.filter((r) => !Number.isNaN(r.rate) && r.rate > 0);
  const minRate = validRates.length > 0 ? Math.min(...validRates.map((r) => r.rate)) : 0;
  const maxRate = validRates.length > 0 ? Math.max(...validRates.map((r) => r.rate)) : 1;
  const rateRange = maxRate - minRate || 1;

  const points = validRates.map((r, index) => {
    const x = padding + (index / (validRates.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((r.rate - minRate) / rateRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const bottomY = height - padding;
  const startX = padding;
  const endX = width - padding;
  const areaPoints = validRates.length > 0 
    ? `${startX},${bottomY} ${points} ${endX},${bottomY}`
    : '';

  let chartView;
  if (loading) {
    chartView = (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <div className="w-6 h-6 border-2 border-cyber-accent-tertiary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-cyber-accent-tertiary uppercase tracking-widest font-cyber-accent animate-pulse">
          {"// LOAD_TRENDS"}
        </p>
      </div>
    );
  } else if (validRates.length < 2) {
    chartView = (
      <div className="flex items-center justify-center py-12">
        <p className="text-xs text-cyber-muted-fg font-semibold uppercase tracking-wider font-cyber-accent">
          {"// DATA_UNAVAILABLE"}
        </p>
      </div>
    );
  } else {
    chartView = (
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="chart-fill-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.0" />
            </linearGradient>
            {/* Line Stroke Gradient */}
            <linearGradient id="chart-stroke-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="rgba(0, 255, 136, 0.08)"
            strokeDasharray="4,4"
          />
          <line
            x1={padding}
            y1={padding + (height - padding * 2) / 2}
            x2={width - padding}
            y2={padding + (height - padding * 2) / 2}
            stroke="rgba(0, 255, 136, 0.04)"
            strokeDasharray="4,4"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(0, 255, 136, 0.15)"
          />

          {/* Y Axis Bounds */}
          <text
            x={padding - 8}
            y={padding + 4}
            textAnchor="end"
            className="text-[9px] fill-cyber-muted-fg font-bold font-cyber-accent"
          >
            {maxRate.toFixed(4)}
          </text>
          <text
            x={padding - 8}
            y={height - padding + 4}
            textAnchor="end"
            className="text-[9px] fill-cyber-muted-fg font-bold font-cyber-accent"
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
            className="text-[9px] fill-cyber-muted-fg font-bold font-cyber-accent"
          >
            {validRates[0]?.date}
          </text>
          <text
            x={width - padding}
            y={height - padding + 16}
            textAnchor="end"
            className="text-[9px] fill-cyber-muted-fg font-bold font-cyber-accent"
          >
            {validRates.at(-1)?.date}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col justify-between font-cyber-body relative">
      {/* Decorative hud panel corner */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-cyber-accent-tertiary/20 pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 relative z-10">
        <div className="font-cyber-accent">
          <h2 className="text-sm font-bold text-cyber-accent-tertiary uppercase tracking-widest font-cyber-headings">
            &gt; HISTORICAL_TRENDS
          </h2>
          <p className="text-[10px] text-cyber-muted-fg mt-0.5 uppercase tracking-wider font-semibold">
            {fromCurrency} / {toCurrency} conversion chart
          </p>
        </div>

        <div className="flex gap-1 bg-cyber-input p-1 text-xs font-semibold border border-cyber-border relative z-0 cyber-chamfer-sm">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => onChangeDays(d)}
              className={`relative px-3 py-1.5 transition-all duration-300 font-cyber-accent cursor-pointer overflow-hidden z-10 ${
                days === d
                  ? 'text-cyber-bg font-bold'
                  : 'text-cyber-muted-fg hover:text-cyber-fg'
              }`}
            >
              {days === d && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 -z-10 cyber-chamfer-sm"
                  style={{
                    background: 'linear-gradient(137deg, #00ff88 0%, #00d4ff 100%)',
                    boxShadow: '0 0 10px rgba(0, 255, 136, 0.45)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {d}D
            </button>
          ))}
        </div>
      </div>

      <div className="cyber-chamfer-sm p-[1.5px] bg-cyber-border w-full flex-1 relative z-10 flex">
        <div className="cyber-chamfer-sm relative bg-cyber-input p-4 flex items-center justify-center min-h-[220px] w-full h-full">
          <div className="absolute inset-0 bg-cyber-grid opacity-[0.25] pointer-events-none" />
          <div className="relative z-10 w-full">
            {chartView}
          </div>
        </div>
      </div>
    </div>
  );
};
