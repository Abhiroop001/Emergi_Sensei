import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiCamera, 
  FiAlertTriangle, 
  FiActivity, 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiArrowRight, 
  FiUploadCloud,
  FiZap
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Cameras', value: '42', icon: FiCamera, color: 'text-neon-blue', bg: 'bg-neon-blue/10', change: '+3 online' },
    { title: 'Active Alerts', value: '2', icon: FiAlertTriangle, color: 'text-alert-red', bg: 'bg-alert-red/10', change: 'Immediate action' },
    { title: 'Fire Detections', value: '19', icon: FiActivity, color: 'text-alert-orange', bg: 'bg-alert-orange/10', change: '+4 this week' },
    { title: 'Accident Detections', value: '23', icon: FiShield, color: 'text-success-green', bg: 'bg-success-green/10', change: '98.6% accuracy' },
  ]);

  const [recentAlerts, setRecentAlerts] = useState([
    { id: 'ALT-1045', type: 'Fire', location: 'Warehouse Sector B', time: '2 mins ago', severity: 'Critical', status: 'Active' },
    { id: 'ALT-1044', type: 'Accident', location: 'Main Intersection', time: '15 mins ago', severity: 'High', status: 'Active' },
    { id: 'ALT-1043', type: 'Accident', location: 'Loading Dock A', time: '1 hour ago', severity: 'Medium', status: 'Resolved' },
  ]);

  const [systemHealth, setSystemHealth] = useState({
    status: 'Nominal',
    latency: '24.5ms',
    uptime: '99.98%'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        
        // Fetch analytics
        const analyticsRes = await fetch(`${apiUrl}/analytics/summary`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (analyticsData.stats) {
            setStats([
              { title: 'Total Cameras', value: analyticsData.stats[0].value, icon: FiCamera, color: 'text-neon-blue', bg: 'bg-neon-blue/10', change: analyticsData.stats[0].change },
              { title: 'Active Alerts', value: analyticsData.stats[1].value, icon: FiAlertTriangle, color: 'text-alert-red', bg: 'bg-alert-red/10', change: analyticsData.stats[1].change },
              { title: 'Fire Detections', value: analyticsData.stats[2].value, icon: FiActivity, color: 'text-alert-orange', bg: 'bg-alert-orange/10', change: analyticsData.stats[2].change },
              { title: 'Accident Detections', value: analyticsData.stats[3].value, icon: FiShield, color: 'text-success-green', bg: 'bg-success-green/10', change: analyticsData.stats[3].change },
            ]);
          }
          if (analyticsData.system_health) {
            setSystemHealth({
              status: analyticsData.system_health.overall,
              latency: analyticsData.system_health.avg_inference_latency,
              uptime: analyticsData.system_health.uptime
            });
          }
        }

        // Fetch recent alerts
        const alertsRes = await fetch(`${apiUrl}/alerts/`);
        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          setRecentAlerts(alertsData.slice(0, 4));
        }
      } catch (err) {
        console.warn("Using fallback local telemetry for dashboard:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const handleResolveAlert = async (id) => {
    setRecentAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      await fetch(`${apiUrl}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
    } catch (e) {
      // Local state already updated
    }
  };

  const handleDismissAlert = async (id) => {
    setRecentAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'False Alarm' } : a));
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      await fetch(`${apiUrl}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'False Alarm' })
      });
    } catch (e) {
      // Local state already updated
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-navy-800 to-navy-900 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center text-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <FiZap className="text-2xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Emergency Surveillance Command Center</h2>
            <p className="text-xs text-slate-400">SigLIP & MobileNet Dual AI Core online • Latency: {systemHealth.latency} • Uptime: {systemHealth.uptime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link to="/app/upload" className="btn-primary text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 flex-1 md:flex-initial">
            <FiUploadCloud /> Manual AI Scan
          </Link>
          <Link to="/app/cctv" className="btn-secondary text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 flex-1 md:flex-initial">
            <FiCamera /> Live Matrix
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-700/60 flex items-center gap-4 hover:border-slate-600 transition-all duration-300 shadow-lg"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} shadow-inner shrink-0`}>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Monitoring & Incident Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Feed Spotlight */}
        <motion.div 
          className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col shadow-xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Live AI Threat Detection Spotlight</h2>
              <span className="w-2 h-2 rounded-full bg-alert-red animate-ping" />
            </div>
            <Link to="/app/cctv" className="text-xs font-semibold text-neon-blue hover:text-neon-blue-light flex items-center gap-1">
              View All 8 Feeds <FiArrowRight />
            </Link>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feed 1: Fire */}
            <div className="relative rounded-xl overflow-hidden border border-alert-red group aspect-video bg-black shadow-lg">
              <img src="/incidents/fire.jpg" alt="Fire Feed" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
              <div className="absolute inset-4 border-2 border-alert-red bg-alert-red/15 animate-pulse flex items-start justify-between p-2">
                <span className="bg-alert-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  FIRE 98.4%
                </span>
                <span className="text-[10px] font-mono text-white bg-black/60 px-1 rounded">
                  SigLIP Transformer
                </span>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-alert-red animate-pulse"></span>
                <span className="text-[11px] font-mono text-white">CAM-03 (WAREHOUSE B)</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-white backdrop-blur-md">
                REC ◉ {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Feed 2: Accident */}
            <div className="relative rounded-xl overflow-hidden border border-alert-orange group aspect-video bg-black shadow-lg">
              <img src="/incidents/accident.jpg" alt="Accident Feed" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
              <div className="absolute inset-4 border-2 border-alert-orange bg-alert-orange/15 animate-pulse flex items-start justify-between p-2">
                <span className="bg-alert-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  ACCIDENT 89.2%
                </span>
                <span className="text-[10px] font-mono text-white bg-black/60 px-1 rounded">
                  MobileNet Classifier
                </span>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-alert-orange animate-pulse"></span>
                <span className="text-[11px] font-mono text-white">CAM-02 (PARKING LOT A)</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-white backdrop-blur-md">
                REC ◉ {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right 1 Col: Recent Alerts */}
        <motion.div 
          className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col shadow-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Critical Alerts</h2>
              <p className="text-xs text-slate-400">Live triage queue</p>
            </div>
            <Link to="/app/alerts" className="text-xs font-semibold text-neon-blue hover:text-neon-blue-light">
              View All
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="p-3.5 bg-navy-900/70 border border-slate-700/60 rounded-xl hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    {alert.type === 'Fire' ? (
                      <div className="p-1.5 bg-alert-red/20 text-alert-red rounded-lg"><FiActivity className="text-sm" /></div>
                    ) : (
                      <div className="p-1.5 bg-alert-orange/20 text-alert-orange rounded-lg"><FiShield className="text-sm" /></div>
                    )}
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm">{alert.type} Incident</span>
                      <span className="text-[10px] text-slate-400 block">{alert.id}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.status === 'Active' 
                      ? 'bg-alert-red/20 text-alert-red animate-pulse' 
                      : 'bg-success-green/20 text-success-green'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-1">{alert.location}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>{alert.time}</span>
                  {alert.status === 'Active' && (
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-2 py-0.5 bg-success-green/20 text-success-green hover:bg-success-green hover:text-white rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <FiCheckCircle /> Resolve
                      </button>
                      <button 
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-2 py-0.5 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <FiXCircle /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

