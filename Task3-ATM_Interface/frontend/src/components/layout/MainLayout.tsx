import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';

export const MainLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="min-h-screen bg-dark-bg light:bg-light-bg text-dark-text light:text-light-text font-sans relative flex flex-col transition-colors duration-300">
      {/* Cyber/Fintech scanline laser overlay */}
      <div className="cyber-scanline" />

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};
