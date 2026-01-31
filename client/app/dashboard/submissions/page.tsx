'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface MySubmission {
  problemId: string;
  title: string;
  slug: string;
  language: string;
  lastAcceptedAt: string;
}


const STATUS_DISPLAY: Record<string, string> = {
  'Accepted': 'Accepted',
  'Wrong Answer': 'Wrong Answer',
  'Compilation Error': 'Compilation Error',
  'Runtime Error': 'Runtime Error',
  'Time Limit Exceeded': 'Time Limit Exceeded',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function DashboardSubmissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('returnUrl', '/dashboard/submissions');
      router.push('/');
      return;
    }
    if (!user) return;

    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/users/solved');
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, authLoading, router]);

  const handleRowClick = (sub: MySubmission) => {
    router.push(`/problems/${sub.slug}`);

  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-8">Submissions</h1>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 font-semibold text-gray-200">Problem Title</th>
                  <th className="px-6 py-4 font-semibold text-gray-200">Language</th>
                  <th className="px-6 py-4 font-semibold text-gray-200">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-200">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr
                      key={sub.problemId}  
                      onClick={() => handleRowClick(sub)}
                      className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-white">{sub.title}</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{sub.language}</td>
                      <td className="px-6 py-4text-green-400">Accepted</td>
                      <td className="px-6 py-4 text-gray-400">{formatDateTime(sub.lastAcceptedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
