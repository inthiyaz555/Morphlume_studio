import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Palette, 
  Video, 
  ArrowRight, 
  DollarSign, 
  Clock,
  Sparkles,
  Layers,
  Smartphone
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  icon: React.ReactNode;
  date: string;
  readTime: string;
  color: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'pricing-guide',
    title: 'Understanding Morphlume Studio Patronage: Lite vs Master',
    excerpt: 'Is the Master tier worth it? We break down the differences between our local neural engine and high-fidelity cloud intelligence.',
    category: 'Patronage',
    icon: <DollarSign className="w-6 h-6" />,
    date: 'March 15, 2026',
    readTime: '5 min read',
    color: 'bg-gold'
  },
  {
    id: 'functionality-overview',
    title: '10 Features of the Morphlume Intelligence Suite',
    excerpt: 'From background extraction to custom neural flipbooks, explore the full power of our artistic atelier.',
    category: 'Intelligence',
    icon: <Zap className="w-6 h-6" />,
    date: 'March 12, 2026',
    readTime: '8 min read',
    color: 'bg-gold'
  },
  {
    id: 'animegan-deep-dive',
    title: 'The Alchemy of Morphlume: Achieving the Look',
    excerpt: 'A technical look at how our neural models transform everyday visuals into cinematic masterpieces.',
    category: 'Alchemy',
    icon: <Cpu className="w-6 h-6" />,
    date: 'March 10, 2026',
    readTime: '12 min read',
    color: 'bg-gold'
  }
];

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] pb-20 selection:bg-gold selection:text-black">
      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >

            <h1 className="text-6xl md:text-9xl font-serif font-bold text-white tracking-tighter leading-[0.85] mb-10">
              The Morphlume <br />
              <span className="text-gold italic">Journal.</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl font-light italic leading-relaxed">
              Deep dives into neural artistry, patronage transparency, and step-by-step guides to mastering our creative atelier.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post - Split Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-[60px] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px] shadow-2xl border border-white/5"
        >
          <div className="p-12 md:p-20 flex flex-col justify-center">
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gold border border-gold/20 shadow-lg shadow-gold/5">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Patronage & Value</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight tracking-tight">
              Is Master Tier Worth It? <br />
              <span className="text-white/20 italic">The Definitive Guide.</span>
            </h2>
            <p className="text-white/40 text-lg mb-10 leading-relaxed font-light italic">
              We believe in absolute transparency. Learn exactly what you get with our local neural engine versus the high-fidelity Master cloud intelligence.
            </p>
            <div className="grid grid-cols-2 gap-10 mb-12">
              <div className="border-l-2 border-gold/40 pl-6">
                <h4 className="text-white font-serif font-bold text-lg mb-2">Lite Engine</h4>
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">100% Free • Unlimited</p>
              </div>
              <div className="border-l-2 border-gold pl-6">
                <h4 className="text-white font-serif font-bold text-lg mb-2">Master Engine</h4>
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">High Fidelity • Neural API</p>
              </div>
            </div>
            <button className="flex items-center space-x-3 text-gold font-bold text-xs uppercase tracking-[0.3em] group">
              <span>Read Full Analysis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
            </button>
          </div>
          <div className="relative overflow-hidden hidden lg:block border-l border-white/5">
            <img 
              src="https://picsum.photos/seed/luxury-art/1200/1200" 
              alt="Patronage" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Functionality Section */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="md:col-span-2 glass rounded-[60px] p-12 border border-white/5 shadow-2xl transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center text-gold border border-gold/20 shadow-lg shadow-gold/5 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <span className="px-4 py-1.5 glass text-gold text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-gold/10">Intelligence</span>
            </div>
            <h3 className="text-4xl font-serif font-bold text-white mb-6 tracking-tight">Mastering the Atelier</h3>
            <p className="text-white/40 text-lg mb-10 max-w-md font-light italic">Discover the neural tools that make Morphlume the most sophisticated creative suite available.</p>
            <ul className="space-y-6 mb-12">
              {[
                { icon: <Smartphone className="w-5 h-5" />, text: "Mobile-Optimized Mastery" },
                { icon: <Layers className="w-5 h-5" />, text: "Multi-Layer Neural Synthesis" },
                { icon: <ShieldCheck className="w-5 h-5" />, text: "Local-First Privacy Architecture" }
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-4 text-sm font-bold text-white/60 tracking-wide">
                  <div className="text-gold">{item.icon}</div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <button className="text-gold font-bold text-[10px] uppercase tracking-[0.4em] flex items-center space-x-3 group-hover:translate-x-3 transition-transform">
              <span>Explore Features</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Style Spotlight */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="glass rounded-[60px] p-12 text-white relative overflow-hidden cursor-pointer group border border-white/5"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform text-gold border border-gold/20 shadow-lg shadow-gold/5">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4 tracking-tight">Neural Alchemy <br /><span className="text-gold italic">Deep Dive</span></h3>
              <p className="text-white/40 text-sm mb-10 font-light italic leading-relaxed">How we brought cinematic Japanese animation to your personal studio.</p>
              <div className="glass rounded-3xl p-6 border border-white/10 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3">Top Style 2026</p>
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                  <span className="text-xs font-bold text-white/60 tracking-widest">98% Patron Satisfaction</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[-20%] right-[-20%] w-48 h-48 bg-gold/10 rounded-full blur-[80px] group-hover:bg-gold/20 transition-all duration-700" />
          </motion.div>

          {/* Video Animation Section */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="glass rounded-[60px] p-12 text-white flex flex-col justify-between cursor-pointer group border border-white/5"
          >
            <div>
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform text-gold border border-gold/20 shadow-lg shadow-gold/5">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4 tracking-tight">The Art of <br /><span className="text-gold italic">Flipbooks</span></h3>
              <p className="text-white/40 text-sm font-light italic leading-relaxed">Create viral animations in seconds with our free neural engine.</p>
            </div>
            <div className="mt-10 pt-10 border-t border-white/5">
              <div className="flex -space-x-3 mb-6">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/5 overflow-hidden grayscale hover:grayscale-0 transition-all">
                    <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="patron" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#050505] glass flex items-center justify-center text-[10px] font-bold text-gold">
                  +2k
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Daily Masterpieces</p>
            </div>
          </motion.div>

          {/* Tech & Privacy */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="md:col-span-2 glass rounded-[60px] p-12 text-white grid grid-cols-1 md:grid-cols-2 gap-12 cursor-pointer group border border-white/5"
          >
            <div>
              <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-gold/5 group-hover:scale-110 transition-transform text-gold border border-gold/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-serif font-bold mb-6 tracking-tight">Privacy by <br /><span className="text-gold italic">Design</span></h3>
              <p className="text-white/40 text-lg leading-relaxed font-light italic">Our Lite engine processes everything locally. Your identity never leaves your device, ensuring total creative privacy.</p>
            </div>
            <div className="glass rounded-[40px] p-10 border border-white/5 group-hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-3 mb-8">
                <Cpu className="w-6 h-6 text-gold" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Local Engine Metrics</span>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Neural Latency</span>
                  <span className="text-gold font-bold text-sm tracking-widest">0.4s</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold w-[90%] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Data Leakage</span>
                  <span className="text-gold font-bold text-sm tracking-widest">0.0%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold w-[0%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="glass rounded-[60px] p-16 md:p-24 text-center relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] border-[40px] border-gold rounded-full" />
          </div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-10 tracking-tighter leading-none">
              Join the <br /><span className="text-gold italic">Revolution.</span>
            </h2>
            <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-6">
              <input 
                type="email" 
                placeholder="patron@mophlume.com" 
                className="flex-1 glass rounded-full px-8 py-5 text-white font-light italic focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all border border-white/10"
              />
              <button className="bg-gold text-black px-12 py-5 rounded-full font-bold uppercase tracking-[0.3em] hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 pt-16 border-t border-white/5 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-gold border border-gold/20 shadow-lg">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-tighter">Morphlume Studio</span>
          </div>
          <div className="flex space-x-12">
            {['Privacy', 'Terms', 'Atelier', 'Help'].map(item => (
              <a key={item} href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] hover:text-gold transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
