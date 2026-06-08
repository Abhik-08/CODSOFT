import { motion } from 'motion/react'
import { Plus, Upload, Search } from 'lucide-react'

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-vault-fg to-vault-fg/75 bg-clip-text text-transparent">
            Student Registry Console
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Manage, search, and register student academic intelligence profiles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan hover:from-vault-accent/90 hover:to-vault-cyan/90 text-white rounded-xl transition-all shadow-md shadow-vault-accent/10 hover:shadow-vault-accent/20 cursor-pointer font-bold text-sm">
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Registry Panel */}
      <div className="vault-glass rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm">
        
        {/* Search header ribbon */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="relative flex items-center w-full max-w-md rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 focus-within:bg-white dark:focus-within:bg-[#070b14]/50 focus-within:border-vault-accent focus-within:ring-4 focus-within:ring-vault-accent/10 transition-all duration-200 shadow-sm hover:border-slate-300 dark:hover:border-white/10">
            <Search size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search students by name, enrolment, or department..."
              className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-vault-fg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Premium Empty State Visual Illustration & Action Prompt */}
        <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Animated Database SVG Illustration */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-48 h-48 flex items-center justify-center"
          >
            {/* Background glowing circle */}
            <div className="absolute w-32 h-32 rounded-full bg-vault-accent/5 dark:bg-vault-accent/10 blur-[30px] animate-pulse" />
            <div className="absolute w-24 h-24 rounded-full bg-vault-cyan/5 dark:bg-vault-cyan/10 blur-[20px] animate-pulse delay-700" />

            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible relative z-10">
              <defs>
                <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-vault-accent)" />
                  <stop offset="100%" stopColor="var(--color-vault-cyan)" />
                </linearGradient>
              </defs>
              
              {/* Outer floating orbiting dash circles */}
              <motion.circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="rgba(16, 185, 129, 0.12)"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
              />
              <motion.circle
                cx="100"
                cy="100"
                r="55"
                fill="none"
                stroke="rgba(6, 182, 212, 0.12)"
                strokeWidth="1"
                strokeDasharray="4 6"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
              />

              {/* Database Cylinder stack in the center */}
              <g transform="translate(65, 55)">
                {/* Cylinder 3 (Top) */}
                <motion.g
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <path d="M 0 10 A 35 10 0 0 0 70 10 A 35 10 0 0 0 0 10 Z M 0 10 L 0 25 A 35 10 0 0 0 70 25 L 70 10 Z" fill="url(#dbGrad)" opacity="0.9" />
                  <ellipse cx="35" cy="10" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.4" />
                </motion.g>

                {/* Cylinder 2 (Middle) */}
                <motion.g
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                >
                  <path d="M 0 32 A 35 10 0 0 0 70 32 A 35 10 0 0 0 0 32 Z M 0 32 L 0 47 A 35 10 0 0 0 70 47 L 70 32 Z" fill="url(#dbGrad)" opacity="0.75" />
                  <ellipse cx="35" cy="32" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.3" />
                </motion.g>

                {/* Cylinder 1 (Bottom) */}
                <g>
                  <path d="M 0 54 A 35 10 0 0 0 70 54 A 35 10 0 0 0 0 54 Z M 0 54 L 0 69 A 35 10 0 0 0 70 69 L 70 54 Z" fill="url(#dbGrad)" opacity="0.6" />
                  <ellipse cx="35" cy="54" rx="35" ry="10" fill="#a7f3d0" className="dark:fill-emerald-300" opacity="0.2" />
                </g>
              </g>

              {/* Floating particles */}
              <motion.circle cx="45" cy="80" r="3" fill="var(--color-vault-accent)" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5 }} />
              <motion.circle cx="160" cy="110" r="2.5" fill="var(--color-vault-cyan)" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4.2 }} />
            </svg>
          </motion.div>

          {/* Empty state prompt typography */}
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              No Students Added Yet
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs mx-auto">
              Start building your academic intelligence database by registering your first student.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-vault-accent to-vault-cyan hover:from-vault-accent/90 hover:to-vault-cyan/90 text-white rounded-xl font-bold text-sm shadow-md shadow-vault-accent/15 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200">
              <Plus size={16} />
              <span>Add Student</span>
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed shadow-sm transition-all"
              title="CSV Import (Coming Soon)"
              disabled
            >
              <Upload size={16} />
              <span>Import Data</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
