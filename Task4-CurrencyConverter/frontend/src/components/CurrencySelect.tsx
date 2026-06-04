import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Currency } from '../types';

interface CurrencySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currencies: Currency[];
  disabled?: boolean;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  label,
  value,
  onChange,
  currencies,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find currently selected currency object
  const selectedCurrency = useMemo(() => {
    return currencies.find((c) => c.code === value);
  }, [currencies, value]);



  // Filter list based on code and name case-insensitively
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return currencies;

    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    );
  }, [currencies, search]);

  // Reset highlight index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Click outside to close listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered.length > 0 && highlightedIndex >= 0) {
          onChange(filtered[highlightedIndex].code);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        // Let natural tab-out close select
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll highlighted item into view if not visible
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const list = listRef.current;
      const activeEl = list.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        const listHeight = list.clientHeight;
        const activeTop = activeEl.offsetTop;
        const activeHeight = activeEl.clientHeight;

        if (activeTop + activeHeight > list.scrollTop + listHeight) {
          list.scrollTop = activeTop + activeHeight - listHeight;
        } else if (activeTop < list.scrollTop) {
          list.scrollTop = activeTop;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
        {label}
      </span>

      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-white font-semibold transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none text-left"
      >
        <span className="truncate">
          {selectedCurrency ? (
            <span className="flex items-center gap-2">
              {selectedCurrency.flagUrl ? (
                <img
                  src={selectedCurrency.flagUrl}
                  alt={`${selectedCurrency.code} flag`}
                  className="w-5 h-3.5 object-cover rounded border border-white/10 flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <span className="text-base select-none">{selectedCurrency.flag}</span>
              )}
              <span className="text-white font-bold">{selectedCurrency.code}</span>
              <span className="text-slate-400 text-xs font-medium truncate">
                {selectedCurrency.symbol ? `(${selectedCurrency.symbol})` : ''} — {selectedCurrency.name}
              </span>
            </span>
          ) : (
            <span className="text-slate-400 font-bold">{value}</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div className="absolute top-[102%] left-0 w-full bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 mt-1 p-2 flex flex-col gap-2 animate-fade-in max-w-full">
          {/* Search Input Box */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search code or name..."
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-slate-500 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold px-1.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Currency Items List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto divide-y divide-white/5 pr-0.5 flex flex-col"
          >
            {filtered.length === 0 ? (
              <div className="text-slate-500 text-xs py-4 text-center font-semibold">
                No matching currencies found
              </div>
            ) : (
              filtered.map((currency, idx) => {
                const isSelected = currency.code === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    type="button"
                    key={currency.code}
                    onClick={() => {
                      onChange(currency.code);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3 py-2.5 rounded-xl transition flex items-center justify-between text-sm text-left ${
                      isHighlighted ? 'bg-white/10' : ''
                    } ${isSelected ? 'text-blue-400 font-semibold' : 'text-slate-300'}`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {currency.flagUrl ? (
                        <img
                          src={currency.flagUrl}
                          alt={`${currency.code} flag`}
                          className="w-5 h-3.5 object-cover rounded border border-white/10 flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-base select-none">{currency.flag}</span>
                      )}
                      <span className="font-bold text-white">{currency.code}</span>
                      <span className="text-xs text-slate-400 truncate">
                        {currency.symbol ? `(${currency.symbol})` : ''} — {currency.name}
                      </span>
                    </span>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
