'use client';

import { motion } from 'framer-motion';
import {
    BookOpen,
    Play,
    CheckCircle2,
    Users,
    BarChart3,
    Search,
    Filter,
    ArrowRight,
    Star,
    Layout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CoursesPage() {
    const activeCourses = [
        {
            id: 1,
            title: "Coding Basis-Kurs",
            description: "Die Grundlagen des Programmierens spielerisch lernen mit Block-basierten Sprachen.",
            classes: ["4A", "4C"],
            studentsInvolved: 42,
            averageProgress: 68,
            status: "In Progress",
            rating: 4.8
        },
        {
            id: 2,
            title: "Web-Design Grundlagen",
            description: "HTML & CSS Crashkurs für moderne Webseiten.",
            classes: ["3B"],
            studentsInvolved: 18,
            averageProgress: 25,
            status: "Starter",
            rating: 4.5
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
                        <BookOpen className="w-10 h-10 text-indigo-600" />
                        Kursübersicht
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Verwalten Sie Ihre aktiven Kurse und verfolgen Sie den Lernfortschritt Ihrer Schüler.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20">
                    <Layout className="w-5 h-5" />
                    Bibliothek durchsuchen
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktive Kurse</p>
                        <p className="text-3xl font-black text-slate-900">3</p>
                    </CardContent>
                </Card>
                <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teilnehmende Schüler</p>
                        <p className="text-3xl font-black text-slate-900">65</p>
                    </CardContent>
                </Card>
                <Card className="premium-card border-none bg-white shadow-xl rounded-[2rem]">
                    <CardContent className="p-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Abgeschlossene Lektionen</p>
                        <p className="text-3xl font-black text-slate-900">412</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Courses List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">Aktive Kurse</h3>
                    <div className="flex gap-2">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Kurs suchen..."
                                className="pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600/10 w-64"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="rounded-xl border-slate-100"><Filter className="w-4 h-4" /></Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activeCourses.map((course) => (
                        <Card key={course.id} className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all">
                            <CardHeader className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                        <Play className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-black text-xs">
                                        <Star className="w-3 h-3 fill-amber-600" /> {course.rating}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black text-slate-900 mb-2">{course.title}</CardTitle>
                                <CardDescription className="font-medium text-slate-500 leading-relaxed">
                                    {course.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ø Klassen-Fortschritt</span>
                                        <span className="text-sm font-black text-blue-600">{course.averageProgress}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${course.averageProgress}%` }}
                                            className="h-full bg-blue-600 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                                    <div className="flex -space-x-2">
                                        {course.classes.map((cls, i) => (
                                            <div key={i} className="w-10 h-10 rounded-xl bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 font-black text-xs">
                                                {cls}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">
                                        {course.studentsInvolved} Schüler nehmen teil
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-slate-900 text-white rounded-xl font-bold h-12 hover:bg-slate-800">
                                        Fortsetzen
                                    </Button>
                                    <Button variant="outline" className="rounded-xl border-slate-200 h-12 font-bold px-6">
                                        Statistik
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
