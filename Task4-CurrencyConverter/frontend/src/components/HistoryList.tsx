import React from 'react';
import type { ConversionHistoryItem } from '../types';

interface HistoryListProps {
  history: ConversionHistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onDelete,
  onClear,
}) => {
  return (
    <div className="p-6 h-full flex flex-col justify-between font-cyber-body relative">
      {/* Decorative hud panel corner */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-cyber-accent-secondary/20 pointer-events-none" />

      <div>
        <div className="flex justify-between items-center mb-4 font-cyber-accent">
          <h2 className="text-sm font-bold text-cyber-accent-secondary uppercase tracking-widest font-cyber-headings">
            &gt; LOG_HISTORY
          </h2>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="cyber-chamfer-sm text-[10px] text-cyber-destructive hover:bg-cyber-destructive/10 border border-cyber-destructive/30 px-2.5 py-1.5 transition uppercase tracking-widest cursor-pointer hover:shadow-[0_0_8px_rgba(255,51,102,0.4)]"
            >
              Clear Logs
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-cyber-muted-fg text-sm text-center py-8 font-cyber-accent">
            &gt; No active log entries recorded
          </p>
        ) : (
          <ul className="divide-y divide-cyber-border/40 max-h-[250px] overflow-y-auto pr-1">
            {history.map((item) => (
              <li key={item.id} className="py-3.5 flex justify-between items-center text-sm gap-2 font-cyber-accent border-b border-cyber-border/45 last:border-b-0">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-cyber-fg">
                    <span>{item.amount.toLocaleString()} {item.from}</span>
                    <span className="text-cyber-accent-secondary text-xs">➜</span>
                    <span className="text-cyber-accent">{item.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {item.to}</span>
                  </div>
                  <div className="text-[10px] text-cyber-muted-fg mt-1 font-medium flex items-center gap-1.5">
                    <span className="border border-cyber-border px-1.5 py-0.5 text-[9px] text-cyber-fg/90 bg-cyber-input">
                      RATE: {item.rate.toFixed(5)}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="cyber-chamfer-sm text-cyber-muted-fg hover:text-cyber-destructive hover:bg-cyber-destructive/10 border border-transparent hover:border-cyber-destructive/20 p-2 transition cursor-pointer"
                  title="Delete log entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
