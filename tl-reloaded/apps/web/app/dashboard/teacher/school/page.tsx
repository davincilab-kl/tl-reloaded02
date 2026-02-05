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
    School as SchoolIcon,
    MapPin,
    Globe,
    Phone,
    Mail,
    Users,
    BookOpen as BookIcon,
    Calendar,
    Award,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { getSchoolById, type School } from '@/lib/school';

export default function TeacherSchoolPage() {
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
            console.error('Failed to fetch school details:', err);
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

    if (!school) {
        return (
            <div className="text-center py-20">
                <SchoolIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Keine Schul-Informationen gefunden.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 md:p-12">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <SchoolIcon className="w-64 h-64 -rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
                        <SchoolIcon className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase tracking-wider px-3 py-1">
                                {school.schoolType}
                            </Badge>
                            <span className="text-white/60 font-medium text-sm">SKZ: {school.schoolCode}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{school.name}</h1>
                        <div className="flex flex-wrap gap-6 text-white/80 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                {school.postalCode} {school.city}, {school.state}
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                Zertifiziertes Mitglied
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats */}
                <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem] md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl font-black text-slate-900">Überblick</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lehrkräfte</p>
                                <p className="text-2xl font-black text-slate-900">{school._count?.teachers || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <BookIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klassen</p>
                                <p className="text-2xl font-black text-slate-900">{school._count?.classes || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">T-Score (Gesamt)</p>
                                <p className="text-2xl font-black text-slate-900">4,820</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontakt</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                                    <Phone className="w-4 h-4 text-slate-300" />
                                    +43 1 234 567 89
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                                    <Mail className="w-4 h-4 text-slate-300" />
                                    office@{school.name.toLowerCase().replace(/\s/g, '-')}.at
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
                                    <Globe className="w-4 h-4 text-slate-300" />
                                    www.{school.name.toLowerCase().replace(/\s/g, '-')}.at
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-xl font-black text-slate-900">Schulnachrichten</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {[
                                { title: 'Sommersemesterplanung 2024', date: 'Vor 2 Tagen', excerpt: 'Die Planung für das kommende Sommersemester hat begonnen. Bitte reichen Sie...' },
                                { title: 'Neue iPad-Klasse freigeschaltet', date: 'Vor 5 Tagen', excerpt: 'Ab sofort stehen 25 neue iPads für den Informatikunterricht in Raum 302 zur Verfügung.' }
                            ].map((news, i) => (
                                <div key={i} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{news.title}</h4>
                                        <span className="text-xs text-slate-400">{news.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2">{news.excerpt}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-xl font-black text-slate-900">Projekt-Highlights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                                <BookIcon className="w-5 h-5" />
                                            </div>
                                            <div className="font-black text-slate-900 text-sm">Project X-{i}</div>
                                        </div>
                                        <div className="w-full h-24 bg-slate-200 rounded-xl mb-3 flex items-center justify-center text-slate-400">
                                            [Project Thumbnail]
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400">Herausragend</span>
                                            <span className="text-blue-600 font-bold">Details</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
