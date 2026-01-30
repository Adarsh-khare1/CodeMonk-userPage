'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard'); // replace instead of push
    }
  }, [user, loading, router]);

  // Show loading while auth state initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/30">
        {/* Optional: Replace text with spinner for better UX */}
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  // If user is logged in, Home will rarely render
  if (user) return null;

  return (
    <div className="relative min-h-screen bg-black/30">
      <Navbar />
      <Hero />
    </div>
  );
}
