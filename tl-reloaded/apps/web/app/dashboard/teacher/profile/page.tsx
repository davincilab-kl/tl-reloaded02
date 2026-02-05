'use client';

import { motion } from 'framer-motion';
import {
    User,
    Settings,
    Bell,
    Shield,
    LogOut,
    Camera,
    Mail,
    MapPin,
    Globe,
    CheckCircle2,
    Briefcase,
    Calendar,
    GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-5xl mx-auto space-y-8"
        >
            {/* Profile Header Card */}
            <Card className="premium-card border-none bg-white shadow-xl rounded-[3rem] overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                    <div className="absolute top-[-100px] right-[-50px] w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-100px] left-[10%] w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
                </div>
                <CardContent className="px-12 pb-12 relative">
                    <div className="flex flex-col md:flex-row items-end gap-8 -mt-16">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="w-full h-full rounded-[2rem] bg-slate-100 flex items-center justify-center text-blue-600 font-black text-6xl shadow-inner relative overflow-hidden">
                                    {user?.firstName?.[0]}
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center cursor-pointer">
                                        <Camera className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 pb-4 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 leading-none">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <Badge className="bg-blue-100 text-blue-600 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest rounded-full border-none">
                                    Verifizierte Lehrkraft
                                </Badge>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-bold text-sm">
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> Wien, Österreich</span>
                                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-400" /> Informatik & Design</span>
                                <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-purple-400" /> {user?.email}</span>
                            </div>
                        </div>
                        <div className="pb-4 flex gap-3">
                            <Button className="bg-slate-900 text-white rounded-2xl font-bold px-8 h-12">Profil bearbeiten</Button>
                            <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 h-12 w-12"><Settings className="w-5 h-5 text-slate-400" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Info & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] p-10">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-600" /> Über mich
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-10">
                            Leidenschaftliche Lehrkraft für Informatik mit Fokus auf Coding-First-Ansätze. Seit 2024 nutzer ich TalentsLounge, um Schülern die Welt der digitalen Grundbildung näher zu bringen.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: GraduationCap, label: 'Klassen', value: '3' },
                                { icon: CheckCircle2, label: 'Projekte Rev.', value: '154' },
                                { icon: Calendar, label: 'Dabei seit', value: 'Okt 2024' },
                                { icon: Globe, label: 'Sprachen', value: 'DE, EN' },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-lg font-black text-slate-700">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] p-10">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-blue-600" /> Sicherheit & Privatsphäre
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-slate-50">
                                <div>
                                    <p className="font-bold text-slate-900">Passwort ändern</p>
                                    <p className="text-sm font-medium text-slate-400">Zuletzt aktualisiert vor 3 Monaten</p>
                                </div>
                                <Button variant="outline" className="rounded-xl font-bold">Aktualisieren</Button>
                            </div>
                            <div className="flex items-center justify-between py-4 border-b border-slate-50">
                                <div>
                                    <p className="font-bold text-slate-900">Zwei-Faktor-Authentifizierung</p>
                                    <p className="text-sm font-medium text-slate-400">Erhöhen Sie die Sicherheit Ihres Kontos</p>
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-600 font-black text-[10px] py-1 px-3 rounded-full uppercase tracking-wider">Aktiv</Badge>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-bold text-slate-900 text-rose-600">Account löschen</p>
                                    <p className="text-sm font-medium text-slate-400">Alle Daten unwiderruflich entfernen</p>
                                </div>
                                <Button variant="ghost" className="text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 rounded-xl">Löschen</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-8">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] p-10">
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <Bell className="w-6 h-6 text-blue-600" /> Benachrichtigungen
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'E-Mail Benachrichtigungen', active: true },
                                { label: 'Kurs-Fortschritte', active: true },
                                { label: 'Projekt-Abgaben', active: true },
                                { label: 'Neue Wettbewerbe', active: false },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                    <div className={cn(
                                        "w-10 h-6 rounded-full transition-all relative cursor-pointer",
                                        item.active ? "bg-blue-600" : "bg-slate-200"
                                    )}>
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                            item.active ? "right-1" : "left-1"
                                        )} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="premium-card border-none bg-slate-50 shadow-inner rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                        <LogOut className="w-12 h-12 text-slate-300 mb-4" />
                        <h4 className="text-lg font-black text-slate-900 mb-2">Abmelden?</h4>
                        <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">
                            Möchten Sie sich wirklich von Ihrem Lehrer-Account abmelden?
                        </p>
                        <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold h-12">
                            Jetzt abmelden
                        </Button>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
