import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';

const DashboardLayout = ({ children, sidebarItems }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="md:hidden absolute top-5 left-5 z-30">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300"
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>
        </div>

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div className={`absolute md:static inset-y-0 left-0 z-40 transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-out flex`}>
          <Sidebar items={sidebarItems} />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
          <div className="mx-auto w-full max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
