import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiSearch, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('cctv')) return 'CCTV Monitoring';
    if (path.includes('upload')) return 'Upload Detection';
    if (path.includes('analysis')) return 'System Analysis';
    if (path.includes('alerts')) return 'Alerts Management';
    if (path.includes('settings')) return 'System Settings';
    return 'Emergi-Sensei';
  };

  return (
    <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-10 flex items-center justify-between px-6 md:pl-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search cameras, alerts..." 
            className="bg-navy-800 border border-slate-700 text-sm rounded-full py-1.5 pl-9 pr-4 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all w-64"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-slate-400 hover:text-white transition-colors">
            <FiBell className="text-xl" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-alert-red rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          </button>
          
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-blue to-purple-500 flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <FiUser className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
