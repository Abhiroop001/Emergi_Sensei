import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiBell, FiSearch, FiUser, FiMenu, FiCheckCircle, FiShield, FiActivity, FiLogOut } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch recent active alerts for notification menu
    const fetchAlerts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/alerts/?status=Active`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (e) {
        // Fallback default
        setAlerts([
          { id: 'ALT-1045', type: 'Fire', location: 'Warehouse Sector B', time: '2m ago', severity: 'Critical' },
          { id: 'ALT-1044', type: 'Accident', location: 'Main Intersection', time: '15m ago', severity: 'High' },
        ]);
      }
    };
    fetchAlerts();
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('live-camera')) return 'Live Camera AI Scanner';
    if (path.includes('cctv')) return 'CCTV Monitoring';
    if (path.includes('upload')) return 'AI Manual Upload & Detection';
    if (path.includes('analysis')) return 'System Analytics & Trends';
    if (path.includes('alerts')) return 'Incident Alerts Management';
    if (path.includes('settings')) return 'System Settings';
    return 'Emergi-Sensei';
  };


  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-slate-800"
          aria-label="Toggle Menu"
        >
          <FiMenu className="text-2xl" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Threat & Hazard Detection System</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden lg:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search cameras, incidents..." 
            className="bg-navy-800/80 border border-slate-700/70 text-sm rounded-full py-1.5 pl-9 pr-4 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all w-56 xl:w-64 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FiBell className="text-xl" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-alert-red rounded-full shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-navy-900/80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">Active Threat Alerts</span>
                    <span className="px-2 py-0.5 text-xs bg-alert-red/20 text-alert-red rounded-full font-bold">{alerts.length}</span>
                  </div>
                  <Link 
                    to="/app/alerts" 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-neon-blue hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">No active alerts right now</div>
                  ) : (
                    alerts.slice(0, 4).map((alert) => (
                      <div key={alert.id} className="p-3.5 hover:bg-slate-700/40 transition-colors flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${alert.type === 'Fire' ? 'bg-alert-red/20 text-alert-red' : 'bg-alert-orange/20 text-alert-orange'}`}>
                          {alert.type === 'Fire' ? <FiActivity className="text-lg" /> : <FiShield className="text-lg" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-sm font-semibold text-white truncate">{alert.type} Detected</span>
                            <span className="text-[10px] text-slate-400">{alert.time}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{alert.location}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-neon-blue/50 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-blue to-purple-500 flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <FiUser className="text-white text-sm" />
              </div>
              <span className="text-xs font-medium text-slate-300 hidden sm:block">Admin</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-4 py-2 border-b border-slate-700/60">
                  <p className="text-sm font-semibold text-white">System Admin</p>
                  <p className="text-xs text-slate-400">admin@safevision.ai</p>
                </div>
                <Link 
                  to="/app/settings" 
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-alert-red/10 flex items-center gap-2"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

