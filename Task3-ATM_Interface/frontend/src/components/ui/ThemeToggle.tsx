import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'motion/react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2.5 rounded-xl border border-dark-border/20 light:border-light-border/60 bg-dark-surface/60 light:bg-light-surface/80 backdrop-blur-md text-dark-text light:text-light-text cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-300 flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <FiMoon className="w-5 h-5 text-secondary" />
      ) : (
        <FiSun className="w-5 h-5 text-primary" />
      )}
    </motion.button>
  );
};
