'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Mail,
    MessageSquare,
    MoreHorizontal,
    Search,
    Shield,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { getSchoolById, type School } from '@/lib/school';

export default function ColleaguesPage() {
    const { user } = useAuth();
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.schoolId) {
            fetchSchool(user.schoolId);
        }
    }, [user]);

    const fetchSchool = async (id: string) => {
        try {
            const data = await getSchoolById(id);
            setSchool(data);
        } catch (err) {
            console.error('Failed to fetch colleagues:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const colleagues = school?.teachers || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Users className="w-10 h-10 text-blue-600" />
                        Kollegium
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Alle Lehrkräfte Ihrer Schule ({school?.name}) im Überblick.
                    </p>
                </div>
                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Kollegen suchen..."
                        className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-6 shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleagues.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Keine Kollegen gefunden.</p>
                    </div>
                ) : colleagues.map((colleague: any) => (
                    <Card key={colleague.id} className="premium-card border-none bg-white shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all group border border-transparent hover:border-blue-100 flex flex-col h-full">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 text-2xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm border border-slate-100">
                                    {colleague.firstName?.[0]}{colleague.lastName?.[0]}
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                </Button>
                            </div>
                            <CardTitle className="text-xl font-black text-slate-900">
                                {colleague.firstName} {colleague.lastName}
                            </CardTitle>
                            <CardDescription className="font-bold text-blue-500 flex items-center gap-2 mt-1">
                                <Shield className="w-3.5 h-3.5" />
                                {colleague.role === 'admin' ? 'Schuladministrator' : 'Lehrkraft'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 flex-grow">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {colleague.email}
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    Mitglied seit {new Date(colleague.createdAt).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-8 pt-0 mt-auto flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Chat
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </motion.div>
    );
}
