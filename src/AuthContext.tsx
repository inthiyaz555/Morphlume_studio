import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from './types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (name?: string, email?: string, password?: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  deleteAccount: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setProfile({
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          photoURL: data.user.photoURL,
          createdAt: new Date(),
        });
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    setUser(data.user);
    setProfile({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoURL,
      createdAt: new Date(),
    });
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    
    setUser(data.user);
    setProfile({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoURL,
      createdAt: new Date(),
    });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  const deleteAccount = async () => {
    const res = await fetch('/api/auth/account', { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete account');
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (name?: string, email?: string, password?: string, photoURL?: string) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: name, email, password, photoURL }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    
    setUser(data.user);
    setProfile({
      uid: data.user.id,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoURL,
      createdAt: new Date(),
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, login, signup, logout, deleteAccount, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
