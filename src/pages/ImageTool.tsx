import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Image as ImageIcon, Sparkles, RotateCw, RotateCcw, 
  Trash2, Scissors, Wand2, Download, Save, Check, X, 
  Loader2, Zap, History, ArrowRight, AlertCircle, Camera
} from 'lucide-react';
import { TOON_STYLES, ToonStyle } from '../types';
import { transformImage, removeBackground, setAiEngine, getAiEngine } from '../services/aiService';
import { useAuth } from '../AuthContext';
import confetti from 'canvas-confetti';

export const ImageTool: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<ToonStyle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isLocalEngine, setIsLocalEngine] = useState(getAiEngine());
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isCropping, setIsCropping] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setOriginalImage(reader.result as string);
      setTransformedImage(null);
      setRotation(0);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      setImage(canvas.toDataURL('image/png'));
      setIsCropping(false);
      setCrop(undefined);
    }
  };

  const handleRotate = (dir: 'cw' | 'ccw') => {
    setRotation(prev => (dir === 'cw' ? prev + 90 : prev - 90));
  };

  const handleRemoveBg = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Removing background...');
    try {
      const result = await removeBackground(image);
      setImage(result);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#10B981']
      });
    } catch (err) {
      setError("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleToonify = async () => {
    if (!image || !selectedStyle) return;
    setIsProcessing(true);
    setError(null);
    setProcessingStatus(isLocalEngine ? 'Applying local filters...' : 'Generating AI masterpiece...');
    try {
      setAiEngine(isLocalEngine);
      const result = await transformImage(image, selectedStyle.prompt, "image/png", selectedStyle.id);
      setTransformedImage(result);
      
      // Sync local engine state in case it auto-switched due to quota
      setIsLocalEngine(getAiEngine());
      
      // Auto-save to history
      handleSave(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#8B5CF6', '#D946EF']
      });
    } catch (err: any) {
      setError(err.message || "AI transformation failed. Please try a different style.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDownload = async () => {
    if (!transformedImage) return;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = transformedImage;
    link.download = `ai-transform-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Auto-save to history
    handleSave(true);
  };

  const handleSave = async (silent = false) => {
    if (!user || !transformedImage || !selectedStyle) return;
    try {
      const res = await fetch('/api/transformations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'image',
          originalUrl: originalImage,
          transformedUrl: transformedImage,
          style: selectedStyle.name,
          styleDescription: selectedStyle.description,
          config: { 
            rotation, 
            styleId: selectedStyle.id,
            prompt: selectedStyle.prompt
          }
        }),
      });
      if (res.ok && !silent) {
        alert("Saved to history!");
      }
    } catch (err) {
      console.error("Error saving transformation:", err);
    }
  };

  const reset = () => {
    setImage(null);
    setOriginalImage(null);
    setTransformedImage(null);
    setSelectedStyle(null);
    setRotation(0);
    setError(null);
    setShowWebcam(false);
  };

  useEffect(() => {
    if (showWebcam && videoRef.current && !videoRef.current.srcObject) {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Webcam error:", err);
          setError("Could not access webcam.");
          setShowWebcam(false);
        }
      };
      startStream();
    }
  }, [showWebcam]);

  const startWebcam = () => {
    setShowWebcam(true);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setImage(dataUrl);
        setOriginalImage(dataUrl);
        stopWebcam();
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowWebcam(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="p-3 glass rounded-2xl text-gold border border-gold/20 shadow-lg shadow-gold/5">
            <ImageIcon size={28} />
          </div>
          <h1 className="text-5xl font-serif font-bold text-white tracking-tight">Visual Atelier</h1>
        </motion.div>
        <p className="text-white/40 text-xl max-w-2xl font-light italic leading-relaxed">
          Transform your visuals into ethereal masterpieces. Upload your canvas, refine the composition, and apply our exclusive artistic intelligence models.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-16">
        
        {/* Left Panel: Editor & Preview */}
        <div className="lg:col-span-8 space-y-8">
          {!image ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              {...getRootProps()}
              className={`aspect-video rounded-[60px] border-2 border-dashed transition-all flex flex-col items-center justify-center p-16 text-center cursor-pointer group ${
                isDragActive ? 'border-gold bg-gold/5' : 'border-white/10 bg-white/[0.02] hover:border-gold/30 hover:bg-white/[0.04]'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-28 h-28 glass rounded-[40px] flex items-center justify-center text-gold mb-10 group-hover:scale-110 transition-transform duration-700 border border-white/10 shadow-2xl shadow-gold/5">
                <Upload size={44} />
              </div>
              <h2 className="text-4xl font-serif font-bold text-white mb-4">Present your visual</h2>
              <p className="text-white/30 max-w-sm text-lg font-light italic leading-relaxed mb-8">
                Drag and drop your canvas or select a file to begin the transformation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); startWebcam(); }}
                  className="px-8 py-4 glass-gold text-gold rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-gold/20 hover:bg-gold/10 flex items-center space-x-3 transition-all"
                >
                  <Camera size={18} />
                  <span>Live Capture</span>
                </button>
                <div className="hidden sm:block text-white/10 text-[10px] font-bold uppercase tracking-[0.2em]">or</div>
                <div className="px-8 py-4 glass text-white/60 rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-white/10 group-hover:border-gold/30 transition-all">
                  Browse Files
                </div>
              </div>

              <div className="mt-10 flex items-center space-x-3 text-[10px] font-bold text-gold bg-gold/10 px-6 py-2.5 rounded-full border border-gold/20 uppercase tracking-[0.2em]">
                <Zap size={14} />
                <span>Morphlume Intelligence Active</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[60px] shadow-2xl shadow-black/50 overflow-hidden border border-white/5 relative"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gold border border-white/10 shadow-lg shadow-gold/5">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <span className="block font-serif font-bold text-white text-lg">
                      Visual Canvas
                    </span>
                    <span className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">
                      {selectedStyle ? selectedStyle.name : 'Awaiting Model Selection'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={reset} 
                  className="p-4 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                  title="Discard visual"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              <div className="relative bg-[#050505] flex items-center justify-center overflow-hidden min-h-[500px]">
                <AnimatePresence mode="wait">
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-12 text-center"
                    >
                      <Loader2 size={40} className="animate-spin mb-4 text-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{processingStatus}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                  className="transition-transform duration-700 ease-out py-12"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {isCropping ? (
                    <div className="relative">
                      <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                      >
                        <img
                          ref={imgRef}
                          src={image}
                          alt="Editor"
                          className="max-h-[70vh] w-auto object-contain shadow-2xl grayscale"
                          referrerPolicy="no-referrer"
                        />
                      </ReactCrop>
                      <div className="absolute top-6 right-6 z-50 flex space-x-3">
                        <motion.button 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={handleCropComplete}
                          className="px-8 py-4 bg-gold text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-gold-light flex items-center space-x-2"
                        >
                          <Check size={18} />
                          <span>Apply Refinement</span>
                        </motion.button>
                        <motion.button 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={() => { setIsCropping(false); setCrop(undefined); }}
                          className="px-8 py-4 glass text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 flex items-center space-x-2"
                        >
                          <X size={18} />
                          <span>Cancel</span>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <img
                      ref={imgRef}
                      src={image}
                      alt="Editor"
                      className="max-h-[70vh] w-auto object-contain shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              <div className="p-12 bg-transparent">
                {transformedImage ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <button 
                      onClick={handleDownload}
                      className="w-full sm:w-auto px-12 py-6 bg-gold text-black rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-gold-light shadow-2xl shadow-gold/20 flex items-center justify-center space-x-3 transition-all"
                    >
                      <Download size={24} />
                      <span>Acquire Masterpiece</span>
                    </button>
                    <button 
                      onClick={() => setTransformedImage(null)}
                      className="w-full sm:w-auto px-12 py-6 glass text-white border border-white/10 rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-white/10 flex items-center justify-center space-x-3 transition-all"
                    >
                      <Trash2 size={24} />
                      <span>Discard Result</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-full mb-12">
                      <div className="p-10 rounded-[40px] glass border border-white/5">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-4 text-gold">
                            <Scissors size={28} />
                            <h3 className="text-2xl font-serif font-bold text-white">Refinement Suite</h3>
                          </div>
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                            Phase I: Composition
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                          <motion.button 
                            whileHover={{ y: -5 }}
                            onClick={() => setIsCropping(true)} 
                            className="flex flex-col items-center justify-center p-8 glass border border-white/5 rounded-[32px] group transition-all hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5"
                          >
                            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform border border-white/10">
                              <Scissors size={28} />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-[0.1em]">Refine Focus</span>
                            <span className="text-[10px] text-white/30 font-light italic mt-1">Crop & Scale</span>
                          </motion.button>

                          <motion.button 
                            whileHover={{ y: -5 }}
                            onClick={() => handleRotate('ccw')} 
                            className="flex flex-col items-center justify-center p-8 glass border border-white/5 rounded-[32px] group transition-all hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5"
                          >
                            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform border border-white/10">
                              <RotateCcw size={28} />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-[0.1em]">Rotate Left</span>
                            <span className="text-[10px] text-white/30 font-light italic mt-1">-90 Degrees</span>
                          </motion.button>

                          <motion.button 
                            whileHover={{ y: -5 }}
                            onClick={() => handleRotate('cw')} 
                            className="flex flex-col items-center justify-center p-8 glass border border-white/5 rounded-[32px] group transition-all hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5"
                          >
                            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform border border-white/10">
                              <RotateCw size={28} />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-[0.1em]">Rotate Right</span>
                            <span className="text-[10px] text-white/30 font-light italic mt-1">+90 Degrees</span>
                          </motion.button>

                          <motion.button 
                            whileHover={{ y: -5 }}
                            onClick={handleRemoveBg} 
                            className="flex flex-col items-center justify-center p-8 glass border border-white/5 rounded-[32px] group transition-all hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5"
                          >
                            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform border border-white/10">
                              <Wand2 size={28} />
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-[0.1em]">Isolate Subject</span>
                            <span className="text-[10px] text-white/30 font-light italic mt-1">AI Extraction</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    {!selectedStyle ? (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 glass rounded-full flex items-center justify-center text-white/10 border border-white/5">
                          <ArrowRight size={40} />
                        </div>
                        <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-xs italic">Select an Intelligence Model to proceed</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-8 w-full">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleToonify}
                          disabled={isProcessing}
                          className="w-full px-12 py-8 bg-gold text-black rounded-full font-bold text-2xl uppercase tracking-[0.2em] hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 flex items-center justify-center space-x-4 disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
                          <span>Execute Transformation</span>
                        </motion.button>
                        
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] text-center">
                          Your visual will be processed using the {selectedStyle.name} intelligence model.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {transformedImage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 glass text-white rounded-[60px] space-y-10 shadow-2xl shadow-black/50 border border-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gold">
                  <Sparkles size={28} />
                  <h3 className="text-3xl font-serif font-bold text-white">The Masterpiece</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleDownload}
                    className="p-3 glass hover:bg-white/10 rounded-full transition-colors border border-white/10 text-gold"
                  >
                    <Download size={24} />
                  </button>
                  <button 
                    onClick={() => setTransformedImage(null)}
                    className="p-3 glass hover:bg-white/10 rounded-full transition-colors border border-white/10 text-white/20"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className="aspect-video rounded-[40px] overflow-hidden bg-[#050505] border border-white/5 shadow-2xl flex items-center justify-center">
                <img 
                  src={transformedImage} 
                  alt="Transformed" 
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <p className="text-lg text-white/40 leading-relaxed font-light italic text-center">
                Your visual has been elevated using the <span className="font-bold text-gold not-italic">{selectedStyle?.name}</span> model.
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 glass border border-red-500/20 text-red-400 rounded-[60px] flex items-start space-x-8"
            >
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center shrink-0 shadow-lg border border-red-500/10">
                <AlertCircle size={36} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-2xl mb-3 text-white">Intelligence Interruption</h4>
                <p className="text-red-400/60 leading-relaxed font-light italic text-lg">{error}</p>
                {error.toLowerCase().includes('quota') && (
                  <div className="mt-8 p-8 glass rounded-[32px] border border-white/5">
                    <p className="text-sm text-white/40 mb-6 font-light leading-relaxed">
                      The high-fidelity intelligence models are currently at capacity. We have activated the <strong className="text-gold">LITE Atelier</strong> to ensure your creative flow remains uninterrupted.
                    </p>
                    <button 
                      onClick={() => { setIsLocalEngine(true); setError(null); }}
                      className="text-[10px] font-bold text-gold hover:text-gold-light uppercase tracking-[0.3em] transition-colors"
                    >
                      Activate Lite Atelier Now
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setError(null)}
                  className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors block"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel: Styles Selection */}
        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-widest">Intelligence Models</h2>
              <div className="flex flex-col items-end space-y-3">
                <div className="flex glass p-1.5 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setIsLocalEngine(true)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${isLocalEngine ? 'bg-gold text-black shadow-lg' : 'text-white/20'}`}
                  >
                    LITE
                  </button>
                  <button 
                    onClick={() => setIsLocalEngine(false)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${!isLocalEngine ? 'bg-gold text-black shadow-lg' : 'text-white/20'}`}
                  >
                    PRO
                  </button>
                </div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                  {TOON_STYLES.length} Available Models
                </span>
              </div>
            </div>
            
            <div className="space-y-6 max-h-[calc(100vh-350px)] overflow-y-auto pr-4 custom-scrollbar">
              {TOON_STYLES.map((style, idx) => (
                <motion.button
                  key={style.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedStyle(style)}
                  className={`w-full text-left p-6 rounded-[40px] border transition-all flex items-center space-x-6 group relative overflow-hidden ${
                    selectedStyle?.id === style.id 
                      ? 'border-gold/40 bg-gold/5 shadow-2xl shadow-gold/5' 
                      : 'border-white/5 glass hover:border-gold/20 hover:bg-white/5'
                  }`}
                >
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0">
                    <img 
                      src={style.previewUrl} 
                      alt={style.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-serif font-bold mb-1 ${selectedStyle?.id === style.id ? 'text-gold' : 'text-white'}`}>
                      {style.name}
                    </h3>
                    <p className="text-xs text-white/30 line-clamp-2 leading-relaxed font-light italic">
                      {style.description}
                    </p>
                  </div>
                  {selectedStyle?.id === style.id && (
                    <motion.div 
                      layoutId="active-check"
                      className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black shadow-xl shadow-gold/20"
                    >
                      <Check size={20} strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>


          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWebcam && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="max-w-4xl w-full glass rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gold border border-gold/20">
                    <Camera size={20} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white tracking-tight">Live Neural Capture</h3>
                </div>
                <button 
                  onClick={stopWebcam}
                  className="p-3 text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border border-gold/20 rounded-full" />
                </div>
              </div>

              <div className="p-10 flex flex-col items-center gap-6">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-gold rounded-full flex items-center justify-center text-black shadow-2xl shadow-gold/20 hover:scale-110 transition-transform group"
                >
                  <div className="w-16 h-16 border-4 border-black/10 rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                    <div className="w-12 h-12 bg-black rounded-full" />
                  </div>
                </button>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">Capture Visual Frame</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
