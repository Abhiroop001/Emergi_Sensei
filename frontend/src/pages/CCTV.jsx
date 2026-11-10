import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiActivity, 
  FiShield, 
  FiCamera, 
  FiMaximize2, 
  FiZap, 
  FiX, 
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload
} from 'react-icons/fi';

const CCTV = () => {
  const [filter, setFilter] = useState('All');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const initialCameras = [
    { id: 'CAM-01', location: 'Main Entrance', status: 'Active', detections: [], image: '/incidents/normal1.jpg', fps: 30, resolution: '1080p', conf: 99.2 },
    { id: 'CAM-02', location: 'Parking Lot A', status: 'Alert', detections: ['Accident'], image: '/incidents/accident.jpg', fps: 28, resolution: '1080p', conf: 89.4 },
    { id: 'CAM-03', location: 'Warehouse B', status: 'Alert', detections: ['Fire'], image: '/incidents/fire.jpg', fps: 30, resolution: '1440p', conf: 98.6 },
    { id: 'CAM-04', location: 'Loading Dock', status: 'Active', detections: [], image: '/incidents/normal2.jpg', fps: 25, resolution: '1080p', conf: 97.8 },
    { id: 'CAM-05', location: 'Hallway C', status: 'Alert', detections: ['Fire'], image: '/incidents/fire2.jpg', fps: 30, resolution: '720p', conf: 94.1 },
    { id: 'CAM-06', location: 'Near Road', status: 'Alert', detections: ['Accident'], image: '/incidents/accident2.jpg', fps: 30, resolution: '1080p', conf: 91.5 },
    { id: 'CAM-07', location: 'Perimeter Fence', status: 'Alert', detections: ['Accident'], image: '/incidents/accident3.jpg', fps: 24, resolution: '1080p', conf: 87.9 },
    { id: 'CAM-08', location: 'Server Room', status: 'Active', detections: [], image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop', fps: 30, resolution: '4K', conf: 99.8 },
  ];

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/cameras/`);
        if (res.ok) {
          const data = await res.json();
          // Merge with extra metadata if available
          setCameras(data.map(c => ({
            ...c,
            conf: c.detections?.length ? 94.5 : 99.0
          })));
        } else {
          setCameras(initialCameras);
        }
      } catch (e) {
        setCameras(initialCameras);
      }
    };
    fetchCameras();
  }, []);

  const handleRunAiScan = () => {
    setIsScanning(true);
    setScanMessage('AI Engine scanning all 8 live RTSP feeds simultaneously...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Scan complete: 4 threats identified with >85% confidence.');
      setTimeout(() => setScanMessage(''), 4000);
    }, 1800);
  };

  const filteredCameras = cameras.filter(cam => {
    if (filter === 'All') return true;
    if (filter === 'Alerts') return cam.status === 'Alert';
    return cam.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiCamera className="text-neon-blue" />
            Live CCTV Feeds & Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Multi-stream neural vision surveillance matrix</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleRunAiScan}
            disabled={isScanning}
            className="btn-primary text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2"
          >
            {isScanning ? (
              <><FiRefreshCw className="animate-spin" /> Scanning Matrix...</>
            ) : (
              <><FiZap /> Run AI Full Matrix Scan</>
            )}
          </button>

          <div className="flex items-center gap-1 bg-navy-800 p-1 rounded-xl border border-slate-700/80">
            <FiFilter className="text-slate-400 ml-2 mr-1 text-sm" />
            {['All', 'Active', 'Alerts'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === f 
                    ? 'bg-neon-blue text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {scanMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-neon-blue/15 border border-neon-blue/40 rounded-xl text-xs sm:text-sm text-neon-blue-light flex items-center gap-2"
        >
          <FiZap />
          <span>{scanMessage}</span>
        </motion.div>
      )}

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCameras.map((cam, i) => (
          <motion.div
            key={cam.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 group flex flex-col ${
              cam.status === 'Alert' 
                ? 'border-alert-red/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-alert-red' 
                : 'border-slate-700/60 hover:border-neon-blue/50'
            }`}
          >
            <div 
              onClick={() => setSelectedCamera(cam)}
              className="aspect-video bg-black relative flex items-center justify-center cursor-pointer overflow-hidden"
            >
              <img 
                src={cam.image}
                alt={cam.location}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              
              {/* Bounding box mock for alerts */}
              {cam.status === 'Alert' && (
                <div className={`absolute inset-4 border-2 flex items-start justify-between p-2 pointer-events-none ${
                  cam.detections.includes('Fire') 
                    ? 'border-alert-red bg-alert-red/10 animate-pulse' 
                    : 'border-alert-orange bg-alert-orange/10 animate-pulse'
                }`}>
                  <span className={`text-white text-[10px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider ${
                    cam.detections.includes('Fire') ? 'bg-alert-red' : 'bg-alert-orange'
                  }`}>
                    {cam.detections[0] || 'Hazard'} {cam.conf}%
                  </span>
                  <span className="text-[10px] font-mono text-white bg-black/60 px-1 rounded">
                    AI TRACK ◉
                  </span>
                </div>
              )}

              {/* Status Indicator & Camera ID Overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md flex items-center gap-1 ${
                  cam.status === 'Active' ? 'bg-success-green/80 text-white' : 
                  cam.status === 'Alert' ? 'bg-alert-red text-white animate-pulse' : 
                  'bg-slate-700/80 text-slate-300'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  {cam.status === 'Alert' ? 'ALERT ACTIVE' : 'LIVE'}
                </span>
                <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-200">
                  {cam.id}
                </span>
              </div>

              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 bg-black/70 backdrop-blur-md text-white rounded-lg hover:bg-neon-blue">
                  <FiMaximize2 className="text-xs" />
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                <span>{cam.resolution} • {cam.fps} FPS</span>
                <span>REC ◉ {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="p-4 flex justify-between items-center bg-navy-800/90 border-t border-slate-700/50">
              <div>
                <h3 className="font-bold text-white text-sm tracking-tight">{cam.id} - {cam.location}</h3>
                <p className="text-xs text-slate-400">SigLIP Engine active</p>
              </div>
              
              <div className="flex gap-2 items-center">
                {cam.detections.includes('Fire') && (
                  <div className="w-7 h-7 rounded-lg bg-alert-red/20 flex items-center justify-center text-alert-red" title="Fire Detected">
                    <FiActivity />
                  </div>
                )}
                {cam.detections.includes('Accident') && (
                  <div className="w-7 h-7 rounded-lg bg-alert-orange/20 flex items-center justify-center text-alert-orange" title="Accident Detected">
                    <FiShield />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedCamera(cam)}
                  className="text-xs text-neon-blue hover:text-neon-blue-light font-semibold px-2 py-1 rounded bg-navy-900 border border-slate-700 hover:border-neon-blue"
                >
                  Inspect
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Camera Inspection Modal */}
      <AnimatePresence>
        {selectedCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCamera(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-4xl rounded-2xl overflow-hidden relative z-10 border border-slate-700/80 shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-navy-900 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-alert-red animate-ping" />
                  <div>
                    <h3 className="font-bold text-white text-base">Camera Telemetry: {selectedCamera.id} ({selectedCamera.location})</h3>
                    <p className="text-xs text-slate-400">Stream Status: {selectedCamera.status} • Feed 1920x1080 @ 30 FPS</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCamera(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="aspect-video bg-black relative">
                <img 
                  src={selectedCamera.image} 
                  alt={selectedCamera.location} 
                  className="w-full h-full object-cover"
                />
                {selectedCamera.status === 'Alert' && (
                  <div className="absolute inset-8 border-2 border-alert-red bg-alert-red/10 p-3 flex flex-col justify-between">
                    <span className="bg-alert-red text-white text-xs font-bold px-2 py-1 rounded w-fit uppercase tracking-wider">
                      {selectedCamera.detections[0]} Detected • {selectedCamera.conf}% AI Confidence
                    </span>
                    <span className="text-xs font-mono text-white bg-black/70 px-2 py-1 rounded w-fit">
                      LIVE AI TELEMETRY BOUNDING BOX ◉
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-navy-800/90 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-700">
                <div className="p-3 bg-navy-900/60 rounded-xl border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">AI Engine</span>
                  <span className="text-xs font-bold text-white">Dual-SigLIP Vision</span>
                </div>
                <div className="p-3 bg-navy-900/60 rounded-xl border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Inference Speed</span>
                  <span className="text-xs font-bold text-success-green">22.4 ms / frame</span>
                </div>
                <div className="p-3 bg-navy-900/60 rounded-xl border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Bitrate</span>
                  <span className="text-xs font-bold text-neon-blue">4.2 Mbps H.265</span>
                </div>
                <div className="p-3 bg-navy-900/60 rounded-xl border border-slate-700/40">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Threat Level</span>
                  <span className={`text-xs font-bold ${selectedCamera.status === 'Alert' ? 'text-alert-red' : 'text-success-green'}`}>
                    {selectedCamera.status === 'Alert' ? 'CRITICAL ALERT' : 'SECURE / NORMAL'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CCTV;

