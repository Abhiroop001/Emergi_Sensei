import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBell, FiSettings, FiMonitor, FiCheck, FiSave, FiShield, FiSliders } from 'react-icons/fi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [savedToast, setSavedToast] = useState(false);

  const [preferences, setPreferences] = useState({
    fireAlerts: true,
    accidentAlerts: true,
    autoDismissFalseAlarms: false,
    audioBeepOnCritical: true,
    emailDigest: true,
    desktopNotifications: true
  });

  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'Operator',
    email: 'admin@safevision.ai',
    role: 'Surveillance Chief Officer'
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 p-4 bg-success-green/90 text-white rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold"
          >
            <FiCheck className="text-xl" />
            <span>Settings saved and applied successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar for settings */}
      <div className="md:col-span-1 space-y-1.5">
        {[
          { id: 'profile', name: 'Profile Information', icon: FiUser },
          { id: 'detection', name: 'Detection Preferences', icon: FiSliders },
          { id: 'notifications', name: 'Alert Channels', icon: FiBell },
          { id: 'appearance', name: 'System Appearance', icon: FiMonitor },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-xs sm:text-sm font-semibold ${
              activeTab === item.id 
                ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <item.icon className="text-base" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Main content area */}
      <div className="md:col-span-3 space-y-6">
        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Operator Profile</h2>
            <p className="text-xs text-slate-400 mb-6">Manage system operator identity and authentication parameters</p>
            
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-neon-blue to-purple-600 flex items-center justify-center text-3xl text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <FiUser />
              </div>
              <div>
                <button type="button" className="btn-secondary text-xs px-3.5 py-2 rounded-xl mb-1.5 font-semibold">Change Avatar</button>
                <p className="text-[11px] text-slate-500">JPG, PNG or SVG. Max 2MB.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    value={profile.firstName} 
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full bg-navy-900/90 border border-slate-700/80 rounded-xl py-2.5 px-4 text-white text-xs sm:text-sm focus:outline-none focus:border-neon-blue" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    value={profile.lastName} 
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full bg-navy-900/90 border border-slate-700/80 rounded-xl py-2.5 px-4 text-white text-xs sm:text-sm focus:outline-none focus:border-neon-blue" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-navy-900/90 border border-slate-700/80 rounded-xl py-2.5 px-4 text-white text-xs sm:text-sm focus:outline-none focus:border-neon-blue" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Role / Access Level</label>
                <input 
                  type="text" 
                  value={profile.role} 
                  disabled 
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-400 text-xs sm:text-sm cursor-not-allowed opacity-70" 
                />
              </div>

              <div className="pt-4 border-t border-slate-700/60 flex justify-end">
                <button type="submit" className="btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                  <FiSave /> Save Profile Changes
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'detection' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">AI Detection Preferences</h2>
            <p className="text-xs text-slate-400 mb-6">Configure threshold parameters and automated dispatch behaviors</p>
            
            <div className="space-y-4">
              {[
                { key: 'fireAlerts', title: 'Fire & Smoke Classification Alerts', desc: 'Trigger high-priority alerts on SigLIP confidence > 80%.' },
                { key: 'accidentAlerts', title: 'Accident Recognition Alerts', desc: 'Notify emergency response on severe multi-vehicle collisions.' },
                { key: 'autoDismissFalseAlarms', title: 'False Alarm Auto-Suppression', desc: 'Automatically suppress transient detections with < 50% confidence.' },
                { key: 'audioBeepOnCritical', title: 'Audible Siren on Critical Threat', desc: 'Play audible tone on operator console for critical fire alerts.' },
              ].map((setting) => {
                const isEnabled = preferences[setting.key];
                return (
                  <div 
                    key={setting.key} 
                    onClick={() => togglePreference(setting.key)}
                    className="flex items-center justify-between p-4 bg-navy-900/80 border border-slate-700/60 rounded-xl cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-white text-xs sm:text-sm">{setting.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{setting.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${isEnabled ? 'bg-neon-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/60 flex justify-end">
              <button onClick={handleSave} className="btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                <FiSave /> Save Preferences
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Dispatch & Notification Channels</h2>
            <p className="text-xs text-slate-400 mb-6">Manage webhook endpoints and operational messaging</p>
            
            <div className="space-y-4">
              {[
                { key: 'desktopNotifications', title: 'Browser Desktop Push Alerts', desc: 'Display instant OS notifications when critical incidents occur.' },
                { key: 'emailDigest', title: 'Daily Operational Summary Digest', desc: 'Receive nightly 24-hour summary of all resolved/active incidents.' },
              ].map((setting) => {
                const isEnabled = preferences[setting.key];
                return (
                  <div 
                    key={setting.key} 
                    onClick={() => togglePreference(setting.key)}
                    className="flex items-center justify-between p-4 bg-navy-900/80 border border-slate-700/60 rounded-xl cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-white text-xs sm:text-sm">{setting.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{setting.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${isEnabled ? 'bg-neon-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-700/60 flex justify-end">
              <button onClick={handleSave} className="btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                <FiSave /> Save Channels
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl"
          >
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Appearance & Theme</h2>
            <p className="text-xs text-slate-400 mb-6">Customize UI color styling and display layout</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-navy-900 border-2 border-neon-blue rounded-xl flex items-center justify-between cursor-pointer">
                <div>
                  <h3 className="font-bold text-white text-sm">Deep Cyber Navy (Default)</h3>
                  <p className="text-xs text-slate-400">High-contrast surveillance dark mode</p>
                </div>
                <FiCheck className="text-neon-blue text-xl" />
              </div>
              <div className="p-4 bg-navy-900/60 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer opacity-70 hover:opacity-100">
                <div>
                  <h3 className="font-bold text-white text-sm">OLED Pure Black</h3>
                  <p className="text-xs text-slate-400">Ultra-low power command center theme</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;

