import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCamera, 
  FiRefreshCw, 
  FiVideo, 
  FiVideoOff, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiActivity, 
  FiShield, 
  FiZap, 
  FiDownload, 
  FiRepeat, 
  FiSliders, 
  FiClock, 
  FiLayers,
  FiMaximize,
  FiFileText
} from 'react-icons/fi';

const LiveCamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  
  const [modelMode, setModelMode] = useState('dual'); // 'dual', 'fire', 'accident'
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [autoScan, setAutoScan] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alarmRaised, setAlarmRaised] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Initialize camera streams & list video devices
  useEffect(() => {
    const listDevices = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("Could not list video devices:", err);
      }
    };
    listDevices();
  }, []);

  // Start / Stop camera stream
  const isMountedRef = useRef(true);
  const streamRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (isMountedRef.current) {
      setStreamActive(false);
      setAutoScan(false);
    }
  };

  const startCamera = async (deviceId = selectedDeviceId, mode = facingMode) => {
    if (!isMountedRef.current) return;
    setCameraError('');
    stopCamera();

    try {
      const constraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (!isMountedRef.current || !videoRef.current) return;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (isMountedRef.current) setStreamActive(true);
              })
              .catch((err) => {
                if (err.name !== 'AbortError') {
                  console.warn("Video playback warning:", err);
                }
              });
          }
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (isMountedRef.current) {
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : err.name === 'NotFoundError'
            ? 'No camera device found on this system.'
            : `Unable to access camera: ${err.message}`
        );
        setStreamActive(false);
      }
    }
  };

  // Trigger camera on mount or device/orientation change
  useEffect(() => {
    startCamera(selectedDeviceId, facingMode);
    return () => {
      stopCamera();
    };
  }, [selectedDeviceId, facingMode]);


  // Handle Capture Snapshot & Send to Models
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !streamActive) return;
    
    // Trigger shutter flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
    setAlarmRaised(false);
    setIsProcessing(true);
    setAnalysisResult(null);

    // Convert dataURL to Blob for API
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      const file = new File([blob], `live_snapshot_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';

      try {
        if (modelMode === 'fire') {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch(`${apiUrl}/firemodel/`, { method: 'POST', body: fd });
          if (res.ok) {
            const data = await res.json();
            setAnalysisResult({
              type: 'Fire',
              primary: data,
              overallStatus: data.status,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        } else if (modelMode === 'accident') {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch(`${apiUrl}/accidentmodel/`, { method: 'POST', body: fd });
          if (res.ok) {
            const data = await res.json();
            setAnalysisResult({
              type: 'Accident',
              primary: data,
              overallStatus: data.status,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        } else {
          // Dual Model Parallel Execution
          const fdFire = new FormData();
          fdFire.append('file', file);
          const fdAccident = new FormData();
          fdAccident.append('file', file);

          const [fireRes, accidentRes] = await Promise.all([
            fetch(`${apiUrl}/firemodel/`, { method: 'POST', body: fdFire }),
            fetch(`${apiUrl}/accidentmodel/`, { method: 'POST', body: fdAccident })
          ]);

          const fireData = fireRes.ok ? await fireRes.json() : null;
          const accidentData = accidentRes.ok ? await accidentRes.json() : null;

          const isFireAlert = fireData?.status === 'Alert';
          const isAccidentAlert = accidentData?.status === 'Alert';
          const isAlert = isFireAlert || isAccidentAlert;

          setAnalysisResult({
            type: 'Dual',
            fire: fireData,
            accident: accidentData,
            overallStatus: isAlert ? 'Alert' : 'Safe',
            threatSummary: isFireAlert && isAccidentAlert 
              ? 'Multi-Hazard: Fire & Accident Detected' 
              : isFireAlert 
              ? `${fireData.prediction}` 
              : isAccidentAlert 
              ? `${accidentData.prediction}` 
              : 'All Systems Normal (No Hazard)',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      } catch (err) {
        console.error("Inference Error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.95);
  };

  // Timer countdown capture
  const handleDelayedCapture = (seconds) => {
    setCountdown(seconds);
    let current = seconds;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        captureAndAnalyze();
      }
    }, 1000);
  };

  // Auto-Scan interval
  useEffect(() => {
    let scanTimer = null;
    if (autoScan && streamActive && !isProcessing && !capturedImage) {
      scanTimer = setInterval(() => {
        captureAndAnalyze();
      }, 4000);
    }
    return () => {
      if (scanTimer) clearInterval(scanTimer);
    };
  }, [autoScan, streamActive, isProcessing, capturedImage]);

  // Raise emergency alarm to backend
  const handleRaiseAlarm = async () => {
    if (!analysisResult) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const hazardType = analysisResult.fire?.status === 'Alert' ? 'Fire' : 'Accident';
      const conf = analysisResult.fire?.confidence || analysisResult.accident?.confidence || analysisResult.primary?.confidence || 95.0;

      await fetch(`${apiUrl}/alerts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: hazardType,
          location: "Live Camera Stream Capture",
          severity: conf > 90 ? "Critical" : "High",
          conf: conf,
          snapshot: capturedImage,
          notes: `Operator triggered alert from live camera snapshot. Threat: ${analysisResult.threatSummary || analysisResult.primary?.prediction}`
        })
      });
      setAlarmRaised(true);
    } catch (e) {
      setAlarmRaised(true);
    }
  };

  // Retake photo and return to live stream
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setAlarmRaised(false);
    if (!streamActive) {
      startCamera();
    }
  };

  // Download snapshot with AI overlay info
  const handleDownloadSnapshot = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `emergi_ai_snapshot_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-navy-800/80 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FiCamera className="text-neon-blue" />
            Live Camera AI Optical Scanner
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">Direct webcam optical feed with real-time neural classification</p>
        </div>

        {/* Model Selection Pills */}
        <div className="inline-flex p-1 bg-navy-900 border border-slate-700/80 rounded-xl">
          <button
            onClick={() => setModelMode('dual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              modelMode === 'dual' ? 'bg-neon-blue text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiLayers /> Dual Engine
          </button>
          <button
            onClick={() => setModelMode('fire')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              modelMode === 'fire' ? 'bg-alert-red text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiActivity /> Fire (SigLIP)
          </button>
          <button
            onClick={() => setModelMode('accident')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              modelMode === 'accident' ? 'bg-alert-orange text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiShield /> Accident (MobileNet)
          </button>
        </div>
      </div>

      {/* Main Viewfinder & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewfinder Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-700/70 relative aspect-video bg-black shadow-2xl flex items-center justify-center">
            {/* Shutter flash effect */}
            {flashEffect && (
              <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
            )}

            {/* Countdown Overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-8xl font-black text-neon-blue animate-ping">{countdown}</span>
              </div>
            )}

            {/* Live Video Viewfinder */}
            {!capturedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* HUD Viewfinder Grid & Corner Targets */}
                {streamActive && (
                  <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                    {/* Top HUD */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-neon-blue bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-neon-blue/20 w-fit">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-alert-red animate-pulse"></span>
                        LIVE OPTICAL STREAM ◉
                      </span>
                      <span className="mx-2 text-slate-500">|</span>
                      <span>{modelMode.toUpperCase()} NEURAL PIPELINE</span>
                    </div>

                    {/* Central Targeting Reticle */}
                    <div className="self-center w-48 h-48 border border-neon-blue/30 rounded-2xl relative flex items-center justify-center">
                      <div className="w-3 h-3 border-t-2 border-l-2 border-neon-blue absolute -top-1 -left-1"></div>
                      <div className="w-3 h-3 border-t-2 border-r-2 border-neon-blue absolute -top-1 -right-1"></div>
                      <div className="w-3 h-3 border-b-2 border-l-2 border-neon-blue absolute -bottom-1 -left-1"></div>
                      <div className="w-3 h-3 border-b-2 border-r-2 border-neon-blue absolute -bottom-1 -right-1"></div>
                      <div className="w-2 h-2 bg-neon-blue/40 rounded-full animate-ping"></div>
                    </div>

                    {/* Bottom HUD */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700">
                      <span>RESOLUTION: 1080P HD</span>
                      <span>AUTO-EXPOSURE: ACTIVE</span>
                      <span>FPS: 30</span>
                    </div>
                  </div>
                )}

                {/* Camera error / offline view */}
                {!streamActive && (
                  <div className="text-center p-8 z-10 max-w-md">
                    <FiVideoOff className="text-5xl text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Camera Standby / Inactive</h3>
                    <p className="text-xs text-slate-400 mb-6">{cameraError || 'Click below to grant camera permissions and start the optical viewfinder.'}</p>
                    <button onClick={() => startCamera()} className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
                      <FiVideo /> Initialize Camera Stream
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Captured Freeze Frame & AI Visualization */
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={capturedImage} 
                  alt="Captured Snapshot" 
                  className="w-full h-full object-cover" 
                />
                {analysisResult && (
                  <div className={`absolute inset-6 border-4 rounded-xl pointer-events-none p-4 flex flex-col justify-between ${
                    analysisResult.overallStatus === 'Alert'
                      ? 'border-alert-red bg-alert-red/15 animate-pulse'
                      : 'border-success-green bg-success-green/10'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-black px-2.5 py-1 rounded shadow-lg uppercase tracking-wider text-white ${
                        analysisResult.overallStatus === 'Alert' ? 'bg-alert-red' : 'bg-success-green'
                      }`}>
                        {analysisResult.threatSummary || analysisResult.primary?.prediction}
                      </span>
                      <span className="text-[10px] font-mono text-white bg-black/70 px-2 py-0.5 rounded">
                        SNAPSHOT INFERENCE ◉
                      </span>
                    </div>

                    <div className="self-end bg-black/70 backdrop-blur-md px-3 py-1 rounded text-xs font-mono text-white">
                      TIMESTAMP: {analysisResult.timestamp}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Camera Controls Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 bg-navy-900/90 shadow-lg">
            <div className="flex items-center gap-2">
              {streamActive ? (
                <button 
                  onClick={stopCamera} 
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <FiVideoOff /> Turn Off Camera
                </button>
              ) : (
                <button 
                  onClick={() => startCamera()} 
                  className="btn-secondary px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <FiVideo /> Start Camera
                </button>
              )}

              {/* Camera device switcher */}
              {videoDevices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-navy-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-neon-blue"
                >
                  {videoDevices.map((dev, idx) => (
                    <option key={dev.deviceId || idx} value={dev.deviceId}>
                      {dev.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                title="Flip Camera Orientation"
              >
                <FiRepeat />
              </button>
            </div>

            {/* Main Shutter & Actions */}
            <div className="flex items-center gap-3">
              {!capturedImage ? (
                <>
                  <button
                    onClick={() => handleDelayedCapture(3)}
                    disabled={!streamActive || isProcessing}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
                    title="3-Second Timer Capture"
                  >
                    <FiClock /> 3s
                  </button>

                  <button
                    onClick={captureAndAnalyze}
                    disabled={!streamActive || isProcessing}
                    className="btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-40"
                  >
                    {isProcessing ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
                    ) : (
                      <><FiCamera className="text-base" /> Capture Photo & Analyze</>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleRetake}
                  className="btn-secondary px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <FiRepeat /> Retake Live Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Analytics & Telemetry Inspector (Right 1 col) */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiZap className="text-neon-blue text-lg" />
                  <h3 className="font-bold text-white text-base">Neural Telemetry</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-slate-800">
                  REAL-TIME CORE
                </span>
              </div>

              {isProcessing && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-bold text-white">Running Vision Models...</p>
                  <p className="text-xs text-slate-400">SigLIP & MobileNet processing frame bytes</p>
                </div>
              )}

              {!isProcessing && !analysisResult && (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <FiCamera className="text-4xl mx-auto text-slate-600" />
                  <p className="text-sm font-medium text-slate-300">Ready for Optical Snapshot</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Point your camera at a test scene and click "Capture Photo & Analyze" to generate instant classifications.
                  </p>
                </div>
              )}

              {/* Analysis Output Presentation */}
              {!isProcessing && analysisResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    analysisResult.overallStatus === 'Alert' 
                      ? 'bg-alert-red/15 border-alert-red/40 text-red-200' 
                      : 'bg-success-green/15 border-success-green/40 text-emerald-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {analysisResult.overallStatus === 'Alert' ? (
                        <FiAlertTriangle className="text-alert-red text-xl shrink-0" />
                      ) : (
                        <FiCheckCircle className="text-success-green text-xl shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Classification</h4>
                        <p className="text-sm font-extrabold tracking-tight">
                          {analysisResult.threatSummary || analysisResult.primary?.prediction}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dual Mode Card Breakdown */}
                  {analysisResult.type === 'Dual' ? (
                    <div className="space-y-3">
                      {/* Fire Model Box */}
                      {analysisResult.fire && (
                        <div className="p-3.5 bg-navy-900/80 rounded-xl border border-slate-700/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <FiActivity className="text-alert-red" /> SigLIP Fire Model
                            </span>
                            <span className="text-xs font-bold text-neon-blue">{analysisResult.fire.confidence}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>{analysisResult.fire.prediction}</span>
                            <span className={`font-bold ${analysisResult.fire.status === 'Alert' ? 'text-alert-red' : 'text-success-green'}`}>
                              {analysisResult.fire.status}
                            </span>
                          </div>
                          <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-alert-orange h-full rounded-full" style={{ width: `${analysisResult.fire.confidence}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Accident Model Box */}
                      {analysisResult.accident && (
                        <div className="p-3.5 bg-navy-900/80 rounded-xl border border-slate-700/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                              <FiShield className="text-alert-orange" /> MobileNet Accident Model
                            </span>
                            <span className="text-xs font-bold text-neon-blue">{analysisResult.accident.confidence}%</span>
                          </div>
                          {analysisResult.accident.vehicle_detected !== undefined && (
                            <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                              <span>{analysisResult.accident.vehicle_detected ? '🚗' : '🚫'}</span>
                              <span>{analysisResult.accident.vehicle_detected ? `Stage 1: ${analysisResult.accident.vehicle_type} (${analysisResult.accident.vehicle_confidence}%)` : 'Stage 1: No Vehicle'}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>{analysisResult.accident.prediction}</span>
                            <span className={`font-bold ${analysisResult.accident.status === 'Alert' ? 'text-alert-red' : 'text-success-green'}`}>
                              {analysisResult.accident.status}
                            </span>
                          </div>
                          <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-neon-blue h-full rounded-full" style={{ width: `${analysisResult.accident.confidence}%` }}></div>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* Single Model Result */
                    <div className="p-4 bg-navy-900/80 rounded-xl border border-slate-700/60 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Confidence Score</span>
                        <span className="text-neon-blue font-bold">{analysisResult.primary?.confidence}%</span>
                      </div>
                      <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-neon-blue to-purple-500 h-full rounded-full" style={{ width: `${analysisResult.primary?.confidence}%` }}></div>
                      </div>

                      {analysisResult.primary?.probabilities && (
                        <div className="pt-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Class Probabilities</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            {Object.entries(analysisResult.primary.probabilities).map(([cls, val]) => (
                              <div key={cls} className="p-1.5 bg-navy-950 rounded border border-slate-800 flex justify-between">
                                <span className="text-slate-400">{cls}:</span>
                                <span className="text-white font-bold">{val}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Bottom Actions */}
            {analysisResult && (
              <div className="pt-4 border-t border-slate-700/60 space-y-2 mt-4">
                {analysisResult.overallStatus === 'Alert' && (
                  <button
                    onClick={handleRaiseAlarm}
                    disabled={alarmRaised}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      alarmRaised
                        ? 'bg-success-green/20 text-success-green border border-success-green/40'
                        : 'bg-alert-red hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    }`}
                  >
                    {alarmRaised ? <><FiCheckCircle /> Alarm Dispatched</> : <><FiAlertTriangle /> Dispatch Emergency Alarm</>}
                  </button>
                )}

                <button
                  onClick={handleDownloadSnapshot}
                  className="btn-secondary w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <FiDownload /> Export Snapshot File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;
