'use client';

import { RoleGuard } from '@/components/RoleGuard';
import { UserRole } from '@repo/db/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { authClient } from '@/lib/auth';
import {
    LayoutDashboard,
    School,
    Video,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return pathname.startsWith(path);
    };

    const navItems = [
        { label: 'Übersicht', href: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Schulverwaltung', href: '/dashboard/admin/schools', icon: School },
        { label: 'Webinare', href: '/dashboard/admin/webinars', icon: Video },
        { label: 'Benutzer', href: '/dashboard/admin/users', icon: Users },
        { label: 'Einstellungen', href: '/dashboard/admin/settings', icon: Settings },
    ];

    const handleLogout = () => {
        authClient.logout();
        router.push('/');
    };

    return (
        <RoleGuard allowedRoles={[UserRole.admin]}>
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row">
                {/* Mobile Header */}
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
                    <span className="font-bold text-xl text-blue-600">TL Admin</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>

                {/* Sidebar */}
                <aside
                    className={cn(
                        "bg-white border-r border-gray-200 w-64 fixed md:sticky top-0 h-screen overflow-y-auto transition-transform duration-300 z-40 flex flex-col",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    )}
                >
                    <div className="p-6 border-b border-gray-200 hidden md:block">
                        <span className="font-bold text-2xl text-blue-600 tracking-tight">Admin Portal</span>
                    </div>

                    <div className="p-4 flex-1">
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                                        isActive(item.href)
                                            ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user?.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                <p className="truncate text-xs text-gray-500">Administrator</p>
                            </div>
                        </div>
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
