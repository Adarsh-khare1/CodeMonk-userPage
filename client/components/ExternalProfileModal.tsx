'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ExternalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'leetcode' | 'codeforces' | 'codechef' | null;
  existingProfile: any;
  onSave: (platform: string, profile: any) => Promise<void>;
}

export default function ExternalProfileModal({
  isOpen,
  onClose,
  platform,
  existingProfile,
  onSave,
}: ExternalProfileModalProps) {
  const [username, setUsername] = useState('');
  const [solved, setSolved] = useState(0);
  const [rating, setRating] = useState(0);
  const [maxRating, setMaxRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && existingProfile) {
      setUsername(existingProfile.username || '');
      setSolved(existingProfile.solved || 0);
      setRating(existingProfile.rating || 0);
      setMaxRating(existingProfile.maxRating || 0);
    } else if (isOpen) {
      setUsername('');
      setSolved(0);
      setRating(0);
      setMaxRating(0);
    }
  }, [isOpen, existingProfile]);

  if (!isOpen || !platform) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile: any = { username: username.trim() };
      
      if (platform === 'leetcode') {
        profile.solved = parseInt(String(solved)) || 0;
        profile.rating = parseInt(String(rating)) || 0;
      } else if (platform === 'codeforces') {
        profile.rating = parseInt(String(rating)) || 0;
        profile.maxRating = parseInt(String(maxRating)) || 0;
      } else if (platform === 'codechef') {
        profile.rating = parseInt(String(rating)) || 0;
      }

      await onSave(platform, profile);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const platformNames = {
    leetcode: 'LeetCode',
    codeforces: 'Codeforces',
    codechef: 'CodeChef',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">
            {existingProfile?.username ? 'Edit' : 'Connect'} {platformNames[platform]}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter your {platformNames[platform]} profile information
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {platform === 'leetcode' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Problems Solved</label>
                  <input
                    type="number"
                    value={solved}
                    onChange={(e) => setSolved(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
                  <input
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {platform === 'codeforces' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Rating</label>
                  <input
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Rating</label>
                  <input
                    type="number"
                    value={maxRating}
                    onChange={(e) => setMaxRating(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {platform === 'codechef' && (
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <input
                  type="number"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
