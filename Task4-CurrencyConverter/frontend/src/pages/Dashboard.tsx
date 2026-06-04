import React, { useEffect } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { useHistory } from '../hooks/useHistory';
import { ConversionCard } from '../components/ConversionCard';
import { RateChart } from '../components/RateChart';
import { HistoryList } from '../components/HistoryList';
import { motion } from 'motion/react';
import { TiltCard } from '../components/TiltCard';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 font-sans text-cyber-fg relative overflow-hidden cyber-scanlines cyber-grid">
      {/* Laser beam scanline animation overlay */}
      <div className="cyber-laser-beam" />

      {/* Luminous Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyber-accent/5 blur-3xl animate-float-1 pointer-events-none" />
      <div className="absolute top-[35%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-cyber-accent-secondary/5 blur-3xl animate-float-2 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyber-accent-tertiary/5 blur-3xl animate-float-3 pointer-events-none" />

      <div className="container mx-auto px-0 sm:px-4 py-6 md:py-12 max-w-5xl relative z-10 flex flex-col justify-between items-center w-full">
        <div className="w-full">
          {/* Interactive Hero Title Section */}
          <div
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            role="none"
            className="w-full flex justify-center mb-16 relative overflow-visible"
          >
            {/* Spotlight overlay behind hero text */}
            <div 
              className="absolute pointer-events-none rounded-full blur-[100px] transition-opacity duration-500 ease-out bg-gradient-to-r from-cyber-accent/25 via-cyber-accent-secondary/25 to-cyber-accent-tertiary/25"
              style={{
                left: `${heroGlow.x}px`,
                top: `${heroGlow.y}px`,
                width: '300px',
                height: '300px',
                opacity: heroGlow.opacity,
                transform: 'translate(-50%, -50%)',
                zIndex: -1,
              }}
            />

            {/* Luminous Core Pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyber-accent/5 blur-3xl animate-pulse pointer-events-none z-[-2]" />

            <header className="text-center max-w-3xl mx-auto pointer-events-none select-none relative z-10">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-6 flex justify-center pointer-events-auto"
              >
                <img 
                  src={logo} 
                  alt="Global Currency Converter Logo" 
                  className="h-24 sm:h-28 md:h-32 object-contain select-none pointer-events-none drop-shadow-[0_0_20px_rgba(0,255,136,0.25)]"
                />
              </motion.div>

              {/* Core Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mb-6 inline-block"
              >
                <div className="cyber-chamfer-sm inline-flex items-center gap-2 px-4 py-2 bg-cyber-accent/10 border border-cyber-accent/30 text-xs font-bold text-cyber-accent uppercase tracking-widest font-cyber-accent backdrop-blur-md">
                  <span className="w-1.5 h-1.5 bg-cyber-accent animate-ping" />
                  <span>SYS_ONLINE // LIVE_RATE_FEED</span>
                </div>
              </motion.div>
              
              {/* Glitched Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-widest mb-6 uppercase select-none flex flex-wrap justify-center gap-x-4 md:gap-x-6 relative font-cyber-headings text-white animate-chromatic animate-cyber-glitch">
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
                      scale: 1.025,
                      filter: "drop-shadow(0 0 15px rgba(0, 255, 136, 0.6))",
                    }}
                    className="inline-block pointer-events-auto cursor-default"
                    style={{
                      transformOrigin: "center bottom",
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              
              {/* Subheadline */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <p className="text-xs md:text-sm text-cyber-muted-fg font-medium font-cyber-body tracking-wider uppercase">
                  &gt; Querying high-frequency global exchange matrix. Outputting sanitized conversion telemetry.
                </p>
              </motion.div>
            </header>
          </div>

          {/* Grid Layout Section */}
          <main className="flex flex-col gap-8 w-full">
            {/* Top row: Main conversion card */}
            <motion.div
              initial={{ opacity: 0, y: -35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="w-full"
            >
              <TiltCard 
                glowGradient="linear-gradient(137deg, #00ff88, #00d4ff, #ff00ff, #00ff88)"
                glowColor="rgba(0, 255, 136, 0.4)"
              >
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

            {/* Bottom row: Side-by-side Chart and Log History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-stretch">
              {/* Historical Trends */}
              <motion.div
                initial={{ opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="w-full flex"
              >
                <TiltCard 
                  glowGradient="linear-gradient(137deg, #00d4ff, #00ff88, #00d4ff)"
                  glowColor="rgba(0, 212, 255, 0.4)"
                >
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

              {/* Log History */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="w-full flex"
              >
                <TiltCard 
                  glowGradient="linear-gradient(137deg, #ff00ff, #00d4ff, #ff00ff)"
                  glowColor="rgba(255, 0, 255, 0.4)"
                >
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
        <footer className="mt-20 py-6 text-center text-[10px] md:text-xs text-cyber-muted-fg/60 w-full font-cyber-accent tracking-widest uppercase">
          <p>
            &copy; {new Date().getFullYear()} CORE_CONVERTER &bull; MADE BY ABHIK &bull; SECURE_TELEMETRY
          </p>
        </footer>
      </div>
    </div>
  );
};
