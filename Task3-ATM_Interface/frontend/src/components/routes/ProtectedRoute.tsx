import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { FiCpu } from 'react-icons/fi';

interface SecureGatewayLoaderProps {
  progress: number;
  loadingText: string;
  isFinishing: boolean;
}

const SECURE_GATEWAY_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const SECURE_GATEWAY_PARTICLES = [0, 1, 2, 3];

const SecureGatewayLoader: React.FC<SecureGatewayLoaderProps> = ({
  progress,
  loadingText,
  isFinishing,
}) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isFinishing ? 0 : 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-white font-mono select-none overflow-hidden"
    >
      {/* Futuristic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.35)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(18,24,38,0.35)_1px,_transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Premium Circular Loader */}
      <motion.div
        animate={{ 
          scale: isFinishing ? 1.1 : 1,
          filter: isFinishing ? 'blur(4px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-48 h-48 flex items-center justify-center mb-8"
      >
        {/* Ambient circular glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-xl pointer-events-none" />

        {/* Outer orbit of small dots arranged perfectly in a circle */}
        <div className="absolute inset-0 pointer-events-none">
          {SECURE_GATEWAY_ANGLES.map((angle, idx) => {
            return (
              <div
                key={`dot-angle-${angle}`}
                className="absolute inset-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) translate(0, -84px)',
                    animation: 'orbit-pulse 2s infinite ease-in-out',
                    animationDelay: `${idx * 0.166}s`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Orbiting Active Dot with Particle burst effects */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {/* Active Dot */}
          <div
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 shadow-[0_0_12px_#00d2ff]"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) translate(0, -84px)',
            }}
          />

          {/* Particle / Fragment bursts near the moving active dot */}
          {SECURE_GATEWAY_PARTICLES.map((pi) => {
            const style = {
              top: '50%',
              left: '50%',
              animation: `particle-burst-${pi + 1} 1.2s infinite linear`,
              animationDelay: `${pi * 0.3}s`,
              '--p-scale': 0.5 + progress / 100,
            } as React.CSSProperties;
            return (
              <div
                key={`particle-id-${pi}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_4px_#00f0ff]"
                style={style}
              />
            );
          })}
        </motion.div>

        {/* SVG Ring container */}
        <svg className="w-36 h-36 -rotate-90 relative z-10" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00a2ff" />
              <stop offset="50%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Faint track circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-blue-500/10 fill-none"
            strokeWidth="2.5"
          />

          {/* Glowing progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray={2 * Math.PI * 40}
            animate={{
              strokeDashoffset: 2 * Math.PI * 40 * (1 - progress / 100)
            }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          />
        </svg>

        {/* Main Core Icon (Glassmorphic + Ambient glow) */}
        <motion.div
          animate={{
            scale: progress === 100 ? [1, 1.1, 1] : [0.96, 1.04, 0.96],
            boxShadow: progress === 100
              ? ["0 0 20px rgba(0, 240, 255, 0.3)", "0 0 35px rgba(0, 240, 255, 0.6)", "0 0 20px rgba(0, 240, 255, 0.3)"]
              : ["0 0 15px rgba(59, 130, 246, 0.15)", "0 0 25px rgba(59, 130, 246, 0.3)", "0 0 15px rgba(59, 130, 246, 0.15)"]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/15 to-emerald-500/15 border border-blue-500/30 flex items-center justify-center backdrop-blur-md z-20"
        >
          <FiCpu className={`w-8 h-8 ${progress === 100 ? 'text-emerald-400' : 'text-blue-400'} transition-colors duration-500`} />
        </motion.div>
      </motion.div>

      {/* System Terminal Outputs */}
      <div className="text-center space-y-4 max-w-sm px-6 relative z-10">
        <h2 className="text-sm font-bold tracking-[0.2em] text-blue-500/80 uppercase">
          NEXUS CORE // SECURE GATEWAY
        </h2>
        
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-1.5 h-6">
            <span className={`w-2 h-2 rounded-full ${progress === 100 ? 'bg-blue-500' : 'bg-emerald-500 animate-ping'}`} />
            <p className="text-[12px] text-gray-400 font-semibold tracking-wide">
              {loadingText}
            </p>
          </div>
          <span className="text-[28px] font-bold tracking-[0.05em] text-emerald-400 font-mono">
            {Math.floor(progress)}%
          </span>
        </div>

        <div className="w-48 h-[4px] bg-slate-800/40 rounded-full overflow-hidden mx-auto mt-2 relative border border-slate-700/20">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500"
          />
        </div>
      </div>

      {/* Top-Right Node ID */}
      <div className="absolute top-6 right-6 text-[10px] text-gray-500 text-right uppercase">
        Node ID: <span className="text-gray-400">NEXUS-NODE-v2.1.0</span>
        <br />
        Status: <span className={progress === 100 ? 'text-blue-500' : 'text-emerald-500'}>
          {progress === 100 ? 'Ready' : 'Syncing'}
        </span>
      </div>
    </motion.div>
  );
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing secure node...');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsFinishing(true);
      setProgress(100);
      const doneTimer = setTimeout(() => {
        setIsFinishing(false);
      }, 700);
      return () => clearTimeout(doneTimer);
    }

    // Reset progress on active load
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          return 99; // Hold at 99% max
        }
        if (prev >= 95) {
          // Crawl slowly by 0.1% every tick to show constant active progress
          return prev + 0.1;
        }
        if (prev >= 85) {
          return prev + 1;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 95);
      });
    }, 120);

    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (progress < 25) {
      setLoadingText('Establishing secure handshake...');
    } else if (progress < 50) {
      setLoadingText('Syncing distributed ledger shards...');
    } else if (progress < 75) {
      setLoadingText('Verifying multi-sig credentials...');
    } else if (progress < 95) {
      setLoadingText('Decrypting session keys...');
    } else if (progress >= 98 && !loading) {
      setLoadingText('Authorization successful.');
    } else {
      setLoadingText('Finalizing handshake protocol...');
    }
  }, [progress, loading]);

  if (loading || isFinishing) {
    return (
      <SecureGatewayLoader
        progress={progress}
        loadingText={loadingText}
        isFinishing={isFinishing}
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
