import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { ImageTool } from './pages/ImageTool';
import { VideoTool } from './pages/VideoTool';

import { ProfilePage } from './pages/ProfilePage';
import { BlogPage } from './pages/BlogPage';
import { LiveSketchPage } from './pages/LiveSketchPage';
import { ChatWidget } from './components/ChatWidget';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#050505] selection:bg-gold selection:text-black">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/image-tool" element={<ProtectedRoute><ImageTool /></ProtectedRoute>} />
            <Route path="/video-tool" element={<ProtectedRoute><VideoTool /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/sketch" element={<ProtectedRoute><LiveSketchPage /></ProtectedRoute>} />
            <Route path="/blogs" element={<BlogPage />} />
          </Routes>
        </main>
        <ChatWidget />
      </div>
    </AuthProvider>
  );
}
