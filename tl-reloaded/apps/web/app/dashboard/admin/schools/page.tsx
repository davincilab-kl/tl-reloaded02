'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    School as SchoolIcon,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    MoreVertical,
    ArrowRight,
    MapPin,
    GraduationCap,
    Users,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getSchools, approveSchool, type School } from '@/lib/school';

export default function SchoolsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const data = await getSchools();
            setSchools(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch schools:', err);
            setError('Verbindung zum Server fehlgeschlagen.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveSchool(id);
            // Update local state without full refresh for better UX
            setSchools(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as const } : s));
        } catch (err) {
            console.error('Failed to approve school:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <SchoolIcon className="w-10 h-10 text-blue-600" />
                        Schulverwaltung
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Verwalten Sie registrierte Schulen und deren Status im TalentsLounge Netzwerk.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchSchools(true)}
                        className={cn("rounded-xl h-12 w-12", isRefreshing && "animate-spin")}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Neue Schule
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Gesamt Schulen', value: schools.length, icon: GraduationCap, color: 'text-blue-500' },
                    { label: 'Aktiv', value: schools.filter(s => s.status === 'active').length, icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Ausstehend', value: schools.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
                    { label: 'Lehrkräfte', value: schools.reduce((acc, s) => acc + (s._count?.teachers || 0), 0), icon: Users, color: 'text-indigo-500' },
                ].map((stat, i) => (
                    <Card key={i} className="premium-card border-none bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="premium-card border-none bg-white shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-100">
                                <TableHead className="font-black text-slate-900 pl-8 h-16">Schulname & Ort</TableHead>
                                <TableHead className="font-black text-slate-900">Code</TableHead>
                                <TableHead className="font-black text-slate-900">Lehrer / Klassen</TableHead>
                                <TableHead className="font-black text-slate-900 text-center">Status</TableHead>
                                <TableHead className="text-right font-black text-slate-900 pr-8">Aktion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-slate-400 font-bold">Lade Schuldaten...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <XCircle className="w-12 h-12 text-rose-500" />
                                            <p className="text-rose-500 font-bold">{error}</p>
                                            <Button variant="outline" onClick={() => fetchSchools()} className="rounded-xl">Erneut versuchen</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : schools.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center text-slate-400 font-bold">
                                        Keine Schulen im System gefunden.
                                    </TableCell>
                                </TableRow>
                            ) : schools.map((school) => (
                                <TableRow key={school.id} className="group hover:bg-blue-50/30 transition-colors border-b border-slate-50">
                                    <TableCell className="pl-8 py-5">
                                        <div className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                            {school.name}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium mt-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {school.postalCode} {school.city}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono text-xs font-bold">
                                            {school.schoolCode}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-4">
                                            <div>
                                                <span className="text-slate-900 font-black">{school._count?.teachers || 0}</span>
                                                <span className="text-slate-400 text-[10px] font-black ml-1 uppercase">Lehrer</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-900 font-black">{school._count?.classes || 0}</span>
                                                <span className="text-slate-400 text-[10px] font-black ml-1 uppercase">Klassen</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {school.status === 'active' ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-wider px-3 py-1">
                                                Aktiviert
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px] uppercase tracking-wider px-3 py-1">
                                                Ausstehend
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            {school.status !== 'active' && (
                                                <Button
                                                    onClick={() => handleApprove(school.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 h-9 font-bold rounded-xl px-4"
                                                >
                                                    Aktivieren
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 h-9 w-9">
                                                <MoreVertical className="w-5 h-5 text-slate-400" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
