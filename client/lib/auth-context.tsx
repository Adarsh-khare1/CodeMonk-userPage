'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      console.log('🔐 Initializing auth context...');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        console.log('✅ Found stored auth data');
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        console.log('ℹ️ No stored auth data found');
      }
    } catch (error) {
      console.error('❌ Error initializing auth context:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const startTime = Date.now();

    try {
      console.log('🔑 Login attempt:', {
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
        timestamp: new Date().toISOString()
      });

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Login failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          duration: `${Date.now() - startTime}ms`
        });
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', {
        userId: data.user.id,
        username: data.user.username,
        duration: `${Date.now() - startTime}ms`
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Get return URL or default to dashboard
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl');
      if (returnUrl) {
        console.log('🔄 Redirecting to:', returnUrl);
        router.push(returnUrl);
      }
    } catch (error: any) {
      console.error('💥 Login error:', {
        message: error.message,
        stack: error.stack,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const startTime = Date.now();

    try {
      console.log('📝 Signup attempt:', {
        username,
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
        timestamp: new Date().toISOString()
      });

      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Signup failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          duration: `${Date.now() - startTime}ms`
        });
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      console.log('✅ Signup successful:', {
        userId: data.user.id,
        username: data.user.username,
        duration: `${Date.now() - startTime}ms`
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Get return URL or default to dashboard
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl');
      if (returnUrl) {
        console.log('🔄 Redirecting to:', returnUrl);
        router.push(returnUrl);
      }
    } catch (error: any) {
      console.error('💥 Signup error:', {
        message: error.message,
        stack: error.stack,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log('🚪 Logout initiated:', {
        userId: user?.id,
        username: user?.username,
        timestamp: new Date().toISOString()
      });

      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear saved code on logout
      const keysToRemove: string[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('code_')) {
          keysToRemove.push(key);
        }
      });

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('✅ Logout completed, cleared', keysToRemove.length, 'saved code items');
      router.push('/');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if error occurs
      setToken(null);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
