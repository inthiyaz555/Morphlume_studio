import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Mail, Lock, User, Sparkles, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-[48px] border border-white/5 p-10 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="inline-flex items-center justify-center w-20 h-20 glass rounded-3xl text-gold border border-gold/20 shadow-lg shadow-gold/5 mb-6"
          >
            <Sparkles size={40} />
          </motion.div>
          <h2 className="text-4xl font-serif font-bold text-white tracking-tight mb-3">Join the Studio</h2>
          <p className="text-white/40 font-light italic">Become a Patron of Morphlume</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-5 glass border border-red-500/20 text-red-400 rounded-3xl flex items-center space-x-3 text-sm font-light italic"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-8">
          <div className="group">
            <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Patron Name</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Communication Node</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                placeholder="name@mophlume.com"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Security Cipher</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gold text-black rounded-full font-bold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-gold/20 flex items-center justify-center space-x-3 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-10 text-center text-white/20 text-xs font-light italic">
          Already a Patron?{' '}
          <Link to="/login" className="text-gold font-bold hover:text-gold-light transition-colors not-italic">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
