import React, { useEffect } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { useHistory } from '../hooks/useHistory';
import { ConversionCard } from '../components/ConversionCard';
import { RateChart } from '../components/RateChart';
import { HistoryList } from '../components/HistoryList';
import { motion } from 'motion/react';
import { TiltCard } from '../components/TiltCard';

export const Dashboard: React.FC = () => {
  const {
    currencies,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    amount,
    amountInput,
    setAmountInput,
    result,
    rate,
    loading,
    error,
    historicalRates,
    chartDays,
    setChartDays,
    loadingHistory,
    swapCurrencies,
    lastUpdated,
  } = useCurrency();

  const { history, addHistoryItem, deleteHistoryItem, clearHistory } = useHistory();

  const lastAddedRef = React.useRef<{
    from: string;
    to: string;
    amount: number;
    result: number;
  } | null>(null);

  // Interactive Cursor Spotlight behind the Hero Text
  const [heroGlow, setHeroGlow] = React.useState({ x: 0, y: 0, opacity: 0 });
  const heroRef = React.useRef<HTMLDivElement>(null);

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHeroGlow({ x, y, opacity: 0.15 });
  };

  const handleHeroMouseLeave = () => {
    setHeroGlow(prev => ({ ...prev, opacity: 0 }));
  };

  // Save successful conversions to search history
  useEffect(() => {
    if (result !== null && rate !== null && !loading && amount > 0) {
      const lastAdded = lastAddedRef.current;
      if (lastAdded) {
        const isDuplicate =
          lastAdded.from === fromCurrency &&
          lastAdded.to === toCurrency &&
          lastAdded.amount === amount &&
          Math.abs(lastAdded.result - result) < 0.0001;
        if (isDuplicate) return;
      }

      lastAddedRef.current = {
        from: fromCurrency,
        to: toCurrency,
        amount,
        result,
      };
      addHistoryItem(fromCurrency, toCurrency, amount, result, rate);
    }
  }, [result, rate, loading, fromCurrency, toCurrency, amount, addHistoryItem]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Floating Animated Legendary Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/15 blur-3xl animate-float-1 pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-500/15 blur-3xl animate-float-2 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/15 blur-3xl animate-float-3 pointer-events-none" />

      <div className="container mx-auto px-0 sm:px-4 py-6 md:py-12 max-w-5xl relative z-10 flex flex-col justify-between items-center w-full">
        <div className="w-full">
          {/* Interactive Hero Wrapper */}
          <div
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            role="none"
            className="w-full flex justify-center mb-16 relative overflow-visible"
          >
            {/* Interactive Cursor Spotlight behind the text */}
            <div 
              className="absolute pointer-events-none rounded-full blur-[120px] transition-opacity duration-500 ease-out bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30"
              style={{
                left: `${heroGlow.x}px`,
                top: `${heroGlow.y}px`,
                width: '320px',
                height: '320px',
                opacity: heroGlow.opacity,
                transform: 'translate(-50%, -50%)',
                zIndex: -1,
              }}
            />

            {/* Steady Pulsing Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse pointer-events-none z-[-2]" />

            <header className="text-center max-w-3xl mx-auto pointer-events-none select-none relative z-10">
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mb-6 inline-block"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-wider backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Live market exchange rates</span>
                </div>
              </motion.div>
              
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 uppercase select-none flex flex-wrap justify-center gap-x-4 md:gap-x-6 relative">
                {["GLOBAL", "CURRENCY", "CONVERTER"].map((word, idx) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, rotateX: -75, y: 35, scale: 0.9 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 85,
                      damping: 13,
                      delay: 0.05 + idx * 0.12
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.55))",
                    }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 via-purple-300 to-white animate-border-glow pointer-events-auto"
                    style={{
                      backgroundSize: '200% 200%',
                      transformOrigin: "center bottom",
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              
              {/* Subtitle */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                  Convert currencies instantly with real-time exchange rates from around the world.
                </p>
              </motion.div>
            </header>
          </div>

          {/* Main Content Layout */}
          <main className="flex flex-col gap-8 w-full">
            {/* Top Row: Conversion Card (centered, larger) */}
            <motion.div
              initial={{ opacity: 0, y: -35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="w-full"
            >
              <TiltCard glowGradient="linear-gradient(137deg, #3b82f6, #a855f7, #22d3ee, #3b82f6)">
                <ConversionCard
                  currencies={currencies}
                  fromCurrency={fromCurrency}
                  toCurrency={toCurrency}
                  amount={amount}
                  amountInput={amountInput}
                  onChangeAmountInput={setAmountInput}
                  onChangeFromCurrency={setFromCurrency}
                  onChangeToCurrency={setToCurrency}
                  onSwap={swapCurrencies}
                  result={result}
                  rate={rate}
                  loading={loading}
                  error={error}
                  lastUpdated={lastUpdated}
                />
              </TiltCard>
            </motion.div>

            {/* Bottom Row: Rate Chart and History List (side-by-side on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
              {/* Column 1: Historical Trends */}
              <motion.div
                initial={{ opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="w-full flex"
              >
                <TiltCard glowGradient="linear-gradient(137deg, #00f2fe, #4facfe, #00f2fe)">
                  <RateChart
                    historicalRates={historicalRates}
                    fromCurrency={fromCurrency}
                    toCurrency={toCurrency}
                    days={chartDays}
                    onChangeDays={setChartDays}
                    loading={loadingHistory}
                  />
                </TiltCard>
              </motion.div>

              {/* Column 2: History List */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="w-full flex"
              >
                <TiltCard glowGradient="linear-gradient(137deg, #ff0844, #ffb199, #ff0844)">
                  <HistoryList
                    history={history}
                    onDelete={deleteHistoryItem}
                    onClear={clearHistory}
                  />
                </TiltCard>
              </motion.div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-28 py-8 border-t border-white/5 text-center text-xs text-slate-500 w-full">
          <p>&copy; {new Date().getFullYear()} Global Currency Converter. Built for high-frequency conversion.</p>
          <p className="mt-1 font-medium text-slate-400">Enterprise Grade • Safe & Secure</p>
        </footer>
      </div>
    </div>
  );
};

