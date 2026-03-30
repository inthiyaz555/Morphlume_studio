import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Video, Sparkles, Trash2, Download, Save, 
  Check, Loader2, Play, Info, AlertCircle, ArrowRight,
  Layers, Wand2, History, Zap, Camera, X, Square
} from 'lucide-react';
import { TOON_STYLES, ToonStyle } from '../types';
import { transformVideo, transformImage, setAiEngine, getAiEngine } from '../services/aiService';
import { useAuth } from '../AuthContext';
import confetti from 'canvas-confetti';

export const VideoTool: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState<string | null>(null);
  const [transformedVideoUrl, setTransformedVideoUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ToonStyle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [freeAnimationFrames, setFreeAnimationFrames] = useState<string[]>([]);
  const [isGeneratingFreeAnimation, setIsGeneratingFreeAnimation] = useState(false);
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
  const [hasKey, setHasKey] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isLocalEngine, setIsLocalEngine] = useState(getAiEngine());
  const [isDownloading, setIsDownloading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [frameCount, setFrameCount] = useState(5);
  const [animationSpeed, setAnimationSpeed] = useState(500); // ms per frame
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [showComparison, setShowComparison] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateVideoFromFrames = async (frames: string[], speed: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (frames.length === 0) return reject("No frames to generate video");

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Calculate FPS based on animation speed (ms per frame)
        const fps = Math.max(1, Math.round(1000 / speed));
        const stream = canvas.captureStream(fps);
        
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }

        try {
          const recorder = new MediaRecorder(stream, { 
            mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
            videoBitsPerSecond: 2500000 // 2.5 Mbps
          });
          
          const chunks: Blob[] = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: recorder.mimeType });
            resolve(URL.createObjectURL(blob));
          };

          recorder.start();

          let frameIdx = 0;
          const frameDuration = speed; 

          const processFrame = () => {
            if (frameIdx >= frames.length) {
              // Add a small delay to ensure the last frame is recorded
              setTimeout(() => recorder.stop(), 500);
              return;
            }

            const frameImg = new Image();
            frameImg.crossOrigin = "anonymous";
            frameImg.onload = () => {
              ctx.fillStyle = 'black';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(frameImg, 0, 0);
              frameIdx++;
              setTimeout(processFrame, frameDuration);
            };
            frameImg.onerror = () => reject("Failed to load frame image");
            frameImg.src = frames[frameIdx];
          };

          processFrame();
        } catch (e) {
          reject("MediaRecorder error: " + e);
        }
      };
      img.onerror = () => reject("Failed to load initial frame");
      img.src = frames[0];
    });
  };

  // Check for API key on mount
  React.useEffect(() => {
    const checkKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio?.hasSelectedApiKey) {
        const selected = await aiStudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio?.openSelectKey) {
      await aiStudio.openSelectKey();
      setHasKey(true);
    }
  };

  // Animation loop for free sequence
  React.useEffect(() => {
    if (freeAnimationFrames.length > 0) {
      const interval = setInterval(() => {
        setCurrentAnimationFrame(prev => (prev + 1) % freeAnimationFrames.length);
      }, animationSpeed); 
      return () => clearInterval(interval);
    }
  }, [freeAnimationFrames, animationSpeed]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const url = URL.createObjectURL(file);
    setVideo(url);
    setTransformedVideoUrl(null);
    setError(null);
    
    // Set default trim to first 5 seconds or video duration
    const v = document.createElement('video');
    v.src = url;
    v.onloadedmetadata = () => {
      setEndTime(Math.min(v.duration, 5));
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false
  } as any);

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    
    // Ensure video is ready
    if (videoRef.current.readyState < 2) {
      console.warn("Video not ready for frame capture");
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  };

  const handlePreviewFrame = async () => {
    if (!selectedStyle) return;
    setIsPreviewing(true);
    setError(null);
    
    try {
      const frameBase64 = captureFrame();
      if (!frameBase64) throw new Error("Could not capture video frame");
      
      setAiEngine(isLocalEngine);
      const prompt = `Transform this image into a ${selectedStyle.name} style. ${selectedStyle.description}.`;
      const result = await transformImage(frameBase64, prompt, "image/png", selectedStyle.id);
      setPreviewImageUrl(result);
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#A855F7', '#EC4899']
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate view. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleFreeAnimation = async () => {
    if (!video || !selectedStyle || !videoRef.current) return;
    setIsGeneratingFreeAnimation(true);
    setFreeAnimationFrames([]);
    setError(null);
    
    try {
      const frames: string[] = [];
      const duration = endTime - startTime;
      const step = duration / (frameCount - 1);
      
      for (let i = 0; i < frameCount; i++) {
        setProcessingStatus(`Capturing frame ${i + 1}/${frameCount}...`);
        
        // Seek to timestamp within trim range
        videoRef.current.currentTime = startTime + (i * step);
        
        // Wait for seeked event
        await new Promise((resolve) => {
          const onSeeked = () => {
            videoRef.current?.removeEventListener('seeked', onSeeked);
            resolve(true);
          };
          videoRef.current?.addEventListener('seeked', onSeeked);
          // Fallback if seeked doesn't fire
          setTimeout(resolve, 800); // Slightly longer for stability
        });

        const frameBase64 = captureFrame();
        if (frameBase64) {
          setProcessingStatus(`Toonifying frame ${i + 1}/${frameCount}...`);
          setAiEngine(isLocalEngine);
          const prompt = `Transform this image into a ${selectedStyle.name} style. ${selectedStyle.description}.`;
          const result = await transformImage(frameBase64, prompt, "image/png", selectedStyle.id);
          frames.push(result);
          // Update frames progressively for better UX
          setFreeAnimationFrames([...frames]);
          
          // Sync local engine state in case it auto-switched due to quota
          setIsLocalEngine(getAiEngine());
        }
      }
      
      // Auto-save to history
      handleSave(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#3B82F6', '#10B981']
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate animation. Please try again.");
    } finally {
      setIsGeneratingFreeAnimation(false);
      setProcessingStatus('');
    }
  };

  const handleGenerateVideo = async () => {
    if (!video || !selectedStyle) return;
    setIsGeneratingVideo(true);
    setError(null);
    setProcessingStatus('Connecting to Cloud AI...');
    
    try {
      const result = await transformVideo(selectedStyle.prompt, previewImageUrl || undefined, videoResolution);
      setTransformedVideoUrl(result);
      // Auto-save to history
      handleSave(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video. Please ensure you have a valid paid API key.");
    } finally {
      setIsGeneratingVideo(false);
      setProcessingStatus('');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      let urlToDownload = transformedVideoUrl || previewImageUrl;
      let isVideo = !!transformedVideoUrl;
      let fileName = `ai-result-${Date.now()}`;

      // If it's a free animation and no full video yet, generate a video from frames
      if (!urlToDownload && freeAnimationFrames.length > 0) {
        setProcessingStatus('Assembling video frames...');
        urlToDownload = await generateVideoFromFrames(freeAnimationFrames, animationSpeed);
        isVideo = true;
        fileName = `ai-animation-${Date.now()}`;
      } else if (!urlToDownload) {
        return;
      }

      const link = document.createElement('a');
      link.href = urlToDownload;
      link.download = isVideo ? `${fileName}.mp4` : `${fileName}.png`;
      
      // For webm blobs, we might want to name them .webm, but .mp4 is often accepted by players
      if (urlToDownload.startsWith('blob:') && isVideo) {
        // Check if it's actually webm
        const response = await fetch(urlToDownload);
        const blob = await response.blob();
        if (blob.type.includes('webm')) {
          link.download = `${fileName}.webm`;
        }
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Auto-save to history
      handleSave(true);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to prepare download. Please try again.");
    } finally {
      setIsDownloading(false);
      setProcessingStatus('');
    }
  };

  const handleSave = async (silent = false) => {
    const urlToSave = transformedVideoUrl || previewImageUrl || (freeAnimationFrames.length > 0 ? freeAnimationFrames[0] : null);
    if (!user || !urlToSave || !selectedStyle) return;
    try {
      const res = await fetch('/api/transformations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transformedVideoUrl ? 'video' : 'image',
          originalUrl: video,
          transformedUrl: urlToSave,
          style: selectedStyle.name,
          styleDescription: selectedStyle.description,
          config: { 
            styleId: selectedStyle.id,
            prompt: selectedStyle.prompt,
            isFlipbook: !transformedVideoUrl && freeAnimationFrames.length > 0
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
    setVideo(null);
    setTransformedVideoUrl(null);
    setPreviewImageUrl(null);
    setFreeAnimationFrames([]);
    setSelectedStyle(null);
    setError(null);
    setShowWebcam(false);
    setIsRecording(false);
  };

  React.useEffect(() => {
    if (showWebcam && webcamVideoRef.current && !webcamVideoRef.current.srcObject) {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
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

  const startRecording = () => {
    if (!webcamVideoRef.current || !webcamVideoRef.current.srcObject) return;
    
    const stream = webcamVideoRef.current.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideo(url);
      
      const v = document.createElement('video');
      v.src = url;
      v.onloadedmetadata = () => {
        setEndTime(v.duration);
        setStartTime(0);
      };
      
      stopWebcam();
    };
    
    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const stopWebcam = () => {
    if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
      const tracks = (webcamVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      webcamVideoRef.current.srcObject = null;
    }
    setShowWebcam(false);
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="p-3 glass-gold rounded-2xl text-gold shadow-2xl shadow-gold/10">
            <Video size={28} />
          </div>
          <h1 className="text-5xl font-serif font-light text-white tracking-tight">
            Motion <span className="italic text-gold">Atelier</span>
          </h1>
        </motion.div>
        <p className="text-white/50 text-xl max-w-2xl font-light leading-relaxed">
          Craft cinematic <span className="text-gold italic">Intelligence Sequences</span> from your motions. 
          Upload your vision, select an intelligence model, and witness the transformation.
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* Left Panel: Video Display */}
        <div className="lg:col-span-8 space-y-8">
          {!video ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              {...getRootProps()}
              className={`aspect-video rounded-[48px] border-2 border-dashed transition-all flex flex-col items-center justify-center p-12 text-center cursor-pointer group ${
                isDragActive ? 'border-gold bg-gold/5' : 'border-white/10 glass hover:border-gold/40 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-24 h-24 glass-gold rounded-[32px] flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform duration-700 shadow-2xl shadow-gold/5">
                <Upload size={40} />
              </div>
              <h2 className="text-3xl font-serif text-white mb-4">Relinquish your motion here</h2>
              <p className="text-white/40 max-w-sm text-lg leading-relaxed font-light mb-8">
                Drag and drop or select a high-fidelity MP4 or MOV file to begin the transformation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); startWebcam(); }}
                  className="px-8 py-4 glass-gold text-gold rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-gold/20 hover:bg-gold/10 flex items-center space-x-3 transition-all"
                >
                  <Camera size={18} />
                  <span>Live Motion Capture</span>
                </button>
                <div className="hidden sm:block text-white/10 text-[10px] font-bold uppercase tracking-[0.2em]">or</div>
                <div className="px-8 py-4 glass text-white/60 rounded-full font-bold text-xs uppercase tracking-[0.2em] border border-white/10 group-hover:border-gold/40 transition-all">
                  Browse Files
                </div>
              </div>

              <div className="mt-10 flex items-center space-x-3 text-xs font-bold text-gold bg-gold/10 px-6 py-3 rounded-full border border-gold/20 tracking-widest uppercase">
                <Zap size={14} />
                <span>Morphlume Intelligence Active</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-[48px] overflow-hidden border border-white/10 relative shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 glass-gold rounded-2xl flex items-center justify-center text-gold shadow-xl shadow-gold/10">
                    <Play size={24} fill="currentColor" />
                  </div>
                  <div>
                    <span className="block font-serif text-xl text-white">
                      Original Motion
                    </span>
                    <span className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] opacity-80">
                      {selectedStyle ? selectedStyle.name : 'Awaiting Model Selection'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={reset} 
                  className="p-4 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all duration-300"
                  title="Remove motion"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              <div className="relative aspect-video bg-[#050505] flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src={video}
                  controls
                  className="max-h-full max-w-full"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="p-12 space-y-10">
                {/* Trim & Settings Controls */}
                {!transformedVideoUrl && !previewImageUrl && freeAnimationFrames.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-8 glass-gold rounded-[40px] border border-gold/10 space-y-8"
                  >
                    <div className="flex items-center space-x-3 text-gold">
                      <History size={20} />
                      <span className="font-bold text-xs uppercase tracking-[0.2em]">Sequence Parameters</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Temporal Range (s)</label>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="number" 
                            value={startTime} 
                            onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value)))}
                            className="w-full px-4 py-3 glass border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-gold/50 outline-none transition-all"
                            min="0"
                            step="0.1"
                          />
                          <span className="text-white/20 font-serif italic">to</span>
                          <input 
                            type="number" 
                            value={endTime} 
                            onChange={(e) => setEndTime(Math.max(startTime + 0.1, parseFloat(e.target.value)))}
                            className="w-full px-4 py-3 glass border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-gold/50 outline-none transition-all"
                            min={startTime + 0.1}
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Frame Density</label>
                        <select 
                          value={frameCount}
                          onChange={(e) => setFrameCount(parseInt(e.target.value))}
                          className="w-full px-4 py-3 glass border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-gold/50 outline-none appearance-none cursor-pointer transition-all"
                        >
                          <option value="3">3 Frames (Swift)</option>
                          <option value="5">5 Frames (Balanced)</option>
                          <option value="8">8 Frames (Fluid)</option>
                          <option value="12">12 Frames (Masterpiece)</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Sequence Pace</label>
                        <select 
                          value={animationSpeed}
                          onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                          className="w-full px-4 py-3 glass border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-gold/50 outline-none appearance-none cursor-pointer transition-all"
                        >
                          <option value="800">Languid (1.2 FPS)</option>
                          <option value="500">Standard (2 FPS)</option>
                          <option value="300">Brisk (3.3 FPS)</option>
                          <option value="150">Ethereal (6.6 FPS)</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Visual Fidelity</label>
                        <select 
                          value={videoResolution}
                          onChange={(e) => setVideoResolution(e.target.value as any)}
                          className="w-full px-4 py-3 glass border border-white/10 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-gold/50 outline-none appearance-none cursor-pointer transition-all"
                        >
                          <option value="720p">720p (Efficient)</option>
                          <option value="1080p">1080p (Pristine)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(previewImageUrl || freeAnimationFrames.length > 0 || transformedVideoUrl) ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full sm:w-auto px-12 py-6 bg-gradient-to-br from-gold-light via-gold to-gold-dark text-black rounded-[28px] font-bold text-xl hover:scale-105 shadow-2xl shadow-gold/20 flex items-center justify-center space-x-4 transition-all duration-500 disabled:opacity-50"
                    >
                      {isDownloading ? <Loader2 className="animate-spin" size={28} /> : <Download size={28} />}
                      <span className="uppercase tracking-widest text-sm">Download</span>
                    </button>
                    <button 
                      onClick={() => {setPreviewImageUrl(null); setFreeAnimationFrames([]); setTransformedVideoUrl(null);}}
                      className="w-full sm:w-auto px-12 py-6 glass text-white border border-white/10 rounded-[28px] font-bold text-xl hover:bg-white/10 shadow-xl flex items-center justify-center space-x-4 transition-all duration-500"
                    >
                      <Trash2 size={28} />
                      <span className="uppercase tracking-widest text-sm">Purge Result</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
                      <div className="p-8 rounded-[32px] glass border border-white/5">
                        <div className="flex items-center space-x-4 mb-4 text-gold">
                          <Layers size={24} />
                          <span className="font-serif text-xl">Phase I</span>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed font-light">Select an intelligence model from the atelier that resonates with your artistic intent.</p>
                      </div>
                      <div className="p-8 rounded-[32px] glass border border-white/5">
                        <div className="flex items-center space-x-4 mb-4 text-gold">
                          <Zap size={24} />
                          <span className="font-serif text-xl">Phase II</span>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed font-light">Initiate the <span className="text-gold italic">Intelligence Sequence</span> to manifest a series of artistic frames.</p>
                      </div>
                    </div>
                    
                    {!selectedStyle ? (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-20 h-20 glass rounded-full flex items-center justify-center text-white/10 border border-white/5">
                          <ArrowRight size={40} />
                        </div>
                        <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-xs italic">Awaiting Model Selection</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-8 w-full">
                        <div className="grid grid-cols-1 gap-6 w-full">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleFreeAnimation}
                            disabled={isProcessing || isPreviewing || isGeneratingFreeAnimation || isGeneratingVideo}
                            className="px-8 py-8 bg-gradient-to-br from-gold-light via-gold to-gold-dark text-black rounded-[32px] font-bold text-2xl hover:shadow-2xl hover:shadow-gold/30 transition-all duration-700 shadow-xl flex flex-col items-center justify-center space-y-2 disabled:opacity-50"
                          >
                            <div className="flex items-center space-x-4">
                              {isGeneratingFreeAnimation ? <Loader2 className="animate-spin" size={32} /> : <Zap size={32} />}
                              <span className="uppercase tracking-[0.2em] text-lg">Manifest Sequence</span>
                            </div>
                          </motion.button>
                        </div>

                        <div className="flex items-center space-x-6">
                          <button 
                            onClick={handlePreviewFrame}
                            disabled={isProcessing || isPreviewing || isGeneratingFreeAnimation || isGeneratingVideo}
                            className="text-xs font-bold text-white/40 hover:text-gold transition-all duration-300 flex items-center space-x-3 uppercase tracking-widest"
                          >
                            <Wand2 size={18} />
                            <span>Preview Model on Frame</span>
                          </button>
                        </div>
                        
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] text-center max-w-md">
                          Metamorphose your motion into a singular artistic sequence through Morphlume Intelligence.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {transformedVideoUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 glass-gold border border-gold/20 text-white rounded-[48px] space-y-8 shadow-2xl shadow-gold/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 glass-gold rounded-2xl text-gold">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="text-2xl font-serif tracking-tight">Intelligence <span className="italic text-gold">Masterpiece</span></h3>
                </div>
                <div className="flex items-center space-x-3">
                  <a 
                    href={transformedVideoUrl} 
                    download="mophlume-masterpiece.mp4"
                    className="p-3 glass-gold text-gold rounded-full hover:bg-gold/20 transition-all"
                  >
                    <Download size={24} />
                  </a>
                  <button 
                    onClick={() => setTransformedVideoUrl(null)}
                    className="p-3 glass-gold text-gold rounded-full hover:bg-gold/20 transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className="aspect-video rounded-[32px] overflow-hidden bg-[#050505] border border-white/10 shadow-2xl">
                <video 
                  src={transformedVideoUrl} 
                  controls 
                  className="w-full h-full"
                />
              </div>
              
              <p className="text-sm text-white/50 leading-relaxed font-light">
                Your motion has been fully mastered using the <span className="text-gold font-bold italic">{selectedStyle?.name}</span> model. 
                The transformation is complete. You may now download it.
              </p>
            </motion.div>
          )}

          {previewImageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 glass border border-white/10 rounded-[48px] space-y-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gold">
                  <Wand2 size={28} />
                  <h3 className="text-2xl font-serif tracking-tight">Intelligence <span className="italic">Glimpse</span></h3>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowComparison(!showComparison)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${showComparison ? 'bg-gold text-black' : 'glass text-white/60 hover:text-white border-white/10'}`}
                  >
                    {showComparison ? 'Conceal Original' : 'Reveal Original'}
                  </button>
                  <button 
                    onClick={() => setPreviewImageUrl(null)}
                    className="p-3 glass text-white/30 hover:text-white rounded-full transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className={`grid ${showComparison ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {showComparison && (
                  <div className="aspect-video rounded-[32px] overflow-hidden bg-[#050505] border border-white/10 shadow-inner relative">
                    <div className="absolute top-4 left-4 glass text-white/60 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] z-10 border-white/5">Original</div>
                    <video 
                      src={video || undefined} 
                      className="w-full h-full object-contain"
                      onLoadedMetadata={(e) => {
                        const v = e.target as HTMLVideoElement;
                        v.currentTime = videoRef.current?.currentTime || 0;
                      }}
                    />
                  </div>
                )}
                <div className="aspect-video rounded-[32px] overflow-hidden bg-[#050505] border border-white/10 shadow-inner relative">
                  <div className="absolute top-4 left-4 glass-gold text-gold text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] z-10 border-gold/10">Transformed</div>
                  <img 
                    src={previewImageUrl} 
                    alt="Style Preview" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              
              <p className="text-sm text-white/40 leading-relaxed font-light">
                A glimpse of the <span className="text-gold font-bold italic">{selectedStyle?.name}</span> model applied to the current temporal point. 
                Manifested via Morphlume Intelligence.
              </p>
            </motion.div>
          )}

          {freeAnimationFrames.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 glass-gold border border-gold/10 rounded-[48px] space-y-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-gold">
                  <Zap size={28} />
                  <h3 className="text-2xl font-serif tracking-tight">Intelligence <span className="italic">Sequence</span></h3>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-bold glass-gold text-gold px-4 py-2 rounded-full uppercase tracking-[0.2em] border-gold/20">
                    {freeAnimationFrames.length} / {frameCount} Manifestations
                  </span>
                  <button 
                    onClick={() => setFreeAnimationFrames([])}
                    className="p-3 glass-gold text-gold/40 hover:text-gold rounded-full transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
              
              <div className="aspect-video rounded-[32px] overflow-hidden bg-[#050505] border border-gold/10 shadow-2xl relative">
                <img 
                  src={freeAnimationFrames[currentAnimationFrame]} 
                  alt="Free Animation" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {isGeneratingFreeAnimation && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <Loader2 className="animate-spin mb-4 text-gold" size={48} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/80">{processingStatus}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-2">
                {freeAnimationFrames.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-500 ${idx === currentAnimationFrame ? 'w-12 bg-gold' : 'w-3 bg-gold/20'}`}
                  />
                ))}
              </div>
              
              <p className="text-sm text-white/50 leading-relaxed font-light">
                This sequence was manifested through the <span className="text-gold font-bold italic">{selectedStyle?.name}</span> model. 
                It captures a series of artistic temporal points to create a singular motion experience.
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 glass border border-red-500/20 text-red-400 rounded-[48px] flex items-start space-x-6 shadow-2xl"
            >
              <div className="w-16 h-16 glass border-red-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <AlertCircle size={32} />
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-2xl mb-3 tracking-tight text-white">Intelligence <span className="italic text-red-400">Interruption</span></h4>
                <p className="text-white/40 leading-relaxed font-light">{error}</p>
                
                {error.toLowerCase().includes('quota') && (
                  <div className="mt-6 p-6 glass border-white/5 rounded-3xl">
                    <p className="text-sm text-white/60 mb-4 font-light leading-relaxed">
                      The Cloud Intelligence has reached its temporal limit. We have automatically transitioned to the <span className="text-gold font-bold italic">LITE</span> core for uninterrupted artistry. 
                      Alternatively, you may provide your own access key in your <button onClick={() => navigate('/profile')} className="text-gold font-bold hover:underline italic">Patron Profile</button>.
                    </p>
                    <button 
                      onClick={() => { setIsLocalEngine(true); setError(null); }}
                      className="text-[10px] font-bold text-gold hover:text-gold-light uppercase tracking-[0.2em] transition-colors"
                    >
                      Engage Lite Core
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-6 mt-8">
                  <button 
                    onClick={() => setError(null)}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300"
                  >
                    Dismiss Interruption
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel: Intelligence Models */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <div className="glass rounded-[40px] p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 text-gold">
                  <Sparkles size={20} />
                  <h2 className="font-serif text-xl tracking-tight">Intelligence <span className="italic">Models</span></h2>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <div className="flex glass p-1 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setIsLocalEngine(true)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-500 uppercase tracking-widest ${isLocalEngine ? 'bg-gold text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                      LITE
                    </button>
                    <button 
                      onClick={() => setIsLocalEngine(false)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-500 uppercase tracking-widest ${!isLocalEngine ? 'bg-gold text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                    >
                      PRO
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                    {TOON_STYLES.length} Models Available
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-450px)] overflow-y-auto pr-4 custom-scrollbar">
                {TOON_STYLES.map((style, idx) => (
                  <motion.button
                    key={style.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedStyle(style)}
                    className={`w-full text-left p-6 rounded-[32px] border transition-all duration-500 flex items-center space-x-5 group relative overflow-hidden ${
                      selectedStyle?.id === style.id 
                        ? 'border-gold/40 glass-gold shadow-2xl shadow-gold/5' 
                        : 'border-white/5 glass hover:border-white/20'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-700">
                      <img 
                        src={style.previewUrl} 
                        alt={style.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-serif text-lg tracking-tight mb-1 transition-colors ${selectedStyle?.id === style.id ? 'text-gold' : 'text-white'}`}>
                        {style.name}
                      </h3>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed font-light">
                        {style.description}
                      </p>
                    </div>
                    {selectedStyle?.id === style.id && (
                      <motion.div 
                        layoutId="active-check"
                        className="w-8 h-8 glass-gold text-gold rounded-full flex items-center justify-center shadow-lg border border-gold/20"
                      >
                        <Check size={16} strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
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
                  <h3 className="text-xl font-serif font-bold text-white tracking-tight">Live Motion Recording</h3>
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
                  ref={webcamVideoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover grayscale"
                />
                
                {isRecording && (
                  <div className="absolute top-8 left-8 flex items-center space-x-3 glass px-4 py-2 rounded-full border border-red-500/20">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                      Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-10 flex flex-col items-center gap-6">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="w-20 h-20 bg-gold rounded-full flex items-center justify-center text-black shadow-2xl shadow-gold/20 hover:scale-110 transition-transform group"
                  >
                    <div className="w-12 h-12 bg-black rounded-full" />
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-500/20 hover:scale-110 transition-transform group"
                  >
                    <Square size={32} fill="currentColor" />
                  </button>
                )}
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em]">
                  {isRecording ? 'Stop Recording' : 'Start Motion Capture'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
