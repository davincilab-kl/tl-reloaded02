'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImpersonationBar() {
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedUser, setImpersonatedUser] = useState<any>(null);

    useEffect(() => {
        // Logic to check if we are impersonating from localStorage/cookies/auth context
        const impersonationData = localStorage.getItem('impersonation_user');
        if (impersonationData) {
            setIsImpersonating(true);
            setImpersonatedUser(JSON.parse(impersonationData));
        }
    }, []);

    const stopImpersonating = () => {
        localStorage.removeItem('impersonation_user');
        localStorage.removeItem('auth_token'); // Swap back to admin token
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
            localStorage.setItem('auth_token', adminToken);
            localStorage.removeItem('admin_token');
        }
        window.location.href = '/dashboard/admin/schools';
    };

    if (!isImpersonating) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-orange-600 text-white p-2 px-6 flex justify-between items-center z-[100] shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-1.5 rounded-full">
                    <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Impersonations-Modus</span>
                    <span className="font-medium">
                        Du handelst als: <span className="underline decoration-2 underline-offset-4">{impersonatedUser?.firstName} {impersonatedUser?.lastName}</span>
                    </span>
                </div>
            </div>

            <Button
                variant="outline"
                className="bg-white text-orange-600 hover:bg-orange-50 border-none transition-all"
                onClick={stopImpersonating}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Administration
            </Button>
        </div>
    );
}
