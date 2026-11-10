import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCamera, 
  FiVideo,
  FiUploadCloud, 
  FiPieChart, 
  FiAlertTriangle, 
  FiSettings, 
  FiLogOut,
  FiX
} from 'react-icons/fi';

import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: FiHome },
    { name: 'Live Camera AI', path: '/app/live-camera', icon: FiVideo },
    { name: 'CCTV Monitoring', path: '/app/cctv', icon: FiCamera },
    { name: 'Upload Detection', path: '/app/upload', icon: FiUploadCloud },
    { name: 'Analysis & Trends', path: '/app/analysis', icon: FiPieChart },
    { name: 'Incident Alerts', path: '/app/alerts', icon: FiAlertTriangle },
    { name: 'Settings', path: '/app/settings', icon: FiSettings },
  ];


  const sidebarContent = (
    <div className="w-64 h-full bg-navy-900 border-r border-slate-700/60 flex flex-col shadow-2xl">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/60">
        <NavLink to="/app/dashboard" className="flex items-center gap-2 text-neon-blue font-bold text-xl tracking-tight">
          <FiCamera className="text-2xl" />
          <span>Emergi<span className="text-white">-Sensei</span></span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden">
            <FiX className="text-xl" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-neon-blue/15 border border-neon-blue/40 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`text-lg z-10 ${isActive ? 'text-neon-blue' : 'group-hover:text-neon-blue-light'}`} />
              <span className="text-sm z-10">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System status card */}
      <div className="p-4 mx-4 mb-3 bg-navy-800/80 border border-slate-700/60 rounded-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
          <span className="text-xs font-semibold text-white">AI Engine v2.0 Active</span>
        </div>
        <p className="text-[11px] text-slate-400">SigLIP & MobileNet Dual Models Online</p>
      </div>

      <div className="p-4 border-t border-slate-700/60">
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium"
        >
          <FiLogOut className="text-lg" />
          <span>Sign Out</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="w-64 h-screen fixed left-0 top-0 z-20 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

