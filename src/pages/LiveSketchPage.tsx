import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CameraOff, 
  Download, 
  Sliders, 
  Image as ImageIcon, 
  ArrowLeft, 
  Zap, 
  Sparkles,
  Maximize2,
  RotateCcw,
  Settings2,
  Circle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveSketchPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Sketch Parameters
  const [softness, setSoftness] = useState(5);
  const [detail, setDetail] = useState(1.0);
  const [contrast, setContrast] = useState(1.2);
  const [exposure, setExposure] = useState(1.1);
  const [isColorMode, setIsColorMode] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
        };
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied. Please check your permissions.");
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.paused || video.ended) return;

    // Maintain aspect ratio and high resolution
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    const { width, height } = canvas;

    // 1. Draw original frame (Mirrored if set)
    ctx.save();
    if (isMirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    // 2. Capture color data for mixed media mode
    let colorData: ImageData | null = null;
    if (isColorMode) {
      colorData = ctx.getImageData(0, 0, width, height);
    }

    // 3. Convert to Grayscale
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);

    // 4. Create Inverted & Blurred Layer
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      // Draw grayscale to temp
      tempCtx.drawImage(canvas, 0, 0);
      
      // Invert temp
      tempCtx.globalCompositeOperation = 'difference';
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, width, height);
      
      // Apply Sketch Blend
      ctx.save();
      ctx.globalCompositeOperation = 'color-dodge';
      // The magic combination: blur for softness, contrast for detail
      ctx.filter = `blur(${softness}px) contrast(${1 + detail})`;
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();

      // 5. Apply Global Adjustments
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.filter = `contrast(${contrast}) brightness(${exposure})`;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 6. Mixed Media Mode
      if (isColorMode && colorData) {
        const sketchData = ctx.getImageData(0, 0, width, height);
        const sData = sketchData.data;
        const cData = colorData.data;
        
        for (let i = 0; i < sData.length; i += 4) {
          // Multiply blend: (sketch * color) / 255
          sData[i] = (sData[i] * cData[i]) / 255;
          sData[i+1] = (sData[i+1] * cData[i+1]) / 255;
          sData[i+2] = (sData[i+2] * cData[i+2]) / 255;
        }
        ctx.putImageData(sketchData, 0, 0);
      }
    }

    // 7. Professional Camera Overlays
    drawCameraUI(ctx, width, height);

    if (isActive) {
      requestAnimationFrame(processFrame);
    }
  }, [isActive, softness, detail, contrast, exposure, isColorMode, isMirrored]);

  const drawCameraUI = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    // Corner Brackets
    const bSize = 40;
    const bThick = 2;
    const bOffset = 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = bThick;

    // Top Left
    ctx.beginPath();
    ctx.moveTo(bOffset, bOffset + bSize);
    ctx.lineTo(bOffset, bOffset);
    ctx.lineTo(bOffset + bSize, bOffset);
    ctx.stroke();

    // Top Right
    ctx.beginPath();
    ctx.moveTo(width - bOffset - bSize, bOffset);
    ctx.lineTo(width - bOffset, bOffset);
    ctx.lineTo(width - bOffset, bOffset + bSize);
    ctx.stroke();

    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(bOffset, height - bOffset - bSize);
    ctx.lineTo(bOffset, height - bOffset);
    ctx.lineTo(bOffset + bSize, height - bOffset);
    ctx.stroke();

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(width - bOffset - bSize, height - bOffset);
    ctx.lineTo(width - bOffset, height - bOffset);
    ctx.lineTo(width - bOffset, height - bOffset - bSize);
    ctx.stroke();

    // Center Crosshair
    ctx.beginPath();
    ctx.moveTo(width/2 - 10, height/2);
    ctx.lineTo(width/2 + 10, height/2);
    ctx.moveTo(width/2, height/2 - 10);
    ctx.lineTo(width/2, height/2 + 10);
    ctx.stroke();

    // Status Indicators
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    
    // Top Left Info
    ctx.fillText('REC ●', bOffset, bOffset - 10);
    ctx.fillText('4K 60FPS', bOffset, bOffset - 25);

    // Top Right Info
    ctx.textAlign = 'right';
    ctx.fillText('ISO 400', width - bOffset, bOffset - 10);
    ctx.fillText('1/125', width - bOffset, bOffset - 25);

    // Bottom Info
    ctx.textAlign = 'center';
    ctx.fillText(`SOFT: ${softness} | DET: ${detail.toFixed(1)} | EXP: ${exposure.toFixed(1)}`, width/2, height - bOffset + 20);

    ctx.restore();
  };

  useEffect(() => {
    if (isActive) {
      const frameId = requestAnimationFrame(processFrame);
      return () => cancelAnimationFrame(frameId);
    }
  }, [isActive, processFrame]);

  const handleCapture = () => {
    if (!canvasRef.current) return;
    setIsCapturing(true);
    
    // Flash effect
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `sketch-studio-${Date.now()}.png`;
      link.href = canvasRef.current!.toDataURL('image/png', 1.0);
      link.click();
      setIsCapturing(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-gold/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <Link to="/dashboard" className="group flex items-center space-x-3 text-white/60 hover:text-white transition-all">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Atelier</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {isActive ? 'Studio Active' : 'Standby'}
            </span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12 items-start">
          
          {/* Viewport Section */}
          <div className="space-y-8">
            <header className="flex items-end justify-between">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-6xl md:text-8xl font-serif font-bold tracking-tighter leading-none"
                >
                  Sketch <span className="text-gold italic">Studio.</span>
                </motion.h1>
                <p className="mt-4 text-white/40 font-light italic text-lg max-w-xl">
                  High-fidelity neural graphite study. Real-time pencil rendering with professional studio controls.
                </p>
              </div>
            </header>

            <div className="relative aspect-video rounded-[40px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl group">
              <video ref={videoRef} className="hidden" playsInline muted />
              
              <canvas 
                ref={canvasRef} 
                className={`w-full h-full object-cover transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Flash Effect */}
              <AnimatePresence>
                {isCapturing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-50"
                  />
                )}
              </AnimatePresence>

              {/* Standby State */}
              {!isActive && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center text-white/20 mb-8"
                  >
                    <Camera size={48} strokeWidth={1} />
                  </motion.div>
                  <button 
                    onClick={startCamera}
                    className="px-12 py-5 bg-gold text-black rounded-full font-bold text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-gold/20"
                  >
                    Initialize Studio
                  </button>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl p-12 text-center">
                  <CameraOff size={64} className="text-red-500 mb-6" />
                  <h3 className="text-2xl font-serif font-bold mb-2">Access Denied</h3>
                  <p className="text-white/40 max-w-md mb-8">{error}</p>
                  <button 
                    onClick={startCamera}
                    className="px-10 py-4 border border-red-500 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Viewport HUD */}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="glass px-4 py-2 rounded-full border border-white/10 flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Studio Live</span>
                    </div>
                    <div className="flex space-x-4 pointer-events-auto">
                      <button 
                        onClick={() => setIsMirrored(!isMirrored)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${isMirrored ? 'bg-white text-black border-white' : 'glass text-white/60 border-white/10'}`}
                        title="Mirror View"
                      >
                        <RotateCcw size={20} />
                      </button>
                      <button 
                        onClick={() => setShowControls(!showControls)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${showControls ? 'bg-gold text-black border-gold' : 'glass text-white/60 border-white/10'}`}
                        title="Studio Controls"
                      >
                        <Settings2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center pointer-events-auto">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCapture}
                      className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center group relative"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/10 group-hover:bg-white/20 transition-all flex items-center justify-center">
                        <Circle size={40} className="fill-white" />
                      </div>
                      <div className="absolute -bottom-12 text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all">
                        Capture Study
                      </div>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Sidebar */}
          <aside className="space-y-8">
            <div className="glass p-10 rounded-[40px] border border-white/5 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold">Studio <span className="text-gold italic">Params</span></h3>
                <button 
                  onClick={stopCamera}
                  className="text-white/20 hover:text-red-500 transition-colors"
                  title="Shutdown Studio"
                >
                  <CameraOff size={20} />
                </button>
              </div>

              {/* Control Groups */}
              <div className="space-y-8">
                {/* Rendering Mode */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Rendering Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setIsColorMode(false)}
                      className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${!isColorMode ? 'bg-white text-black border-white' : 'border-white/10 text-white/40'}`}
                    >
                      Graphite
                    </button>
                    <button 
                      onClick={() => setIsColorMode(true)}
                      className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${isColorMode ? 'bg-gold text-black border-gold' : 'border-white/10 text-white/40'}`}
                    >
                      Mixed Media
                    </button>
                  </div>
                </div>

                {/* Sliders */}
                {[
                  { label: 'Sketch Softness', value: softness, setter: setSoftness, min: 1, max: 20, step: 1, unit: 'px' },
                  { label: 'Edge Detail', value: detail, setter: setDetail, min: 0, max: 3, step: 0.1, unit: 'x' },
                  { label: 'Contrast', value: contrast, setter: setContrast, min: 0.5, max: 3, step: 0.1, unit: 'x' },
                  { label: 'Exposure', value: exposure, setter: setExposure, min: 0.5, max: 2, step: 0.1, unit: 'x' },
                ].map((slider) => (
                  <div key={slider.label} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{slider.label}</label>
                      <span className="text-xs font-mono text-gold">{slider.value}{slider.unit}</span>
                    </div>
                    <input 
                      type="range" 
                      min={slider.min} max={slider.max} step={slider.step}
                      value={slider.value}
                      onChange={(e) => slider.setter(Number(e.target.value))}
                      className="w-full accent-gold h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-6 border-top border-white/5">
                <button 
                  onClick={handleCapture}
                  disabled={!isActive}
                  className="w-full py-5 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <Download size={18} />
                  <span>Export Study</span>
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="glass p-6 rounded-3xl border border-white/5 flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 uppercase tracking-wider">Neural Engine</h4>
                  <p className="text-xs text-white/40 leading-relaxed">Color Dodge blending for authentic graphite study textures.</p>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl border border-white/5 flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Maximize2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 uppercase tracking-wider">High Fidelity</h4>
                  <p className="text-xs text-white/40 leading-relaxed">Full resolution 4K capture with professional studio overlays.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
