import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { FiCpu } from 'react-icons/fi';

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
        if (prev >= 98) {
          return 98; // Wait at 98% until firebase authentication resolves
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 98);
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-white font-mono select-none overflow-hidden">
        {/* Futuristic Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.35)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(18,24,38,0.35)_1px,_transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none" />

        {/* Ambient background glow */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

        {/* Scanner & Logo container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Cyber Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-28 h-28 rounded-full border border-dashed border-blue-500/45 border-t-transparent flex items-center justify-center"
          />

          {/* Cyber Inner Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute w-20 h-20 rounded-full border border-dashed border-emerald-500/35 border-b-transparent"
          />

          {/* Main Core Icon */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            <FiCpu className="w-6 h-6 text-blue-500" />
          </motion.div>
        </div>

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
              {progress.toString().padStart(3, '0')}%
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
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
