import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const Analysis = () => {
  const trendData = [
    { name: 'Mon', Fire: 4, Accident: 2 },
    { name: 'Tue', Fire: 3, Accident: 1 },
    { name: 'Wed', Fire: 2, Accident: 5 },
    { name: 'Thu', Fire: 7, Accident: 3 },
    { name: 'Fri', Fire: 1, Accident: 2 },
    { name: 'Sat', Fire: 0, Accident: 6 },
    { name: 'Sun', Fire: 2, Accident: 4 },
  ];

  const distributionData = [
    { name: 'Fire', value: 19 },
    { name: 'Accident', value: 23 },
    { name: 'False Alarm', value: 8 },
  ];
  const COLORS = ['#F97316', '#3B82F6', '#64748B'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 glass-panel p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Incident Trends (7 Days)</h2>
            <FiTrendingUp className="text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Fire" stroke="#F97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Accident" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="glass-panel p-6 rounded-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Distribution</h2>
          <div className="h-48 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {distributionData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="glass-panel p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-4 items-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center text-neon-blue">
            <FiAlertCircle className="text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Insights Summary</h2>
            <p className="text-sm text-slate-400">Automated analysis based on recent data</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-navy-900 border border-slate-700 p-4 rounded-lg">
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-bold text-neon-blue">Insight 1:</span> High frequency of vehicle accidents detected at 'Main Intersection' between 17:00 and 19:00. Recommend reviewing traffic management protocols during these hours.
            </p>
          </div>
          <div className="bg-navy-900 border border-slate-700 p-4 rounded-lg">
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-bold text-alert-orange">Insight 2:</span> Fire detection model accuracy has maintained a 98.4% confidence score over the past 30 days. No false positives reported from thermal cameras.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analysis;
