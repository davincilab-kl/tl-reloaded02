'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { authClient } from '@/lib/auth';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  Trophy,
  MessageSquare,
  GraduationCap,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@repo/db/types';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/dashboard/teacher') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    {
      label: 'Schule',
      icon: School,
      key: 'school',
      children: [
        { label: 'Übersicht', href: '/dashboard/teacher/school' },
        { label: 'Lehrkräfte', href: '/dashboard/teacher/school/teachers' },
      ]
    },
    { label: 'Klassen', href: '/dashboard/teacher/classes', icon: Users },
    { label: 'Projekte', href: '/dashboard/teacher/projects', icon: BookOpen },
    { label: 'Wettbewerbe', href: '/dashboard/teacher/challenges', icon: Trophy },
    {
      label: 'Kurse',
      icon: GraduationCap,
      key: 'courses',
      children: [
        { label: 'Kursübersicht', href: '/dashboard/teacher/courses' },
        { label: 'Kurspakete', href: '/dashboard/teacher/course-packages' },
        { label: 'Bestellverlauf', href: '/dashboard/teacher/course-packages/orders' },
      ]
    },
    { label: 'Nachrichten', href: '/dashboard/teacher/messages', icon: MessageSquare },
  ];

  const handleLogout = () => {
    authClient.logout();
    router.push('/');
  };

  return (
    <RoleGuard allowedRoles={[UserRole.teacher, UserRole.admin]}>
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
          <span className="font-bold text-xl text-blue-600">TalentsLounge</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={cn(
            "bg-white border-r border-gray-200 w-64 fixed md:sticky top-0 h-screen overflow-y-auto transition-transform duration-300 z-40 flex flex-col",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="p-6 border-b border-gray-200 hidden md:block">
            <span className="font-bold text-2xl text-blue-600 tracking-tight">TalentsLounge</span>
          </div>

          <div className="p-4 flex-1">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                          isActive(item.children[0]?.href || '')
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            openDropdown === item.key ? "rotate-180" : ""
                          )}
                        />
                      </button>

                      {openDropdown === item.key && (
                        <div className="pl-12 space-y-1 py-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block px-4 py-2 text-sm rounded-lg transition-colors",
                                isActive(child.href)
                                  ? "text-blue-600 bg-blue-50/50 font-medium"
                                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                              )}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                        isActive(item.href!)
                          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <Link href="/dashboard/teacher/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {user?.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-gray-500">Lehrkraft</p>
              </div>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 gap-3" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              Abmelden
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen md:h-auto">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </main>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </RoleGuard>
  );
}
