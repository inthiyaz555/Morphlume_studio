import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Video, Image as ImageIcon, Zap, Shield, 
  Clock, ArrowRight, Play, Star, Users, Globe,
  Wand2, Layers, Download, Check, X
} from 'lucide-react';
import { useAuth } from '../AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [showDemo, setShowDemo] = useState(false);

  const demoImages = [
    { before: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop", after: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&h=600&fit=crop", label: "Studio Ghibli Style" },
    { before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop", after: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop", label: "Pixar 3D Magic" },
    { before: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=600&h=600&fit=crop", after: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop", label: "Cyberpunk Anime" },
    { before: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop", after: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=600&fit=crop", label: "Disney Classic" }
  ];

  return (
    <div className="bg-black text-white overflow-hidden font-sans">
      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemo(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl glass rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-auto max-h-[90vh] border border-white/10"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Left: Video Demo */}
              <div className="md:w-1/2 bg-ink p-8 md:p-16 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                  <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/20 rounded-full blur-[120px]" />
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 glass-gold rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-gold">
                    <Video size={12} />
                    <span>Motion Atelier</span>
                  </div>
                  <h3 className="text-5xl font-serif font-bold mb-8 leading-tight text-gradient-gold">Visual <br />Poetry.</h3>
                  
                  <div className="aspect-video bg-black/60 rounded-3xl border border-white/5 overflow-hidden mb-10 relative group shadow-2xl">
                    <motion.div 
                      animate={{ 
                        x: [0, "-100%", "-200%", "-300%", "-400%", 0],
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex h-full w-full"
                    >
                      {[
                        { src: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=450&fit=crop", label: "Noir Aesthetic" },
                        { src: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&h=450&fit=crop", label: "Ethereal Glow" },
                        { src: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&h=450&fit=crop", label: "Renaissance AI" },
                        { src: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&h=450&fit=crop", label: "Vogue Motion" },
                        { src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=450&fit=crop", label: "Couture Style" }
                      ].map((item, i) => (
                        <div key={i} className="w-full h-full flex-shrink-0 relative">
                          <img 
                            src={item.src} 
                            alt={item.label} 
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-6 left-6 glass px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                      <div className="w-20 h-20 glass rounded-full flex items-center justify-center border border-white/20">
                        <Play size={32} fill="white" className="ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/40 text-sm leading-relaxed font-light">
                    Morphlume Motion Atelier transforms raw footage into cinematic sequences. Elevate your storytelling with 20+ curated artistic intelligence models.
                  </p>
                </div>
              </div>

              {/* Right: Image Demo */}
              <div className="md:w-1/2 p-8 md:p-16 bg-white text-black flex flex-col justify-center">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-black/5 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                  <ImageIcon size={12} />
                  <span>Visual Atelier</span>
                </div>
                <h3 className="text-5xl font-serif font-bold text-black mb-10 leading-tight">Refined <br />Intelligence.</h3>

                <div className="space-y-8">
                  {demoImages.map((img, i) => (
                    <div key={i} className="flex items-center space-x-6 group cursor-pointer">
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border border-black/5 shadow-xl">
                        <img src={img.before} alt="Before" className="w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-700" referrerPolicy="no-referrer" />
                        <img src={img.after} alt="After" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="font-serif text-xl font-bold text-black">{img.label}</h4>
                        <p className="text-xs text-black/40 uppercase tracking-widest mt-1">Reveal Transformation</p>
                      </div>
                      <div className="ml-auto">
                        <ArrowRight size={20} className="text-black/10 group-hover:text-black group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-6">The Morphlume Suite</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: <Wand2 size={18} />, label: "Artistry" },
                      { icon: <Layers size={18} />, label: "Isolation" },
                      { icon: <Sparkles size={18} />, label: "Refinement" },
                      { icon: <Download size={18} />, label: "Master" },
                      { icon: <Zap size={18} />, label: "Instant" },
                      { icon: <Check size={18} />, label: "Batch" }
                    ].map((tool, i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-4 bg-black/5 rounded-3xl border border-transparent hover:border-black/10 hover:bg-white transition-all group cursor-default">
                        <div className="text-black/20 group-hover:text-black mb-2 transition-colors">
                          {tool.icon}
                        </div>
                        <span className="text-[10px] font-bold text-black/40 group-hover:text-black transition-colors uppercase tracking-widest">{tool.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-16 pt-10 border-t border-black/5">
                  <Link
                    to={user ? "/dashboard" : "/signup"}
                    onClick={() => setShowDemo(false)}
                    className="w-full py-5 bg-black text-white rounded-full font-bold text-center block hover:bg-gold transition-all shadow-2xl uppercase tracking-[0.2em] text-sm"
                  >
                    Enter the Atelier
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-64">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/10 rounded-full blur-[160px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[160px] opacity-40 animate-pulse" style={{ animationDelay: '3s' }} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-3 px-6 py-2 rounded-full glass border border-white/10 text-white/60 text-[10px] font-bold mb-12 shadow-2xl uppercase tracking-[0.3em]"
            >
              <Zap size={14} className="text-gold" />
              <span>Powered by Morphlume Intelligence</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-8xl md:text-[12rem] font-serif font-bold text-white tracking-tighter leading-[0.8] mb-12"
            >
              MORPHLUME <br />
              <span className="text-gradient-gold">STUDIO.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/40 max-w-3xl mx-auto mb-16 leading-relaxed font-light italic"
            >
              The world's most exclusive AI creative suite. Elevate your visual narrative with professional-grade artistic intelligence.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="group relative px-16 py-6 bg-gold text-black rounded-full font-bold text-lg hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 flex items-center space-x-4 overflow-hidden uppercase tracking-[0.2em]"
                >
                  <span>Join the Atelier</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(true)}
                className="px-16 py-6 glass text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center space-x-4 uppercase tracking-[0.2em]"
              >
                <Play size={20} fill="currentColor" />
                <span>The Experience</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-48 bg-ink/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                icon: <Video size={32} />,
                title: "Motion Atelier",
                desc: "Transform cinematic footage into ethereal sequences with curated artistic intelligence.",
                color: "text-gold"
              },
              {
                icon: <ImageIcon size={32} />,
                title: "Visual Refinement",
                desc: "Apply professional-grade artistic styles to any visual. Curated for the modern narrative.",
                color: "text-white"
              },
              {
                icon: <Wand2 size={32} />,
                title: "Artistic Suite",
                desc: "Isolate subjects, refine details, and master your media with one-touch intelligence.",
                color: "text-gold"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-12 glass rounded-[48px] border border-white/5 transition-all group hover:border-gold/20"
              >
                <div className={`w-16 h-16 glass rounded-2xl flex items-center justify-center ${feature.color} mb-10 border border-white/10 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-serif font-bold text-white mb-6 tracking-tight">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed font-light italic">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2">
              <h2 className="text-6xl md:text-8xl font-serif font-bold text-white tracking-tighter leading-[0.9] mb-12">
                ELEVATE YOUR <br />
                <span className="text-gold italic">NARRATIVE.</span>
              </h2>
              <p className="text-xl text-white/40 mb-12 leading-relaxed font-light italic">
                Our neural architecture understands the soul of your media, ensuring every transformation is a masterpiece of modern intelligence.
              </p>
              <div className="space-y-8">
                {[
                  "Cinematic Visual Mastery",
                  "Ethereal Motion Sequences",
                  "Curated Artistic Intelligence",
                  "High-End Visual Refinement"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-6">
                    <div className="w-6 h-6 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <span className="font-bold text-white/80 uppercase tracking-widest text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-8 bg-gold/10 rounded-[60px] blur-[100px] opacity-30 animate-pulse" />
              <div className="relative grid grid-cols-2 gap-6">
                <img 
                  src="https://picsum.photos/seed/moph1/600/800" 
                  alt="Showcase 1" 
                  className="rounded-[40px] shadow-2xl hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0 border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-6 mt-16">
                  <img 
                    src="https://picsum.photos/seed/moph2/600/400" 
                    alt="Showcase 2" 
                    className="rounded-[40px] shadow-2xl hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://picsum.photos/seed/moph3/600/400" 
                    alt="Showcase 3" 
                    className="rounded-[40px] shadow-2xl hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-ink border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
            {[
              { label: "Masterpieces", value: "2M+" },
              { label: "Patrons", value: "500K+" },
              { label: "Ateliers", value: "20+" },
              { label: "Regions", value: "150+" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-6xl font-serif font-bold mb-3 tracking-tighter text-gradient-gold">{stat.value}</div>
                <div className="text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-ink" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '60px 60px' }} />
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-7xl md:text-9xl font-serif font-bold text-white tracking-tighter leading-[0.8] mb-16">
            ENTER THE <br />
            <span className="text-gold italic">ATELIER.</span>
          </h2>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center space-x-6 px-16 py-8 bg-gold text-black rounded-full font-bold text-xl hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 uppercase tracking-[0.3em]"
          >
            <span>Begin Your Journey</span>
            <Sparkles size={28} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-10">
            <Sparkles size={24} className="text-gold" />
            <span className="text-2xl font-serif font-bold tracking-tighter text-gradient-gold">MORPHLUME STUDIO</span>
          </div>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">
            © 2026 Morphlume Studio Atelier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
