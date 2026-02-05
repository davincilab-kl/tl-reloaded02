'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { UserRole } from '@repo/db/types';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export function RoleGuard({
    children,
    allowedRoles,
    redirectTo = '/dashboard'
}: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect if role is not allowed
                // If it's a student trying to see teacher/admin stuff, send to student dashboard
                // If it's a teacher trying to see admin stuff, send to teacher dashboard
                let target = redirectTo;
                if (user.role === 'student') target = '/dashboard/student';
                if (user.role === 'teacher') target = '/dashboard/teacher';

                router.push(target);
            }
        }
    }, [user, isLoading, allowedRoles, router, redirectTo]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // If not loaded or role not allowed, render nothing (effect will redirect)
    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
