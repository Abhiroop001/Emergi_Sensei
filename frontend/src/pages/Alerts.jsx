import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Alerts = () => {
  const alertsList = [
    { id: 'ALT-1045', type: 'Fire', location: 'Warehouse Sector B', time: '10 Oct 2023, 14:32:01', severity: 'Critical', status: 'Active', conf: 98 },
    { id: 'ALT-1044', type: 'Accident', location: 'Main Intersection', time: '10 Oct 2023, 12:15:44', severity: 'High', status: 'Active', conf: 89 },
    { id: 'ALT-1043', type: 'Accident', location: 'Loading Dock A', time: '09 Oct 2023, 08:22:10', severity: 'Medium', status: 'Resolved', conf: 75 },
    { id: 'ALT-1042', type: 'Fire', location: 'Cafeteria Kitchen', time: '08 Oct 2023, 19:05:00', severity: 'Critical', status: 'Resolved', conf: 99 },
    { id: 'ALT-1041', type: 'Accident', location: 'Parking Lot C', time: '07 Oct 2023, 11:45:22', severity: 'Low', status: 'False Alarm', conf: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-navy-800">
          <h2 className="text-xl font-bold text-white">Alert History</h2>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-alert-red/20 text-alert-red rounded-full font-medium">2 Active Critical</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-900 border-b border-slate-700 text-slate-400 text-sm">
                <th className="py-4 px-6 font-medium">Alert ID</th>
                <th className="py-4 px-6 font-medium">Type</th>
                <th className="py-4 px-6 font-medium">Location & Time</th>
                <th className="py-4 px-6 font-medium">Severity</th>
                <th className="py-4 px-6 font-medium">AI Confidence</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {alertsList.map((alert, index) => (
                <motion.tr 
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-4 px-6 text-sm font-mono text-slate-300">{alert.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {alert.type === 'Fire' ? <FiActivity className="text-alert-red" /> : <FiShield className="text-alert-orange" />}
                      <span className="text-white font-medium">{alert.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-white font-medium">{alert.location}</p>
                    <p className="text-xs text-slate-500">{alert.time}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                      alert.severity === 'Critical' ? 'bg-alert-red/20 text-alert-red border border-alert-red/30' : 
                      alert.severity === 'High' ? 'bg-alert-orange/20 text-alert-orange border border-alert-orange/30' : 
                      'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-navy-900 rounded-full overflow-hidden">
                        <div className={`h-full ${alert.conf > 90 ? 'bg-alert-red' : alert.conf > 70 ? 'bg-alert-orange' : 'bg-slate-500'}`} style={{ width: `${alert.conf}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-400">{alert.conf}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.status === 'Active' ? 'bg-alert-red/10 text-alert-red animate-pulse' : 
                      alert.status === 'Resolved' ? 'bg-success-green/10 text-success-green' : 
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {alert.status === 'Active' ? (
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 bg-success-green/20 text-success-green hover:bg-success-green hover:text-white rounded transition-colors" title="Resolve">
                          <FiCheckCircle />
                        </button>
                        <button className="p-1.5 bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white rounded transition-colors" title="Dismiss">
                          <FiXCircle />
                        </button>
                      </div>
                    ) : (
                      <button className="text-sm text-neon-blue hover:text-neon-blue-light underline">View Report</button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
