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
  FiFileText,
  FiInfo
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/api';

const Upload = () => {
  const [detectionType, setDetectionType] = useState('Accident');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [alarmRaised, setAlarmRaised] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sampleImages = [
    { name: 'Vehicle Crash (Car + Accident)', path: '/incidents/accident.jpg', type: 'Accident', desc: 'Car Present + Collision' },
    { name: 'Highway Collision (Multi-Vehicle)', path: '/incidents/accident2.jpg', type: 'Accident', desc: 'Vehicles Present + Crash' },
    { name: 'Normal Traffic (Car Safe)', path: '/incidents/normal1.jpg', type: 'Accident', desc: 'Car Present + No Collision' },
    { name: 'Empty Scene (No Car Safe)', path: '/incidents/fire.jpg', type: 'Accident', desc: 'No Car Detected -> Safe' },
    { name: 'Fire Incident (Active Flame)', path: '/incidents/fire.jpg', type: 'Fire', desc: 'Flame Hazard' },
    { name: 'Smoke & Flames (Active Fire)', path: '/incidents/fire2.jpg', type: 'Fire', desc: 'Combustion Hazard' },
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

    const apiUrl = API_BASE_URL;
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
      const apiUrl = API_BASE_URL;
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
            <p className="text-slate-400 text-xs sm:text-sm">
              Hierarchical 2-stage vision pipeline: Hugging Face YOLOS (Vehicle Verification) + TFLite Accident Classifier
            </p>
          </div>

          <div className="inline-flex p-1 bg-navy-900 border border-slate-700 rounded-xl">
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
          </div>
        </div>

        {/* Quick sample test images */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Test Bench Samples:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sampleImages.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  previewUrl === sample.path && detectionType === sample.type
                    ? 'bg-neon-blue/20 border-neon-blue text-white shadow-md' 
                    : 'bg-navy-900/80 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold truncate">{sample.name}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sample.type === 'Fire' ? 'bg-alert-red' : 'bg-alert-orange'}`}></span>
                </div>
                <span className="text-[10px] text-slate-400">{sample.desc}</span>
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
            Selected Engine: <span className="font-semibold text-white">
              {detectionType === 'Fire' 
                ? 'SigLIP-2 Vision Transformer' 
                : '2-Stage: Hugging Face YOLOS (Vehicle) + TFLite (Accident)'}
            </span>
          </span>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Running Neural Pipeline...</>
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
              {result.status === 'Alert' ? (
                <div className="absolute inset-0 border-4 border-alert-red/80 bg-alert-red/10 animate-pulse flex items-start justify-end p-3">
                  <span className="bg-alert-red text-white text-xs font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                    {result.prediction}
                  </span>
                </div>
              ) : (
                <div className="absolute inset-0 border-2 border-success-green/40 bg-success-green/5 flex items-start justify-end p-3">
                  <span className="bg-success-green text-white text-xs font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
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
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pipeline Completed</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.status === 'Alert' 
                      ? 'bg-alert-red/20 text-alert-red border border-alert-red/40' 
                      : 'bg-success-green/20 text-success-green border border-success-green/40'
                  }`}>
                    {result.status}
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">{result.prediction}</h3>

                {/* 2-STAGE HIERARCHICAL ACCIDENT PIPELINE DISPLAY */}
                {detectionType === 'Accident' && result.vehicle_detected !== undefined && (
                  <div className="space-y-2 mb-4">
                    {/* Stage 1: Hugging Face Vehicle Detection */}
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      result.vehicle_detected 
                        ? 'bg-neon-blue/15 border-neon-blue/40 text-blue-100' 
                        : 'bg-slate-800/90 border-slate-700 text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{result.vehicle_detected ? '🚗' : '🚫'}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">Stage 1: Vehicle Pre-Check (Hugging Face)</span>
                          </div>
                          <span className="text-[11px] text-slate-300 block">
                            {result.vehicle_detected 
                              ? `Identified ${result.vehicle_type} (${result.vehicle_confidence}% detection confidence). Proceeded to collision check.` 
                              : 'No cars or vehicles detected in frame. Collision risk is 0%.'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        result.vehicle_detected ? 'bg-neon-blue text-white shadow-sm' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {result.vehicle_detected ? 'VEHICLE PRESENT' : 'NO VEHICLE'}
                      </span>
                    </div>

                    {/* Stage 2: TFLite Collision Assessment */}
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      !result.vehicle_detected
                        ? 'bg-navy-950/60 border-slate-800 text-slate-400'
                        : result.status === 'Alert'
                        ? 'bg-alert-red/15 border-alert-red/40 text-red-100'
                        : 'bg-success-green/15 border-success-green/40 text-emerald-100'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{!result.vehicle_detected ? '⏸️' : result.status === 'Alert' ? '💥' : '🛣️'}</span>
                        <div>
                          <span className="font-bold text-white block">Stage 2: Accident Evaluation (TFLite)</span>
                          <span className="text-[11px] text-slate-300 block">
                            {!result.vehicle_detected 
                              ? 'Stage 2 bypassed safely because Stage 1 found no vehicle.' 
                              : result.prediction}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        !result.vehicle_detected 
                          ? 'bg-slate-800 text-slate-400' 
                          : result.status === 'Alert' 
                          ? 'bg-alert-red text-white' 
                          : 'bg-success-green text-white'
                      }`}>
                        {!result.vehicle_detected ? 'BYPASSED (SAFE)' : result.status === 'Alert' ? 'CRASH DETECTED' : 'NORMAL'}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Diagnostic Notes Banner */}
                {result.notes && (
                  <div className="mb-4 p-3 bg-navy-900/90 rounded-xl border border-slate-700/70 text-xs flex items-start gap-2 text-slate-300">
                    <FiInfo className="text-neon-blue mt-0.5 shrink-0 text-sm" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">AI Diagnostic Verdict</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{result.notes}</p>
                    </div>
                  </div>
                )}

                {/* Confidence Bar */}
                <div className="mb-4 p-4 bg-navy-900/80 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">Confidence Score</span>
                    <span className="text-neon-blue font-bold text-sm">{result.confidence}%</span>
                  </div>
                  <div className="w-full bg-navy-950 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
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
                  <div className="mb-4">
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
                  onClick={() => alert(`Emergi-Sensei AI Report:\nPrediction: ${result.prediction}\nConfidence: ${result.confidence}%\nStatus: ${result.status}\nStage: ${result.stage || 'Completed'}\nDiagnostic: ${result.notes || 'N/A'}`)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 rounded-xl"
                >
                  <FiFileText /> View Full Report
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
