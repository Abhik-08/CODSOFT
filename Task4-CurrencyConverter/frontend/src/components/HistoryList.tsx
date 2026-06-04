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
    <div className="p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">Conversion History</h2>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No recent transactions recorded</p>
        ) : (
          <ul className="divide-y divide-white/5 max-h-[250px] overflow-y-auto pr-1">
            {history.map((item) => (
              <li key={item.id} className="py-3.5 flex justify-between items-center text-sm gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-white">
                    <span>{item.amount.toLocaleString()} {item.from}</span>
                    <span className="text-blue-400 text-xs font-normal">➜</span>
                    <span className="text-cyan-400">{item.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {item.to}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                    <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
                      Rate: {item.rate.toFixed(5)}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                  title="Delete item"
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
