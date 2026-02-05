'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { authClient } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (!isLoading) {
      // Check both the auth context and the auth client
      const isAuth = authClient.isAuthenticated();
      const hasUser = !!user || !!authClient.getUser();

      // If not authenticated, redirect to home
      if (!isAuth || !hasUser) {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  // Double check authentication before rendering
  const isAuth = authClient.isAuthenticated();
  const hasUser = !!user || !!authClient.getUser();

  // Don't render children if not authenticated (will redirect)
  if (!isAuth || !hasUser) {
    return null;
  }

  return <>{children}</>;
}
