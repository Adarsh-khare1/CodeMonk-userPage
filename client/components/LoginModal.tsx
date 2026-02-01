'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function LoginModal({ isOpen, onClose, onSuccess, defaultMode = 'login' }: LoginModalProps) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultMode === 'login');
      setError('');
      setEmail('');
      setPassword('');
      setUsername('');
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setSubmitting(false);
          return;
        }
        await signup(username, email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
    setIsLogin(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-[25px] shadow-2xl max-w-md w-full border border-gray-700 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <p className="text-gray-400 text-sm mb-6">
            {isLogin ? 'Login to submit solutions and comment' : 'Create an account to get started'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username"
                  required={!isLogin}
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                  maxLength={30}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {submitting ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:text-blue-300 text-sm">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
