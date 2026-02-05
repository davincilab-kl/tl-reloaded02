'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@repo/db/types';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleAnmelden = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://talentslounge.com/wp-content/uploads/2024/12/TalentsLounge-Logo-Entdecke-Lerne-Wachse.png"
              alt="TalentsLounge"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Right side - Navigation */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <button
                onClick={handleAnmelden}
                className="bg-[#4182FF] hover:bg-[#2d6bff] text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.98]"
              >
                Anmelden
              </button>
            ) : (
              <div className="flex items-center gap-4">
                {/* Dashboard Links */}
                <div className="flex items-center gap-3">
                  {user?.role === UserRole.student && (
                    <Link
                      href="/dashboard/student"
                      className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === UserRole.teacher && (
                    <>
                      <Link
                        href="/dashboard/teacher"
                        className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
                      >
                        Lehrer Dashboard
                      </Link>
                      <Link
                        href="/dashboard/student"
                        className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
                      >
                        Schüler Dashboard
                      </Link>
                    </>
                  )}
                  {user?.role === UserRole.admin && (
                    <>
                      <Link
                        href="/dashboard/admin"
                        className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/dashboard/teacher"
                        className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
                      >
                        Lehrer Dashboard
                      </Link>
                      <Link
                        href="/dashboard/student"
                        className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
                      >
                        Schüler Dashboard
                      </Link>
                    </>
                  )}
                </div>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium hidden sm:inline">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-gray-700 border-2 border-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] text-sm"
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
