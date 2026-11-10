import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiAlertCircle, FiPieChart, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const Analysis = () => {
  const [timeframe, setTimeframe] = useState('7d');
  
  const [trendData7d, setTrendData7d] = useState([
    { name: 'Mon', Fire: 4, Accident: 2, Normal: 140 },
    { name: 'Tue', Fire: 3, Accident: 1, Normal: 152 },
    { name: 'Wed', Fire: 2, Accident: 5, Normal: 139 },
    { name: 'Thu', Fire: 7, Accident: 3, Normal: 160 },
    { name: 'Fri', Fire: 1, Accident: 2, Normal: 178 },
    { name: 'Sat', Fire: 0, Accident: 6, Normal: 190 },
    { name: 'Sun', Fire: 2, Accident: 4, Normal: 165 },
  ]);

  const [trendData30d, setTrendData30d] = useState([
    { name: 'Week 1', Fire: 12, Accident: 15 },
    { name: 'Week 2', Fire: 8, Accident: 11 },
    { name: 'Week 3', Fire: 19, Accident: 23 },
    { name: 'Week 4', Fire: 14, Accident: 18 },
  ]);

  const [distributionData, setDistributionData] = useState([
    { name: 'Fire', value: 19, color: '#F97316' },
    { name: 'Accident', value: 23, color: '#3B82F6' },
    { name: 'False Alarm', value: 8, color: '#64748B' },
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/analytics/summary`);
        if (res.ok) {
          const data = await res.json();
          if (data.trends_7d) setTrendData7d(data.trends_7d);
          if (data.trends_30d) setTrendData30d(data.trends_30d);
          if (data.distribution) setDistributionData(data.distribution);
        }
      } catch (err) {
        console.warn("Using default analysis data:", err);
      }
    };
    fetchAnalytics();
  }, []);

  const activeData = timeframe === '7d' ? trendData7d : trendData30d;

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-navy-800/80 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiTrendingUp className="text-neon-blue" />
            Surveillance AI Telemetry & Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Incident classification metrics across monitored sectors</p>
        </div>
        
        <div className="flex items-center gap-2 bg-navy-900 p-1 rounded-xl border border-slate-700">
          <FiCalendar className="text-slate-400 ml-2 mr-1 text-sm" />
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === '7d' 
                ? 'bg-neon-blue text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeframe === '30d' 
                ? 'bg-neon-blue text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Incident Temporal Trends</h2>
              <p className="text-xs text-slate-400">Classification frequency by time slice</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1 text-alert-orange"><span className="w-2.5 h-2.5 rounded-full bg-alert-orange"></span> Fire</span>
              <span className="flex items-center gap-1 text-neon-blue"><span className="w-2.5 h-2.5 rounded-full bg-neon-blue"></span> Accident</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Fire" stroke="#F97316" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="Accident" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col justify-between"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiPieChart className="text-neon-blue" />
              <h2 className="text-lg font-bold text-white">Event Breakdown</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Proportion of flagged anomalies</p>
          </div>

          <div className="h-48 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700/60 text-center">
            {distributionData.map((entry, i) => (
              <div key={i} className="p-2 bg-navy-900/60 rounded-xl border border-slate-700/40">
                <span className="text-[10px] text-slate-400 block truncate">{entry.name}</span>
                <span className="text-sm font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Automated Insights Cards */}
      <motion.div 
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex gap-3 items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center text-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <FiAlertCircle className="text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Neural Intelligence Diagnostic Summary</h2>
            <p className="text-xs text-slate-400">Continuous pattern recognition & risk mitigation recommendations</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-navy-900/80 border border-slate-700/70 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-neon-blue font-bold text-xs mb-2">
              <FiCheckCircle /> Intersection Peak Hazard
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              High frequency of vehicle accidents detected at <span className="text-white font-semibold">'Main Intersection'</span> between 17:00 and 19:00. Recommend reviewing signal timing.
            </p>
          </div>

          <div className="bg-navy-900/80 border border-slate-700/70 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-alert-orange font-bold text-xs mb-2">
              <FiCheckCircle /> Fire Model Reliability
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              SigLIP fire detection model accuracy maintained a <span className="text-white font-semibold">98.4% confidence score</span> over the past 30 days. No false positives reported from thermal sensors.
            </p>
          </div>

          <div className="bg-navy-900/80 border border-slate-700/70 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-success-green font-bold text-xs mb-2">
              <FiCheckCircle /> Response Latency
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Average alert dispatch speed reduced from <span className="text-white font-semibold">120 seconds to 18 seconds</span> with automated bounding box telemetry.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analysis;

