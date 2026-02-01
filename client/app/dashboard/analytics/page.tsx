'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { StreakCards, StatsSummary } from '@/components/StatsCards';
import Loader from '@/components/Loader';

interface Analytics {
  streak: {
    current: number;
    longest: number;
  };
  activityByDate: Array<{ date: string; count: number }>;
  categoryDistribution: Record<string, number>;
  totalSolved: number;
  totalSubmissions: number;
}

interface User {
  externalStats: {
    leetcode: { totalSolved: number; easy: number; medium: number; hard: number };
    codeforces: { totalSolved: number; rating: number };
    codechef: { totalSolved: number; rating: number };
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { user: authUser, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [externalStats, setExternalStats] = useState({
    platform: 'leetcode',
    stats: { totalSolved: 0, easy: 0, medium: 0, hard: 0, rating: 0 },
  });

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/');
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    if (authUser) {
      fetchAnalytics();
      fetchUserProfile();
    }
  }, [authUser]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/users/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateExternalStats = async () => {
    try {
      await api.post('/users/external-stats', {
        platform: externalStats.platform,
        stats: externalStats.stats,
      });
      fetchUserProfile();
      alert('Stats updated successfully!');
    } catch (error) {
      console.error('Error updating stats:', error);
      alert('Failed to update stats');
    }
  };

  const categoryData =
    analytics?.categoryDistribution
      ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
          name,
          value,
        }))
      : [];

  if (loading) {
    return <Loader />;
  }

  if (!authUser || !analytics) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        {/* Streak Stats */}
        <StreakCards current={analytics.streak.current} longest={analytics.streak.longest} />

        {/* Activity Heatmap */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Activity Heatmap</h2>
          <div className="overflow-x-auto">
            <ActivityHeatmap activityByDate={analytics.activityByDate} />
          </div>
        </div>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Problems Solved by Category</h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats Summary */}
        <StatsSummary totalSolved={analytics.totalSolved} totalSubmissions={analytics.totalSubmissions} />

        {/* External Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">External Platform Stats</h2>

          {/* Display Current Stats */}
          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">LeetCode</h3>
                <p>Solved: {userProfile.externalStats.leetcode.totalSolved}</p>
                <p className="text-sm text-gray-400">
                  {userProfile.externalStats.leetcode.easy}E /{' '}
                  {userProfile.externalStats.leetcode.medium}M /{' '}
                  {userProfile.externalStats.leetcode.hard}H
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Codeforces</h3>
                <p>Solved: {userProfile.externalStats.codeforces.totalSolved}</p>
                <p className="text-sm text-gray-400">
                  Rating: {userProfile.externalStats.codeforces.rating}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">CodeChef</h3>
                <p>Solved: {userProfile.externalStats.codechef.totalSolved}</p>
                <p className="text-sm text-gray-400">
                  Rating: {userProfile.externalStats.codechef.rating}
                </p>
              </div>
            </div>
          )}

          {/* Update Stats Form */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="font-semibold mb-4">Update Stats</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select
                  value={externalStats.platform}
                  onChange={(e) =>
                    setExternalStats({ ...externalStats, platform: e.target.value })
                  }
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="codechef">CodeChef</option>
                </select>
              </div>
              {externalStats.platform === 'leetcode' ? (
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Solved</label>
                    <input
                      type="number"
                      value={externalStats.stats.totalSolved}
                      onChange={(e) =>
                        setExternalStats({
                          ...externalStats,
                          stats: { ...externalStats.stats, totalSolved: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Easy</label>
                    <input
                      type="number"
                      value={externalStats.stats.easy}
                      onChange={(e) =>
                        setExternalStats({
                          ...externalStats,
                          stats: { ...externalStats.stats, easy: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Medium</label>
                    <input
                      type="number"
                      value={externalStats.stats.medium}
                      onChange={(e) =>
                        setExternalStats({
                          ...externalStats,
                          stats: { ...externalStats.stats, medium: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hard</label>
                    <input
                      type="number"
                      value={externalStats.stats.hard}
                      onChange={(e) =>
                        setExternalStats({
                          ...externalStats,
                          stats: { ...externalStats.stats, hard: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Solved</label>
                    <input
                      type="number"
                      value={externalStats.stats.totalSolved || 0}
                      onChange={(e) =>
                        setExternalStats({
                          ...externalStats,
                          stats: { ...externalStats.stats, totalSolved: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <input
                      type="number"
                      value={externalStats.stats.rating || 0}
                      onChange={(e) =>
                        setExternalStats({
                          ...externalStats,
                          stats: { ...externalStats.stats, rating: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleUpdateExternalStats}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Update Stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
