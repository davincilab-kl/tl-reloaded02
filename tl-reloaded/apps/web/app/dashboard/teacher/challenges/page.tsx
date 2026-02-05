'use client';

import { motion } from 'framer-motion';
import {
    Trophy,
    Target,
    Users,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    Clock,
    Medal,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ChallengesPage() {
    const activeChallenges = [
        {
            id: 1,
            title: "Coding Winter Cup 2026",
            description: "Der große Schulwettbewerb für kreative Coding-Projekte. Wer baut das innovativste Tool?",
            participants: 154,
            deadline: "15. März 2026",
            status: "active",
            type: "National",
            reward: "T!Coins & Sachpreise"
        },
        {
            id: 2,
            title: "Nachhaltigkeits-Hackathon",
            description: "Entwickelt Lösungen für eine grünere Zukunft unter Verwendung von KI-Tools.",
            participants: 89,
            deadline: "1. April 2026",
            status: "active",
            type: "Regional",
            reward: "Urkunde & T!Score Boost"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Trophy className="w-10 h-10 text-amber-500" />
                        Wettbewerbe
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Motivieren Sie Ihre Schüler mit spannenden Herausforderungen und gewinnen Sie Preise.
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center shrink-0">
                        <Medal className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-black mb-2">Ihre Klasse im Ranking</h2>
                        <p className="text-blue-100 font-medium">
                            Klasse 4A ist aktuell auf Platz #12 im landesweiten T!Score Ranking.
                            Nehmen Sie an neuen Wettbewerben teil, um aufzusteigen!
                        </p>
                    </div>
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90 rounded-2xl font-bold px-8 h-12 shrink-0">
                        Top 100 ansehen
                    </Button>
                </div>
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-30px] left-[10%] w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Challenges List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900">Aktive Challenges</h3>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl"><Search className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {activeChallenges.map((challenge) => (
                            <Card key={challenge.id} className="premium-card border-none bg-white shadow-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-lg">
                                                {challenge.type} Challenge
                                            </Badge>
                                            <h4 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {challenge.title}
                                            </h4>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                <Clock className="w-4 h-4" />
                                                Bis {challenge.deadline}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 font-medium mb-6">
                                        {challenge.description}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-5 h-5 text-blue-500" />
                                                <span className="text-slate-700 font-black">{challenge.participants}</span>
                                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Teilnehmer</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-emerald-500" />
                                                <span className="text-slate-400 font-bold text-xs">{challenge.reward}</span>
                                            </div>
                                        </div>
                                        <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold gap-2 group/btn">
                                            Details & Anmeldung
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black">Wie funktioniert's?</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 font-black text-blue-600 text-sm">1</div>
                                <p className="text-sm font-medium text-slate-600 pt-1">Challenge auswählen und Klasse anmelden.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 font-black text-blue-600 text-sm">2</div>
                                <p className="text-sm font-medium text-slate-600 pt-1">Schüler reichen ihre Projekte ein.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 font-black text-blue-600 text-sm">3</div>
                                <p className="text-sm font-medium text-slate-600 pt-1">T!Coins verdienen und Urkunden sammeln.</p>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl font-bold border-slate-200 mt-4">
                                Mehr erfahren
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="premium-card border-none bg-slate-900 text-white shadow-xl rounded-[2rem] overflow-hidden">
                        <CardContent className="p-8">
                            <Info className="w-10 h-10 text-blue-400 mb-4" />
                            <h4 className="text-lg font-black mb-2">Eigene Challenge?</h4>
                            <p className="text-slate-400 text-sm font-medium mb-6">
                                Möchten Sie einen internen Klassen-Wettbewerb starten? Nutzen Sie unsere Tools zur Bewertung und Preisvergabe.
                            </p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl font-bold">
                                Jetzt erstellen
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
