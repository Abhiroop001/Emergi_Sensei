import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiImage, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiShield, 
  FiActivity, 
  FiDownload, 
  FiCheck,
  FiZap,
  FiFileText
} from 'react-icons/fi';

const Upload = () => {
  const [detectionType, setDetectionType] = useState('Fire');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [alarmRaised, setAlarmRaised] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sampleImages = [
    { name: 'Fire Incident', path: '/incidents/fire.jpg', type: 'Fire' },
    { name: 'Smoke & Flames', path: '/incidents/fire2.jpg', type: 'Fire' },
    { name: 'Vehicle Crash', path: '/incidents/accident.jpg', type: 'Accident' },
    { name: 'Highway Collision', path: '/incidents/accident2.jpg', type: 'Accident' },
    { name: 'Normal Traffic', path: '/incidents/normal1.jpg', type: 'Accident' },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setAlarmRaised(false);
      setErrorMessage('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setAlarmRaised(false);
      setErrorMessage('');
    }
  };

  const handleSelectSample = async (sample) => {
    setDetectionType(sample.type);
    setPreviewUrl(sample.path);
    setResult(null);
    setAlarmRaised(false);
    setErrorMessage('');

    try {
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const filename = sample.path.split('/').pop() || 'sample.jpg';
      const file = new File([blob], filename, { type: 'image/jpeg' });
      setSelectedFile(file);
    } catch (err) {
      console.warn("Could not convert sample to file object:", err);
    }
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or drop an image first.');
      return;
    }

    setIsUploading(true);
    setResult(null);
    setErrorMessage('');
    setAlarmRaised(false);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    const endpoint = detectionType === 'Fire' ? `${apiUrl}/firemodel/` : `${apiUrl}/accidentmodel/`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        setErrorMessage(errData.detail || 'Server encountered an error while processing the image.');
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage('Could not connect to AI detection backend. Please ensure the server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRaiseAlarm = async () => {
    if (!result) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      await fetch(`${apiUrl}/alerts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: detectionType,
          location: "Manual Upload Scan",
          severity: result.confidence > 90 ? "Critical" : "High",
          conf: result.confidence || 95.0,
          snapshot: previewUrl || "/incidents/fire.jpg",
          notes: `Operator triggered alert from manual scan. AI prediction: ${result.prediction} (${result.confidence}%)`
        })
      });
      setAlarmRaised(true);
    } catch (err) {
      setAlarmRaised(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <FiZap className="text-neon-blue" />
              Manual Image Detection
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">Run high-resolution inspection through SigLIP & MobileNet AI models</p>
          </div>

          <div className="inline-flex p-1 bg-navy-900 border border-slate-700 rounded-xl">
            <button 
              onClick={() => { setDetectionType('Fire'); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                detectionType === 'Fire' 
                  ? 'bg-alert-red text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiActivity /> Fire & Smoke
            </button>
            <button 
              onClick={() => { setDetectionType('Accident'); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                detectionType === 'Accident' 
                  ? 'bg-alert-orange text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FiShield /> Vehicle Accident
            </button>
          </div>
        </div>

        {/* Quick sample test images */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Test Samples:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleImages.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  previewUrl === sample.path 
                    ? 'bg-neon-blue/20 border-neon-blue text-white shadow-sm' 
                    : 'bg-navy-900/80 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-navy-800'
                }`}
              >
                <span>{sample.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${sample.type === 'Fire' ? 'bg-alert-red' : 'bg-alert-orange'}`}></span>
              </button>
            ))}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden ${
            isDragOver 
              ? 'border-neon-blue bg-neon-blue/10 scale-[1.01]' 
              : selectedFile 
                ? 'border-slate-600 bg-navy-900/50' 
                : 'border-slate-700 bg-navy-900/30 hover:border-neon-blue/60 hover:bg-navy-900/60'
          }`}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          )}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <FiUploadCloud className="text-3xl" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              {selectedFile ? selectedFile.name : 'Drop your surveillance image here'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Supports JPEG, PNG, WEBP files up to 25MB. High resolution recommended.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3.5 bg-alert-red/15 border border-alert-red/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <FiAlertTriangle className="text-alert-red shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            Selected Engine: <span className="font-semibold text-white">{detectionType === 'Fire' ? 'SigLIP Vision Transformer' : 'MobileNetV2 Classifier'}</span>
          </span>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Running Neural Network...</>
            ) : (
              <><FiImage /> Run AI Detection</>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col md:flex-row gap-8"
          >
            <div className="w-full md:w-1/2 aspect-video bg-navy-950 rounded-xl overflow-hidden relative border border-slate-700/60 flex items-center justify-center shadow-inner">
              <img 
                src={previewUrl || "/incidents/fire.jpg"} 
                alt="Analyzed Feed" 
                className="w-full h-full object-cover"
              />
              {result.status === 'Alert' && (
                <div className="absolute inset-0 border-4 border-alert-red/80 bg-alert-red/10 animate-pulse flex items-start justify-end p-3">
                  <span className="bg-alert-red text-white text-xs font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                    {result.prediction}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-success-green text-lg" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Inference Complete</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.status === 'Alert' 
                      ? 'bg-alert-red/20 text-alert-red border border-alert-red/40' 
                      : 'bg-success-green/20 text-success-green border border-success-green/40'
                  }`}>
                    {result.status}
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">{result.prediction}</h3>
                
                {/* Stage 1 Vehicle Pre-Detection Badge (for Accident Detection) */}
                {detectionType === 'Accident' && result.vehicle_detected !== undefined && (
                  <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
                    result.vehicle_detected 
                      ? 'bg-neon-blue/15 border-neon-blue/40 text-blue-200' 
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{result.vehicle_detected ? '🚗' : '🚫'}</span>
                      <div>
                        <span className="font-bold text-white block">Stage 1: Vehicle Pre-Check</span>
                        <span className="text-[11px] text-slate-300">
                          {result.vehicle_detected 
                            ? `Vehicle Identified: ${result.vehicle_type} (${result.vehicle_confidence}%)` 
                            : 'No car or vehicle found in scene (Risk = 0%)'}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      result.vehicle_detected ? 'bg-neon-blue text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {result.vehicle_detected ? 'CAR DETECTED' : 'NO VEHICLE'}
                    </span>
                  </div>
                )}

                {/* Confidence Bar */}
                <div className="mb-5 p-4 bg-navy-900/80 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">Model Confidence</span>
                    <span className="text-neon-blue font-bold text-sm">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-navy-950 rounded-full h-3 overflow-hidden border border-slate-700/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        result.status === 'Alert' ? 'bg-gradient-to-r from-alert-orange to-alert-red' : 'bg-gradient-to-r from-teal-500 to-success-green'
                      }`}
                    />
                  </div>
                </div>


                {/* Class Probabilities breakdown */}
                {result.probabilities && Object.keys(result.probabilities).length > 0 && (
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Class Distribution:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(result.probabilities).map(([cls, val]) => (
                        <div key={cls} className="p-2 bg-navy-900/60 border border-slate-700/40 rounded-lg text-xs">
                          <p className="text-slate-400 truncate">{cls}</p>
                          <p className="text-white font-bold">{val}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={() => alert(`Report Generated:\nPrediction: ${result.prediction}\nConfidence: ${result.confidence}%\nStatus: ${result.status}`)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 rounded-xl"
                >
                  <FiFileText /> View Report
                </button>
                {result.status === 'Alert' && (
                  <button 
                    onClick={handleRaiseAlarm}
                    disabled={alarmRaised}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      alarmRaised 
                        ? 'bg-success-green/20 text-success-green border border-success-green/40' 
                        : 'bg-alert-red hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    }`}
                  >
                    {alarmRaised ? <><FiCheck /> Alarm Dispatched</> : <><FiAlertTriangle /> Dispatch Emergency Alarm</>}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upload;

