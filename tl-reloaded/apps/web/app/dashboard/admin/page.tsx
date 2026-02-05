'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    School as SchoolIcon,
    Users,
    Video,
    ShieldCheck,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Search,
    Bell,
    CheckCircle2,
    Plus
} from 'lucide-react';
import { getSchools } from '@/lib/school';
import { getStudents, getTeachers } from '@/lib/users';
import { getWebinars } from '@/lib/webinars';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        schools: 0,
        teachers: 0,
        students: 0,
        webinars: 0,
        pendingApprovals: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllStats = async () => {
            setLoading(true);
            try {
                const [schools, teachers, students, webinars] = await Promise.all([
                    getSchools(),
                    getTeachers(),
                    getStudents(),
                    getWebinars()
                ]);

                setStats({
                    schools: schools.length,
                    teachers: teachers.length,
                    students: students.length,
                    webinars: webinars.length,
                    pendingApprovals: schools.filter(s => s.status === 'pending').length
                });
            } catch (err) {
                console.error('Failed to fetch admin stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    const cards = [
        { label: 'Gesamt Schulen', value: stats.schools, icon: SchoolIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Lehrkräfte', value: stats.teachers, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Students', value: stats.students, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Aktive Webinare', value: stats.webinars, icon: Video, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <LayoutDashboard className="w-10 h-10 text-blue-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Willkommen zurück! Hier ist der aktuelle Status Ihres Netzwerks.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-slate-200">
                        <Bell className="w-5 h-5 text-slate-500" />
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 px-6 font-bold shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-all hover:scale-[1.02]">
                        <Plus className="w-5 h-5" />
                        System-Aktion
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="premium-card animate-pulse border-none bg-white rounded-[2rem] h-32 shadow-md">
                            <CardContent className="h-full bg-slate-50/50" />
                        </Card>
                    ))
                ) : (
                    cards.map((card, i) => (
                        <Card key={i} className="premium-card border-none bg-white shadow-xl rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", card.bg, card.color)}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</p>
                                <p className="text-3xl font-black text-slate-900 leading-none">{card.value}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Items */}
                <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem] lg:col-span-2 overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-black text-slate-900">Ausstehende Genehmigungen</CardTitle>
                            <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 font-black text-xs rounded-full">
                                {stats.pendingApprovals} ausstehend
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : stats.pendingApprovals === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <p className="text-slate-400 font-bold">Alles auf dem Laufenden!</p>
                                <p className="text-slate-300 text-sm">Keine Schulen warten auf Genehmigung.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {/* This would map over pending schools if we had a filtered list here */}
                                <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                            <SchoolIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Max-Mustermann-Gymnasium</p>
                                            <p className="text-xs text-slate-400 font-medium">Bewerbung eingegangen vor 2 Stunden</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 border-blue-100">
                                        Prüfen
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="p-6 bg-slate-50/50 flex justify-center">
                            <Link href="/dashboard/admin/schools" className="text-blue-600 font-black text-sm flex items-center gap-2 hover:gap-3 transition-all">
                                Alle Schulen anzeigen
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Stats */}
                <div className="space-y-8">
                    <Card className="premium-card border-none bg-blue-600 shadow-xl rounded-[2rem] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="w-32 h-32 rotate-12" />
                        </div>
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-white/80 font-black text-sm uppercase tracking-widest">System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                <span className="font-black text-2xl">Vollständig Aktiv</span>
                            </div>
                            <p className="text-blue-100 font-medium text-sm leading-relaxed mb-6">Alle Dienste laufen einwandfrei. Letzte Prüfung vor 5 Minuten.</p>
                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold h-12">
                                Systemprüfung
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nächste Webinare</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <span className="text-[10px] font-black uppercase">Mär</span>
                                        <span className="text-lg font-black leading-none">2{i}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">Webinar Integration {i}</p>
                                        <p className="text-xs text-slate-400 font-medium">10:00 Uhr • Zoom</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
