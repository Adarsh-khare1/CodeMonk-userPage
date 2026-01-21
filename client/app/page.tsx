'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Code2, TrendingUp, Users, Zap } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Practice Coding. Master Algorithms.
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Improve your coding skills with curated problems, AI feedback, and detailed analytics.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/problems"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Browse Problems
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <Zap className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Feedback</h3>
            <p className="text-gray-400">
              Get instant feedback on your solutions with AI-powered code analysis and optimization suggestions.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-400">
              Monitor your progress with detailed analytics, activity heatmaps, and streak tracking.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <Users className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-400">
              Discuss problems, share solutions, and learn from the community in the comment sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
