import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiFilter, 
  FiFileText, 
  FiX, 
  FiAlertTriangle,
  FiClock,
  FiMapPin
} from 'react-icons/fi';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const initialAlerts = [
    { id: 'ALT-1045', type: 'Fire', location: 'Warehouse Sector B', time: 'Today, 14:32:01', severity: 'Critical', status: 'Active', conf: 98.4, snapshot: '/incidents/fire.jpg', notes: 'Thermal anomaly and high particulate smoke detected in Zone 4.' },
    { id: 'ALT-1044', type: 'Accident', location: 'Main Intersection', time: 'Today, 12:15:44', severity: 'High', status: 'Active', conf: 89.2, snapshot: '/incidents/accident.jpg', notes: 'Two-car impact at north crosswalk. Traffic slowed.' },
    { id: 'ALT-1043', type: 'Accident', location: 'Loading Dock A', time: 'Yesterday, 08:22:10', severity: 'Medium', status: 'Resolved', conf: 75.0, snapshot: '/incidents/accident2.jpg', notes: 'Forklift mirror bump. Security cleared site.' },
    { id: 'ALT-1042', type: 'Fire', location: 'Cafeteria Kitchen', time: '2 days ago, 19:05:00', severity: 'Critical', status: 'Resolved', conf: 99.1, snapshot: '/incidents/fire2.jpg', notes: 'Cooktop flame flash. Extinguished via automated overhead system.' },
    { id: 'ALT-1041', type: 'Accident', location: 'Parking Lot C', time: '3 days ago, 11:45:22', severity: 'Low', status: 'False Alarm', conf: 45.3, snapshot: '/incidents/accident3.jpg', notes: 'Reflective sunlight trigger on metallic dumpster.' },
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/alerts/`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        } else {
          setAlerts(initialAlerts);
        }
      } catch (err) {
        setAlerts(initialAlerts);
      }
    };
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert(prev => ({ ...prev, status: newStatus }));
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      await fetch(`${apiUrl}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Updated locally");
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = statusFilter === 'All' || alert.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || alert.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesStatus && matchesType;
  });

  const activeCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header with quick stats */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-navy-800/80 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiAlertTriangle className="text-alert-red" />
            Incident Alert Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Live surveillance threat assessment & dispatch records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-alert-red/20 border border-alert-red/40 rounded-xl flex items-center gap-2 text-alert-red text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-alert-red animate-ping" />
            <span>{activeCount} Active Emergencies</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <FiFilter /> Status:
          </span>
          {['All', 'Active', 'Resolved', 'False Alarm'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === status 
                  ? 'bg-neon-blue text-white shadow-sm' 
                  : 'bg-navy-800 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Type:</span>
          {['All', 'Fire', 'Accident'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === type 
                  ? 'bg-slate-700 text-white border border-slate-500' 
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-navy-900 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Incident ID</th>
                <th className="py-4 px-6 font-semibold">Classification</th>
                <th className="py-4 px-6 font-semibold">Location & Timestamp</th>
                <th className="py-4 px-6 font-semibold">Severity</th>
                <th className="py-4 px-6 font-semibold">AI Confidence</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                    No alerts match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert, index) => (
                  <motion.tr 
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6 text-xs font-mono text-slate-300 font-bold">{alert.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {alert.type === 'Fire' ? (
                          <div className="p-1.5 bg-alert-red/20 text-alert-red rounded-lg"><FiActivity /></div>
                        ) : (
                          <div className="p-1.5 bg-alert-orange/20 text-alert-orange rounded-lg"><FiShield /></div>
                        )}
                        <span className="text-white font-semibold text-xs sm:text-sm">{alert.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs sm:text-sm text-white font-semibold">{alert.location}</p>
                      <p className="text-[11px] text-slate-400">{alert.time}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                        alert.severity === 'Critical' ? 'bg-alert-red/20 text-alert-red border-alert-red/30' : 
                        alert.severity === 'High' ? 'bg-alert-orange/20 text-alert-orange border-alert-orange/30' : 
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-navy-950 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className={`h-full rounded-full ${alert.conf > 90 ? 'bg-alert-red' : alert.conf > 70 ? 'bg-alert-orange' : 'bg-slate-400'}`} 
                            style={{ width: `${alert.conf}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-300">{alert.conf}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                        alert.status === 'Active' ? 'bg-alert-red/20 text-alert-red animate-pulse' : 
                        alert.status === 'Resolved' ? 'bg-success-green/20 text-success-green' : 
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {alert.status === 'Active' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(alert.id, 'Resolved')}
                              className="px-2.5 py-1 bg-success-green/20 text-success-green hover:bg-success-green hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1" 
                              title="Resolve Alert"
                            >
                              <FiCheckCircle /> Resolve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(alert.id, 'False Alarm')}
                              className="px-2.5 py-1 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1" 
                              title="Mark False Alarm"
                            >
                              <FiXCircle /> Dismiss
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2.5 py-1 bg-navy-900 border border-slate-700 hover:border-neon-blue text-neon-blue rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <FiFileText /> Details
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden relative z-10 border border-slate-700/80 shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-navy-900 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${selectedAlert.type === 'Fire' ? 'bg-alert-red/20 text-alert-red' : 'bg-alert-orange/20 text-alert-orange'}`}>
                    {selectedAlert.type === 'Fire' ? <FiActivity /> : <FiShield />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedAlert.id} - {selectedAlert.type} Incident</h3>
                    <p className="text-xs text-slate-400">{selectedAlert.location} • {selectedAlert.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="aspect-video bg-navy-950 rounded-xl overflow-hidden relative border border-slate-700">
                  <img src={selectedAlert.snapshot || "/incidents/fire.jpg"} alt="Evidence Snapshot" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/70 px-2.5 py-1 rounded-md text-xs font-mono text-white backdrop-blur-md">
                    SNAPSHOT EVIDENCE ◉
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-navy-900/80 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Severity</span>
                    <span className="text-xs font-bold text-alert-red">{selectedAlert.severity}</span>
                  </div>
                  <div className="p-3 bg-navy-900/80 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confidence</span>
                    <span className="text-xs font-bold text-neon-blue">{selectedAlert.conf}%</span>
                  </div>
                  <div className="p-3 bg-navy-900/80 rounded-xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Status</span>
                    <span className={`text-xs font-bold ${selectedAlert.status === 'Active' ? 'text-alert-red' : 'text-success-green'}`}>
                      {selectedAlert.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-navy-900/80 rounded-xl border border-slate-700/50">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Operator / AI Incident Notes</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedAlert.notes || 'Automated sensor alert generated during surveillance cycle.'}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'Resolved')}
                    className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle /> Mark Incident Resolved
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'False Alarm')}
                    className="btn-secondary flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <FiXCircle /> Dismiss as False Alarm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alerts;

