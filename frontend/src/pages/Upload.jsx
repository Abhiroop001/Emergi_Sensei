import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiImage, FiCheckCircle } from 'react-icons/fi';

const Upload = () => {
  const [detectionType, setDetectionType] = useState('Fire');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const endpoint = detectionType === 'Fire' ? `${apiUrl}/firemodel/` : `${apiUrl}/accidentmodel/`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          class: data.prediction,
          confidence: 94.5, // Mock confidence until backend supports it
          status: data.prediction.includes('Normal') ? 'Safe' : 'Alert'
        });
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Manual Image Detection</h2>
        <p className="text-slate-400 mb-8">Upload an image to run it through our classification models.</p>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setDetectionType('Fire')}
            className={`flex-1 py-3 rounded-lg border transition-all ${
              detectionType === 'Fire' 
                ? 'bg-alert-red/10 border-alert-red text-alert-red' 
                : 'bg-navy-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            Fire Classification
          </button>
          <button 
            onClick={() => setDetectionType('Accident')}
            className={`flex-1 py-3 rounded-lg border transition-all ${
              detectionType === 'Accident' 
                ? 'bg-alert-orange/10 border-alert-orange text-alert-orange' 
                : 'bg-navy-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            Accident Classification
          </button>
        </div>

        <div 
          className="border-2 border-dashed border-slate-600 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-neon-blue hover:bg-neon-blue/5 transition-all cursor-pointer relative overflow-hidden"
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          {previewUrl ? (
             <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          ) : null}
          <FiUploadCloud className="text-5xl text-slate-500 mb-4 relative z-20" />
          <h3 className="text-xl font-medium text-white mb-2 relative z-20">
            {selectedFile ? selectedFile.name : 'Drag & Drop your image here'}
          </h3>
          <p className="text-sm text-slate-400 relative z-20">or click to browse from your computer (JPG, PNG)</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary flex items-center gap-2"
          >
            {isUploading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
            ) : (
              <><FiImage /> Analyze Image</>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-8"
          >
            <div className="w-full md:w-1/2 aspect-video bg-navy-900 rounded-lg overflow-hidden relative">
              <img 
                src={previewUrl || (detectionType === 'Fire' ? "https://images.unsplash.com/photo-1599939678854-3e9a59441113?w=600&auto=format&fit=crop" : "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop")} 
                alt="Analyzed" 
                className="w-full h-full object-cover"
              />
              {result.status === 'Alert' && (
                <div className="absolute top-1/4 left-1/3 w-1/3 h-1/3 border-2 border-alert-red bg-alert-red/20"></div>
              )}
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <FiCheckCircle className="text-success-green text-xl" />
                <span className="text-slate-300 font-medium">Analysis Complete</span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-2">{result.class}</h3>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Confidence Score</span>
                  <span className="text-neon-blue font-bold">{result.confidence}%</span>
                </div>
                <div className="w-full bg-navy-900 rounded-full h-2.5">
                  <div className="bg-neon-blue h-2.5 rounded-full" style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="btn-secondary flex-1">Download Report</button>
                <button className="bg-alert-red hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors flex-1">Raise Alarm</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Upload;
