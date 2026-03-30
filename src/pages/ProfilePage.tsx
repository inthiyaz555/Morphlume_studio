import React, { useState, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { User, Mail, Lock, Shield, Save, Check, AlertCircle, Sparkles, Trash2, Camera, LogOut, CreditCard, Zap, Crown, X, Smartphone, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, deleteAccount, logout } = useAuth();
  const [name, setName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(name, email, newPassword, photoURL);
      
      // Save user API key to localStorage
      if (userApiKey) {
        localStorage.setItem('user_gemini_api_key', userApiKey);
        // Explicitly enable cloud AI if a key is provided
        const { setAiEngine } = await import('../services/aiService');
        setAiEngine(false);
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
      
      setNewPassword('');
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaymentModal(false);
      }, 2000);
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount();
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="p-3 glass rounded-2xl text-gold border border-gold/20 shadow-lg shadow-gold/5">
            <User size={28} />
          </div>
          <h1 className="text-5xl font-serif font-bold text-white tracking-tight">Patron Settings</h1>
        </motion.div>
        <p className="text-white/40 text-xl max-w-2xl font-light italic leading-relaxed">
          Manage your personal identity and security parameters within the Morphlume Studio.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass rounded-[48px] p-10 text-white shadow-2xl border border-white/5 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all" />
            
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 glass rounded-[40px] flex items-center justify-center text-gold overflow-hidden border-2 border-gold/20 shadow-2xl">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-12 h-12 glass-gold text-black rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border border-gold/40"
                  title="Change Identity Visual"
                >
                  <Camera size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif font-bold mb-2 text-white">{profile?.displayName || 'Patron'}</h3>
              <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em] truncate">{user?.email}</p>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex items-center space-x-4">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gold border border-white/10">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Atelier Status</p>
                <p className="text-sm font-bold text-gold">Verified Master</p>
              </div>
            </div>

            <button 
              onClick={() => logout().then(() => navigate('/'))}
              className="mt-10 w-full py-4 glass hover:bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center space-x-3 transition-all border border-white/5 text-white/40 hover:text-white"
            >
              <LogOut size={16} />
              <span>Relinquish Session</span>
            </button>
          </motion.div>

          <div className="p-10 glass border border-red-500/10 rounded-[48px] space-y-6 group">
            <h4 className="text-red-400 font-bold flex items-center space-x-3 group-hover:scale-105 transition-transform origin-left uppercase tracking-[0.2em] text-[10px]">
              <Trash2 size={16} />
              <span>Terminal Action</span>
            </h4>
            <p className="text-xs text-white/20 leading-relaxed font-light italic">
              Relinquishing your account will permanently purge all your archival data and curated masterpieces. This action is irreversible.
            </p>
            {!showDeleteConfirm ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-4 glass border border-red-500/20 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:bg-red-500/10"
              >
                Purge Account
              </motion.button>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.3em] text-center">Confirm Permanent Purge?</p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteAccount}
                    className="py-3 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 shadow-xl shadow-red-500/20"
                  >
                    Confirm
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-3 glass text-white/40 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 border border-white/5"
                  >
                    Abstain
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[48px] border border-white/5 shadow-2xl p-12"
          >
            <h2 className="text-2xl font-serif font-bold text-white mb-10 uppercase tracking-widest">Identity Parameters</h2>
            
            {success && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10 p-6 glass border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center space-x-3 text-sm font-light italic"
              >
                <Check size={20} />
                <span>{success}</span>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10 p-6 glass border border-red-500/20 text-red-400 rounded-3xl flex items-center space-x-3 text-sm font-light italic"
              >
                <AlertCircle size={20} />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="group">
                  <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Patron Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Communication Node</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                    />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Security Cipher (Optional)</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                    placeholder="Leave blank to preserve current cipher"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Intelligence Core Key (Optional)</label>
                <div className="relative">
                  <Sparkles className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={20} />
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                    placeholder="Personal Gemini API Key for extended mastery"
                  />
                </div>
                <p className="mt-4 text-[10px] text-white/10 font-bold uppercase tracking-[0.2em] italic">
                  Your key is preserved locally. If left blank, our master intelligence key will be utilized.
                </p>
              </div>

              <div className="pt-10 border-t border-white/5 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="px-12 py-5 bg-gold text-black rounded-full font-bold text-sm uppercase tracking-[0.2em] hover:bg-gold-light shadow-2xl shadow-gold/20 flex items-center space-x-3 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Commit Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Billing & Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-[48px] border border-white/5 shadow-2xl p-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-widest">Patronage & Tiers</h3>
                <p className="text-sm text-white/20 font-light italic mt-1">Manage your access level and contribution nodes.</p>
              </div>
              <div className="px-6 py-2 glass-gold text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-gold/20 shadow-xl">
                Current Tier: Master
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-10 rounded-[40px] border-2 border-gold bg-gold/5 relative overflow-hidden group cursor-pointer shadow-2xl shadow-gold/5"
              >
                <div className="absolute top-0 right-0 p-6">
                  <Crown className="text-gold" size={32} />
                </div>
                <h4 className="text-xl font-serif font-bold text-white mb-2">Master Tier</h4>
                <p className="text-4xl font-serif font-bold text-gold mb-6">$19<span className="text-sm font-light text-white/20">/mo</span></p>
                <ul className="space-y-4">
                  <li className="flex items-center text-xs text-white/40 font-light italic">
                    <Check size={16} className="text-gold mr-3" />
                    Unlimited Artistic Mastery
                  </li>
                  <li className="flex items-center text-xs text-white/40 font-light italic">
                    <Check size={16} className="text-gold mr-3" />
                    4K High-Fidelity Exports
                  </li>
                  <li className="flex items-center text-xs text-white/40 font-light italic">
                    <Check size={16} className="text-gold mr-3" />
                    Priority Intelligence Access
                  </li>
                </ul>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-10 rounded-[40px] border border-white/5 glass relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-6">
                  <Zap className="text-white/10" size={32} />
                </div>
                <h4 className="text-xl font-serif font-bold text-white/40 mb-2">Acolyte Tier</h4>
                <p className="text-4xl font-serif font-bold text-white/10 mb-6">$0<span className="text-sm font-light text-white/5">/mo</span></p>
                <ul className="space-y-4 opacity-40">
                  <li className="flex items-center text-xs text-white/40 font-light italic">
                    <Check size={16} className="text-white/20 mr-3" />
                    5 Masterpieces / day
                  </li>
                  <li className="flex items-center text-xs text-white/40 font-light italic">
                    <Check size={16} className="text-white/20 mr-3" />
                    Standard Resolution
                  </li>
                  <li className="flex items-center text-xs text-white/40 font-light italic">
                    <Check size={16} className="text-white/20 mr-3" />
                    Community Support
                  </li>
                </ul>
              </motion.div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Contribution Nodes</h4>
              <div className="flex items-center justify-between p-8 glass rounded-[32px] border border-white/5 group hover:border-gold/20 transition-all">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-10 glass rounded-xl flex items-center justify-center text-gold font-bold text-[10px] border border-white/10 shadow-lg">
                    VISA
                  </div>
                  <div>
                    <p className="text-lg font-serif font-bold text-white tracking-tight">•••• •••• •••• 4242</p>
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mt-1">Expiry 12/26</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-gold hover:text-gold-light uppercase tracking-[0.2em] transition-colors">Modify</button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-6 border-2 border-dashed border-white/5 rounded-[32px] text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center space-x-3 hover:border-gold/20 hover:text-gold transition-all"
              >
                <CreditCard size={18} />
                <span>Establish New Node</span>
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showPaymentModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-xl glass rounded-[60px] overflow-hidden shadow-2xl p-12 border border-white/10"
                >
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="absolute top-8 right-8 w-12 h-12 glass hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/5"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-12">
                    <h3 className="text-4xl font-serif font-bold text-white mb-3 tracking-tight">New Contribution Node</h3>
                    <p className="text-white/40 font-light italic">Establish a secure link for your patronage.</p>
                  </div>

                  {paymentSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="w-24 h-24 glass-gold text-black rounded-full flex items-center justify-center mb-8 shadow-2xl border border-gold/40">
                        <Check size={48} />
                      </div>
                      <h4 className="text-3xl font-serif font-bold text-white mb-3">Node Established</h4>
                      <p className="text-white/40 font-light italic">Your patronage link has been successfully verified.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleProcessPayment} className="space-y-10">
                      <div className="flex glass p-1.5 rounded-[32px] border border-white/5 mb-10">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`flex-1 py-4 rounded-[28px] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all ${paymentMethod === 'card' ? 'bg-gold text-black shadow-xl' : 'text-white/20'}`}
                        >
                          <CreditCard size={18} />
                          <span>Credit Card</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`flex-1 py-4 rounded-[28px] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all ${paymentMethod === 'upi' ? 'bg-gold text-black shadow-xl' : 'text-white/20'}`}
                        >
                          <Smartphone size={18} />
                          <span>UPI Node</span>
                        </button>
                      </div>

                      {paymentMethod === 'card' ? (
                        <div className="space-y-8">
                          <div className="group">
                            <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Cipher Number</label>
                            <input 
                              type="text" 
                              placeholder="•••• •••• •••• 4242" 
                              className="w-full px-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                            <div className="group">
                              <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Temporal Expiry</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                className="w-full px-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                                required
                              />
                            </div>
                            <div className="group">
                              <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">Verification Code</label>
                              <input 
                                type="text" 
                                placeholder="•••" 
                                className="w-full px-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div className="group">
                            <label className="block text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4 group-focus-within:text-gold transition-colors">UPI Identity (VPA)</label>
                            <input 
                              type="text" 
                              placeholder="patron@mophlume" 
                              className="w-full px-6 py-4 glass border border-white/5 rounded-full focus:ring-2 focus:ring-gold/50 focus:bg-white/5 outline-none text-white transition-all font-light italic"
                              required
                            />
                          </div>
                          <p className="text-[10px] text-white/20 text-center font-bold uppercase tracking-[0.2em] italic">
                            A verification request will be transmitted to your mobile node.
                          </p>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full py-6 bg-gold text-black rounded-full font-bold text-xl uppercase tracking-[0.3em] shadow-2xl shadow-gold/20 flex items-center justify-center space-x-4 disabled:opacity-50"
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <Shield size={24} />
                            <span>Verify Node</span>
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 glass rounded-[48px] border border-white/5 transition-all cursor-default group hover:border-gold/20"
            >
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold mb-6 border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <h4 className="font-serif font-bold text-white text-xl mb-2">Master Patron</h4>
              <p className="text-xs text-white/30 font-light italic leading-relaxed">You possess unrestricted access to all artistic intelligence models and high-fidelity exports.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-10 glass rounded-[48px] border border-white/5 transition-all cursor-default group hover:border-gold/20"
            >
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-gold mb-6 border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h4 className="font-serif font-bold text-white text-xl mb-2">Encrypted Identity</h4>
              <p className="text-xs text-white/30 font-light italic leading-relaxed">Your personal identity parameters are protected by industry-standard neural encryption.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
