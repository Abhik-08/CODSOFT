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

  const selectedCurrency = useMemo(() => {
    return currencies.find((c) => c.code === value);
  }, [currencies, value]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return currencies;

    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
    );
  }, [currencies, search]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setHighlightedIndex(0);
    });
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      Promise.resolve().then(() => {
        setSearch('');
      });
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

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
    <div className="flex flex-col gap-1.5 w-full relative font-cyber-body" ref={containerRef}>
      <span className="text-xs font-semibold text-cyber-muted-fg uppercase tracking-widest block font-cyber-accent">
        {"// "}{label}
      </span>

      {/* Main Select Button - Double Clipped Border Pattern */}
      <div 
        className={`cyber-chamfer-sm p-[1px] transition-all duration-300 ${
          isOpen 
            ? 'bg-cyber-accent-tertiary shadow-[0_0_10px_rgba(0,212,255,0.4)]' 
            : 'bg-cyber-border'
        }`}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="cyber-chamfer-sm w-full px-4 py-3 bg-cyber-input focus:outline-none text-cyber-fg font-semibold flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none text-left"
        >
          <span className="truncate">
            {selectedCurrency ? (
              <span className="flex items-center gap-2">
                {selectedCurrency.flagUrl ? (
                  <img
                    src={selectedCurrency.flagUrl}
                    alt={`${selectedCurrency.code} flag`}
                    className="w-5 h-3.5 object-cover rounded-none border border-cyber-border flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-base select-none">{selectedCurrency.flag}</span>
                )}
                <span className="text-cyber-fg font-bold font-cyber-accent">{selectedCurrency.code}</span>
                <span className="text-cyber-muted-fg text-xs font-medium truncate">
                  {selectedCurrency.symbol ? `(${selectedCurrency.symbol})` : ''} — {selectedCurrency.name}
                </span>
              </span>
            ) : (
              <span className="text-cyber-muted-fg font-bold font-cyber-accent">{value}</span>
            )}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-cyber-accent-tertiary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Floating Dropdown List - Sharp Terminal Box */}
      {isOpen && (
        <div className="absolute top-[102%] left-0 w-full bg-cyber-bg/95 border-2 border-cyber-accent-tertiary shadow-[0_0_15px_rgba(0,212,255,0.25)] z-50 mt-1 p-2 flex flex-col gap-2 max-w-full">
          {/* Search Input Box */}
          <div className="relative p-[1px] bg-cyber-border focus-within:bg-cyber-accent-tertiary transition-colors duration-200">
            <div className="flex items-center bg-cyber-input">
              <span className="pl-3 text-cyber-accent-tertiary font-bold font-cyber-accent text-sm">&gt;</span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="FIND_CODE..."
                className="w-full px-2 py-2 text-sm bg-transparent border-none outline-none focus:outline-none text-cyber-fg placeholder-cyber-muted-fg/40 font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-cyber-muted-fg hover:text-cyber-accent-tertiary text-xs font-bold px-2 py-2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Currency Items List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto divide-y divide-cyber-border pr-0.5 flex flex-col font-cyber-accent"
          >
            {filtered.length === 0 ? (
              <div className="text-cyber-muted-fg text-xs py-4 text-center font-semibold uppercase tracking-wider">
                {"// NO_MATCHES_FOUND"}
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
                    className={`w-full px-3 py-2.5 transition flex items-center justify-between text-sm text-left border-l-2 cursor-pointer ${
                      isHighlighted 
                        ? 'bg-cyber-accent-tertiary/10 border-cyber-accent-tertiary text-cyber-accent-tertiary' 
                        : 'border-transparent text-cyber-fg'
                    } ${isSelected ? 'text-cyber-accent-tertiary font-bold bg-cyber-accent-tertiary/5' : ''}`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {currency.flagUrl ? (
                        <img
                          src={currency.flagUrl}
                          alt={`${currency.code} flag`}
                          className="w-5 h-3.5 object-cover rounded-none border border-cyber-border flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-base select-none">{currency.flag}</span>
                      )}
                      <span className="font-bold text-cyber-fg">{currency.code}</span>
                      <span className="text-xs text-cyber-muted-fg truncate">
                        {currency.symbol ? `(${currency.symbol})` : ''} — {currency.name}
                      </span>
                    </span>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-cyber-accent-tertiary flex-shrink-0"
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
