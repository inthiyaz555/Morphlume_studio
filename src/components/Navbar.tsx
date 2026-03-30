import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, History, Image as ImageIcon, Video, LayoutDashboard, Sparkles, Camera } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight text-gradient-gold">
              Morphlume Studio
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/blogs" className="text-white/60 hover:text-gold font-medium transition-colors text-sm uppercase tracking-widest">
              Editorial
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-white/60 hover:text-gold font-medium transition-colors flex items-center space-x-2 text-sm uppercase tracking-widest">
                  <LayoutDashboard size={16} />
                  <span>Atelier</span>
                </Link>
                <Link to="/image-tool" className="text-white/60 hover:text-gold font-medium transition-colors flex items-center space-x-2 text-sm uppercase tracking-widest">
                  <ImageIcon size={16} />
                  <span>Visuals</span>
                </Link>
                <Link to="/video-tool" className="text-white/60 hover:text-gold font-medium transition-colors flex items-center space-x-2 text-sm uppercase tracking-widest">
                  <Video size={16} />
                  <span>Motion</span>
                </Link>
                <Link to="/sketch" className="text-white/60 hover:text-gold font-medium transition-colors flex items-center space-x-2 text-sm uppercase tracking-widest">
                  <Camera size={16} />
                  <span>Live Sketch</span>
                </Link>

                <div className="h-4 w-px bg-white/10" />
                <Link to="/profile" className="flex items-center space-x-3 text-white/80 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                    {profile?.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{profile?.displayName || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/60 hover:text-gold font-medium transition-colors text-sm uppercase tracking-widest">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gold text-black px-6 py-2.5 rounded-full font-bold hover:bg-gold-light transition-all shadow-lg shadow-gold/20 text-sm uppercase tracking-widest"
                >
                  Join the Atelier
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button could go here */}
        </div>
      </div>
    </nav>
  );
};
