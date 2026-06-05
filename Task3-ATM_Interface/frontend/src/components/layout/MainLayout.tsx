import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';

export const MainLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] font-sans relative flex flex-col transition-colors duration-300 z-10">

      {/* Main Header */}
      <Navbar onMenuClick={handleOpenDrawer} />

      {/* Mobile navigation Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />

      {/* Body container */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto relative">
        {/* Sticky Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 min-h-[calc(100vh-80px)] p-6 md:p-8 overflow-y-auto no-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 15, scale: 0.995, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -15, scale: 0.995, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
