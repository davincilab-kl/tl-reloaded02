'use client';

import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@repo/db/types';

export function AuthRedirect() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.student) {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/teacher');
      }
    }
  }, [isAuthenticated, user, router]);

  return null;
}
