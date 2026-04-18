import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiBell, FiSettings, FiMonitor } from 'react-icons/fi';

const Settings = () => {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {/* Sidebar for settings */}
      <div className="md:col-span-1 space-y-2">
        {[
          { name: 'Profile Information', icon: FiUser, active: true },
          { name: 'Notifications', icon: FiBell, active: false },
          { name: 'Detection Preferences', icon: FiSettings, active: false },
          { name: 'Appearance', icon: FiMonitor, active: false },
        ].map((item, i) => (
          <button 
            key={i}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              item.active ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon />
            <span className="font-medium text-sm">{item.name}</span>
          </button>
        ))}
      </div>

      {/* Main content area */}
      <motion.div 
        className="md:col-span-3 space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="glass-panel p-8 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-blue to-purple-500 flex items-center justify-center text-3xl text-white shadow-lg">
              <FiUser />
            </div>
            <div>
              <button className="btn-secondary text-sm px-4 py-2 mb-2">Change Avatar</button>
              <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>

          <form className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                <input type="text" defaultValue="Admin" className="w-full bg-navy-900 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-neon-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                <input type="text" defaultValue="User" className="w-full bg-navy-900 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-neon-blue" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input type="email" defaultValue="admin@safevision.ai" className="w-full bg-navy-900 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-neon-blue" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Role / Access Level</label>
              <input type="text" defaultValue="System Administrator" disabled className="w-full bg-navy-900 border border-slate-700 rounded-lg py-2.5 px-4 text-slate-500 cursor-not-allowed opacity-70" />
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button type="button" className="btn-primary px-6 py-2">Save Changes</button>
            </div>
          </form>
        </div>

        <div className="glass-panel p-8 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-6">Detection Preferences</h2>
          
          <div className="space-y-4">
            {[
              { title: 'Fire Classification Alerts', desc: 'Receive immediate notifications when fire is detected.', enabled: true },
              { title: 'Accident Recognition Alerts', desc: 'Notify emergency response on severe collisions.', enabled: true },
              { title: 'False Alarm Auto-Resolution', desc: 'Automatically dismiss low-confidence detections (< 50%).', enabled: false },
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-navy-900 border border-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-white text-sm">{setting.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{setting.desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${setting.enabled ? 'bg-neon-blue' : 'bg-slate-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
