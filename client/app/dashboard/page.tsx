'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ExternalProfileModal from '@/components/ExternalProfileModal';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import PlatformCard from '@/components/PlatformCard';
import { StreakCards, StatsSummary } from '@/components/StatsCards';
import { useDashboardData } from '@/lib/hooks/useDashboardData';

interface ExternalProfiles {
  leetcode: { username: string; solved: number; rating: number };
  codeforces: { username: string; rating: number; maxRating: number };
  codechef: { username: string; rating: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'leetcode' | 'codeforces' | 'codechef' | null>(null);

  const { analytics, userProfile, loading: dataLoading, updateProfile, removeProfile } = useDashboardData(authUser);

  useEffect(() => {
    if (!authLoading && !authUser) {
      localStorage.setItem('returnUrl', '/dashboard');
      router.push('/');
    }
  }, [authUser, authLoading, router]);

  const handleSaveProfile = async (platform: string, profile: any) => {
    try {
      await updateProfile(platform, profile);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleRemoveProfile = async (platform: string) => {
    if (!confirm(`Remove ${platform} profile?`)) return;

    try {
      await removeProfile(platform);
    } catch (error) {
      console.error('Error removing profile:', error);
      alert('Failed to remove profile');
    }
  };

  const handleConnect = (platform: 'leetcode' | 'codeforces' | 'codechef') => {
    setSelectedPlatform(platform);
    setModalOpen(true);
  };

  const handleEdit = (platform: 'leetcode' | 'codeforces' | 'codechef') => {
    setSelectedPlatform(platform);
    setModalOpen(true);
  };

  const categoryData =
    analytics?.categoryDistribution
      ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
          name,
          value,
        }))
      : [];

  if (authLoading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!authUser || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

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

        {/* External Platforms */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">External Platforms</h2>

          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PlatformCard
                platform="leetcode"
                profile={userProfile.externalProfiles?.leetcode}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onRemove={handleRemoveProfile}
              />
              <PlatformCard
                platform="codeforces"
                profile={userProfile.externalProfiles?.codeforces}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onRemove={handleRemoveProfile}
              />
              <PlatformCard
                platform="codechef"
                profile={userProfile.externalProfiles?.codechef}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onRemove={handleRemoveProfile}
              />
            </div>
          )}

          {userProfile &&
           !userProfile.externalProfiles?.leetcode?.username &&
           !userProfile.externalProfiles?.codeforces?.username &&
           !userProfile.externalProfiles?.codechef?.username && (
            <div className="mt-6 text-center py-8 text-gray-400">
              <p>No external platforms connected yet.</p>
              <p className="text-sm mt-2">Connect your coding profiles to track your progress across platforms.</p>
            </div>
          )}
        </div>

        <ExternalProfileModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPlatform(null);
          }}
          platform={selectedPlatform}
          existingProfile={selectedPlatform && userProfile?.externalProfiles?.[selectedPlatform]}
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
}
