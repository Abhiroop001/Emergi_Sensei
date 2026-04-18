import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiEye, FiActivity, FiArrowRight } from 'react-icons/fi';

const Landing = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-200 overflow-x-hidden font-sans selection:bg-neon-blue selection:text-white relative">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-alert-red/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <FiEye className="text-neon-blue text-3xl" />
          <span>Emergi<span className="text-white">-Sensei</span></span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 text-slate-300 hover:text-white transition-colors font-medium">Log In</Link>
          <Link to="/app/dashboard" className="px-5 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-full hover:bg-neon-blue hover:text-white transition-all duration-300 font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            View Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <motion.div 
          className="lg:w-1/2 flex flex-col gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800 border border-slate-700 w-fit">
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
            <span className="text-xs font-medium text-slate-300">System Online v2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white tracking-tight">
            AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500">Surveillance & Detection</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Monitor CCTV feeds, detect accidents, classify fire events, and analyze incidents in real-time with our state-of-the-art intelligent AI support system.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/login" className="btn-primary flex items-center gap-2 text-lg px-8 py-3 rounded-full">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/app/dashboard" className="btn-secondary text-lg px-8 py-3 rounded-full bg-navy-800">
              Live Demo
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="lg:w-1/2 relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative z-10 glass-panel rounded-2xl p-2 border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform perspective-[1000px] rotate-y-[-5deg] rotate-x-[5deg]">
            <img 
              src="/incidents/fire.jpg" 
              alt="Dashboard Preview" 
              className="rounded-xl w-full h-auto object-cover opacity-80"
            />
            {/* Overlay UI elements */}
            <motion.div 
              className="absolute -left-8 top-10 glass-panel p-4 rounded-xl flex items-center gap-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="w-10 h-10 rounded-full bg-alert-red/20 flex items-center justify-center">
                <FiActivity className="text-alert-red" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Fire Detected</p>
                <p className="text-xs text-slate-400">Cam 04 - East Wing</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section className="container mx-auto px-6 py-24 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Core Capabilities</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Our advanced machine learning models process video feeds in real-time to provide immediate alerts for critical situations.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FiEye, title: "Real-time Processing", desc: "Process multiple RTSP streams simultaneously with less than 50ms latency." },
            { icon: FiShield, title: "Disaster Classification", desc: "High-accuracy detection of fire, smoke, and structural collapses." },
            { icon: FiActivity, title: "Accident Recognition", desc: "Identify vehicle collisions and workplace hazards instantly." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              className="glass-panel p-8 rounded-2xl hover:border-neon-blue/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="w-14 h-14 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-6">
                <feature.icon className="text-2xl text-neon-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
