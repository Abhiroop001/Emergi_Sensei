import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock, FiUser, FiAlertCircle, FiCheck, FiShield, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.includes('@') ? username.split('@')[0] : username, 
          password 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token || 'demo-token');
        navigate('/app/dashboard');
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || 'Invalid username or password. (Hint: admin / password123)');
      }
    } catch (err) {
      console.warn("Backend not reached directly, allowing demo bypass:", err);
      // If user is testing frontend standalone without backend, grant access
      if (username === 'admin' && password === 'password123') {
        localStorage.setItem('access_token', 'local-demo-token');
        navigate('/app/dashboard');
      } else {
        setError('Failed to connect to backend server. Make sure FastAPI is running on port 8000.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCreds = () => {
    setUsername('admin');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-2xl relative z-10 border border-slate-700/60 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight">
            <FiEye className="text-neon-blue text-3xl" />
            <span className="text-white">Emergi<span className="text-slate-400">-Sensei</span></span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue border border-neon-blue/20 mt-2">
            Admin Portal v2.0
          </span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1 text-center">Sign In</h2>
        <p className="text-slate-400 text-xs sm:text-sm text-center mb-6">Enter your surveillance operator credentials</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 bg-alert-red/15 border border-alert-red/40 rounded-xl flex items-start gap-2.5 text-red-200"
          >
            <FiAlertCircle className="text-alert-red text-lg shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Username</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-navy-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <button 
                type="button" 
                onClick={fillDemoCreds} 
                className="text-xs text-neon-blue hover:text-neon-blue-light underline"
              >
                Quick Demo Fill
              </button>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-navy-900/60 border border-slate-700/40 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <FiShield className="text-neon-blue" />
              <span>Demo Account:</span>
            </div>
            <span className="font-mono text-slate-300">admin / password123</span>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="btn-primary w-full mt-2 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Signing In...</>
            ) : (
              <>Sign In to Dashboard <FiArrowRight /></>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

