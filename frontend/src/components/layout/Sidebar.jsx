import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCamera, 
  FiUploadCloud, 
  FiPieChart, 
  FiAlertTriangle, 
  FiSettings, 
  FiLogOut 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: FiHome },
    { name: 'CCTV Monitoring', path: '/app/cctv', icon: FiCamera },
    { name: 'Upload Detection', path: '/app/upload', icon: FiUploadCloud },
    { name: 'Analysis', path: '/app/analysis', icon: FiPieChart },
    { name: 'Alerts', path: '/app/alerts', icon: FiAlertTriangle },
    { name: 'Settings', path: '/app/settings', icon: FiSettings },
  ];

  return (
    <aside className="w-64 h-screen bg-navy-900 border-r border-slate-700/50 flex flex-col fixed left-0 top-0 z-20 hidden md:flex shadow-2xl">
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-neon-blue font-bold text-xl tracking-tight">
          <FiCamera className="text-2xl" />
          <span>Emergi<span className="text-white">-Sensei</span></span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-neon-blue/10 border border-neon-blue/20 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`text-lg z-10 ${isActive ? 'text-neon-blue' : 'group-hover:text-neon-blue-light'}`} />
              <span className="font-medium z-10">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <FiLogOut className="text-lg" />
          <span className="font-medium">Logout</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
