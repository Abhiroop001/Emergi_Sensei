import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiActivity, FiShield } from 'react-icons/fi';

const CCTV = () => {
  const [filter, setFilter] = useState('All');

  const cameras = [
    { id: 'CAM-01', location: 'Main Entrance', status: 'Active', detections: [], image: '/incidents/normal1.jpg' },
    { id: 'CAM-02', location: 'Parking Lot A', status: 'Alert', detections: ['Accident'], image: '/incidents/accident.jpg' },
    { id: 'CAM-03', location: 'Warehouse B', status: 'Alert', detections: ['Fire'], image: '/incidents/fire.jpg' },
    { id: 'CAM-04', location: 'Loading Dock', status: 'Active', detections: [], image: '/incidents/normal2.jpg' },
    { id: 'CAM-05', location: 'Hallway C', status: 'Alert', detections: ['Fire'], image: '/incidents/fire2.jpg' },
    { id: 'CAM-06', location: 'Near Road', status: 'Alert', detections: ['Accident'], image: '/incidents/accident2.jpg' },
    { id: 'CAM-07', location: 'Perimeter Fence', status: 'Alert', detections: ['Accident'], image: '/incidents/accident3.jpg' },
    { id: 'CAM-08', location: 'Server Room', status: 'Active', detections: [], image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop' },
  ];

  const filteredCameras = cameras.filter(cam => {
    if (filter === 'All') return true;
    if (filter === 'Alerts') return cam.status === 'Alert';
    return cam.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Live Feeds</h2>
        
        <div className="flex items-center gap-2 bg-navy-800 p-1 rounded-lg border border-slate-700">
          <FiFilter className="text-slate-400 ml-2 mr-1" />
          {['All', 'Active', 'Alerts', 'Offline'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                filter === f 
                  ? 'bg-neon-blue text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCameras.map((cam, i) => (
          <motion.div
            key={cam.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`glass-panel rounded-xl overflow-hidden border ${
              cam.status === 'Alert' ? 'border-alert-red/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-700/50'
            }`}
          >
            <div className="aspect-video bg-black relative flex items-center justify-center group cursor-pointer">
              {cam.status === 'Offline' ? (
                <div className="text-center">
                  <FiShield className="text-4xl text-slate-600 mx-auto mb-2" />
                  <span className="text-slate-500 text-sm">No Signal</span>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <img 
                    src={cam.image}
                    alt={cam.location}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {/* Bounding box mock for alerts */}
                  {cam.status === 'Alert' && (
                    <div className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 flex items-start ${cam.detections.includes('Fire') ? 'border-alert-red bg-alert-red/10' : 'border-alert-orange bg-alert-orange/10'}`}>
                      <span className={`text-white text-[10px] px-1 font-bold ${cam.detections.includes('Fire') ? 'bg-alert-red' : 'bg-alert-orange'}`}>
                        {cam.detections[0]} 98%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Indicator */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 text-xs font-bold rounded backdrop-blur-md ${
                  cam.status === 'Active' ? 'bg-success-green/80 text-white' : 
                  cam.status === 'Alert' ? 'bg-alert-red/80 text-white animate-pulse' : 
                  'bg-slate-600/80 text-white'
                }`}>
                  {cam.status === 'Alert' ? 'REC' : cam.status}
                </span>
              </div>
            </div>

            <div className="p-4 flex justify-between items-center bg-navy-800">
              <div>
                <h3 className="font-bold text-white text-lg">{cam.id}</h3>
                <p className="text-sm text-slate-400">{cam.location}</p>
              </div>
              
              <div className="flex gap-2">
                {cam.detections.includes('Fire') && (
                  <div className="w-8 h-8 rounded-full bg-alert-red/20 flex items-center justify-center text-alert-red" title="Fire Detected">
                    <FiActivity />
                  </div>
                )}
                {cam.detections.includes('Accident') && (
                  <div className="w-8 h-8 rounded-full bg-alert-orange/20 flex items-center justify-center text-alert-orange" title="Accident Detected">
                    <FiShield />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CCTV;
