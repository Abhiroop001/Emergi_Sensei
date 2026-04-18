import React from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiAlertTriangle, FiActivity, FiShield } from 'react-icons/fi';

const Dashboard = () => {
  const stats = [
    { title: 'Total Cameras', value: '42', icon: FiCamera, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
    { title: 'Active Alerts', value: '3', icon: FiAlertTriangle, color: 'text-alert-red', bg: 'bg-alert-red/10' },
    { title: 'Fire Detections', value: '1', icon: FiActivity, color: 'text-alert-orange', bg: 'bg-alert-orange/10' },
    { title: 'Accident Detections', value: '2', icon: FiShield, color: 'text-success-green', bg: 'bg-success-green/10' },
  ];

  const recentAlerts = [
    { id: 1, type: 'Fire', location: 'Warehouse Sector B', time: '2 mins ago', severity: 'Critical' },
    { id: 2, type: 'Accident', location: 'Main Intersection', time: '15 mins ago', severity: 'High' },
    { id: 3, type: 'Accident', location: 'Loading Dock', time: '1 hour ago', severity: 'Medium' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            className="glass-panel p-6 rounded-xl flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">System Health & Live Monitoring</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
              <span className="text-sm text-slate-400">All Systems Nominal</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-lg overflow-hidden border border-alert-red group">
              <img src="/incidents/fire.jpg" alt="Fire Detection Feed" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] border-2 border-alert-red bg-alert-red/10 pointer-events-none">
                <span className="bg-alert-red text-white text-xs font-bold px-1 absolute -top-4 left-0">Fire 96%</span>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded flex items-center gap-2 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-alert-red animate-pulse"></span>
                <span className="text-xs font-mono text-white">CAM-04 (WAREHOUSE)</span>
              </div>
              <div className="absolute top-2 right-2 bg-alert-red/80 px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                Fire Detected
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white backdrop-blur-sm">
                REC ◉ {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-alert-orange group">
              <img src="/incidents/accident.jpg" alt="Accident Detection Feed" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] border-2 border-alert-orange bg-alert-orange/10 pointer-events-none">
                <span className="bg-alert-orange text-white text-xs font-bold px-1 absolute -top-4 left-0">Accident 99%</span>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded flex items-center gap-2 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-alert-orange animate-pulse"></span>
                <span className="text-xs font-mono text-white">CAM-12 (INTERSECTION)</span>
              </div>
              <div className="absolute top-2 right-2 bg-alert-orange/80 px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                Accident Detected
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs font-mono text-white backdrop-blur-sm">
                REC ◉ {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="glass-panel p-6 rounded-xl flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Alerts</h2>
            <button className="text-sm text-neon-blue hover:text-neon-blue-light transition-colors">View All</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-navy-900/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {alert.type === 'Fire' ? <FiActivity className="text-alert-red" /> : <FiShield className="text-alert-orange" />}
                    <span className="font-semibold text-white">{alert.type} Detected</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${alert.severity === 'Critical' ? 'bg-alert-red/20 text-alert-red' : alert.severity === 'High' ? 'bg-alert-orange/20 text-alert-orange' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-1">{alert.location}</p>
                <p className="text-xs text-slate-500">{alert.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
