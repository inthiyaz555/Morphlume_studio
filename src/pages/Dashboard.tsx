import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Transformation } from '../types';
import { Image as ImageIcon, Video, History, Sparkles, ArrowRight, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [recentTransformations, setRecentTransformations] = useState<Transformation[]>([]);
  const [stats, setStats] = useState({ images: 0, videos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/transformations');
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecentTransformations(data.slice(0, 4));
          setStats({
            images: data.filter((t: any) => t.type === 'image').length,
            videos: data.filter((t: any) => t.type === 'video').length
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-6xl font-serif font-bold text-white mb-4">
            Welcome, {profile?.displayName?.split(' ')[0] || 'Patron'}.
          </h1>
          <div className="flex items-center space-x-3 text-gold font-bold uppercase tracking-[0.2em] text-xs">
            <Zap size={14} />
            <span>Morphlume Intelligence Active • Unlimited Access</span>
          </div>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="glass p-10 rounded-[40px] border border-white/5 flex items-center space-x-8 group hover:border-gold/20 transition-all">
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-gold border border-white/10 group-hover:scale-110 transition-transform">
            <ImageIcon size={36} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Visuals Mastered</p>
            <p className="text-4xl font-serif font-bold text-white">{stats.images}</p>
          </div>
        </div>
        <div className="glass p-10 rounded-[40px] border border-white/5 flex items-center space-x-8 group hover:border-gold/20 transition-all">
          <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-gold border border-white/10 group-hover:scale-110 transition-transform">
            <Video size={36} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">Motions Mastered</p>
            <p className="text-4xl font-serif font-bold text-white">{stats.videos}</p>
          </div>
        </div>
        <div className="glass-gold p-10 rounded-[40px] border border-gold/20 flex items-center space-x-8 group hover:border-gold/40 transition-all shadow-2xl shadow-gold/5">
          <div className="w-20 h-20 bg-gold rounded-3xl flex items-center justify-center text-black shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform">
            <Sparkles size={36} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-[0.3em] mb-1">Total Artistry</p>
            <p className="text-4xl font-serif font-bold text-black">{stats.images + stats.videos}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-2xl font-serif font-bold text-white mb-6 uppercase tracking-widest">The Ateliers</h2>
          <Link
            to="/image-tool"
            className="block p-8 glass rounded-[40px] border border-white/5 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold border border-white/10">
                <ImageIcon size={28} />
              </div>
              <ArrowRight size={24} className="text-white/20 group-hover:text-gold group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Visual Atelier</h3>
            <p className="text-white/40 text-sm mt-3 font-light italic leading-relaxed">Transform visuals with professional-grade artistic intelligence models.</p>
          </Link>

          <Link
            to="/video-tool"
            className="block p-8 glass rounded-[40px] border border-white/5 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold border border-white/10">
                <Video size={28} />
              </div>
              <ArrowRight size={24} className="text-white/20 group-hover:text-gold group-hover:translate-x-2 transition-all" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Motion Atelier</h3>
            <p className="text-white/40 text-sm mt-3 font-light italic leading-relaxed">Convert cinematic footage into ethereal motion sequences.</p>
          </Link>
        </div>


      </div>
    </div>
  );
};
