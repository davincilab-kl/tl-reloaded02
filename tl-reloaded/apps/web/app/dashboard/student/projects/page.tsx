'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Layout,
    Clock,
    CheckCircle2,
    Eye,
    MessageSquare,
    MoreVertical,
    Folder,
    Code2,
    Palette,
    Globe,
    ArrowRight,
    Star,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for student projects
        const mockProjects = [
            {
                id: '1',
                title: 'Space Adventure',
                type: 'Scratch',
                status: 'published',
                lastModified: 'vor 2 Tagen',
                thumbnail: null,
                tCoins: 120,
                stars: 5,
                feedback: 3
            },
            {
                id: '2',
                title: 'Python Snake Game',
                type: 'Python',
                status: 'draft',
                lastModified: 'vor 5 Stunden',
                thumbnail: null,
                tCoins: 0,
                stars: 0,
                feedback: 0
            },
            {
                id: '3',
                title: 'My Personal Website',
                type: 'HTML/CSS',
                status: 'review',
                lastModified: 'vor 1 Woche',
                thumbnail: null,
                tCoins: 45,
                stars: 2,
                feedback: 1
            },
        ];

        setTimeout(() => {
            setProjects(mockProjects);
            setLoading(false);
        }, 800);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-wider px-3 py-1">Veröffentlicht</Badge>;
            case 'review':
                return <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px] uppercase tracking-wider px-3 py-1">In Prüfung</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase tracking-wider px-3 py-1">Entwurf</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Scratch': return <Palette className="w-5 h-5 text-orange-500" />;
            case 'Python': return <Code2 className="w-5 h-5 text-blue-500" />;
            case 'HTML/CSS': return <Globe className="w-5 h-5 text-indigo-500" />;
            default: return <Layout className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 space-y-10 max-w-7xl mx-auto pb-24"
        >
            {/* Header section with Stats overlap */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Folder className="w-10 h-10 text-blue-600" />
                        Meine Projekte
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Erstelle, bearbeite und verwalte deine kreativen Projekte.
                    </p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 px-8 font-bold shadow-lg shadow-blue-500/20 group">
                    <Link href="/dashboard/student/projects/new" className="flex items-center gap-2">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Neues Projekt starten
                    </Link>
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Gesamt Projekte', value: projects.length, icon: Folder, color: 'text-blue-500' },
                    { label: 'T!Coins verdient', value: '165', icon: Star, color: 'text-amber-500' },
                    { label: 'Veröffentlicht', value: '1', icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'In Bearbeitung', value: '2', icon: Clock, color: 'text-slate-400' },
                ].map((stat, i) => (
                    <Card key={i} className="premium-card bg-white/70 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="rounded-3xl border-slate-100 overflow-hidden h-[400px] animate-pulse bg-slate-50" />
                    ))
                ) : projects.map((project, idx) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group"
                    >
                        <Card className="premium-card rounded-3xl bg-white border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full active:scale-[0.98]">
                            {/* Project Image Placeholder */}
                            <div className="aspect-video bg-slate-100 relative overflow-hidden group-hover:bg-slate-200 transition-colors">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300 opacity-50 group-hover:scale-110 transition-transform duration-700">
                                    <Layout className="w-16 h-16" />
                                </div>
                                <div className="absolute top-4 left-4">
                                    {getStatusBadge(project.status)}
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" size="icon" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg">
                                        <MoreVertical className="w-5 h-5 text-slate-600" />
                                    </Button>
                                </div>
                            </div>

                            <CardHeader className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    {getTypeIcon(project.type)}
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{project.type}</span>
                                </div>
                                <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-slate-400 font-bold text-xs mt-2 uppercase tracking-tight">
                                    <Clock className="w-3.5 h-3.5" />
                                    {project.lastModified} bearbeitet
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-6 pb-6 flex-grow">
                                <div className="flex items-center gap-6 py-4 border-y border-slate-50">
                                    <div className="flex flex-col items-center">
                                        <span className="text-amber-500 font-black text-lg">{project.tCoins}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">T!Coins</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-blue-500 font-black text-lg">{project.stars}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sterne</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-emerald-500 font-black text-lg">{project.feedback}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Feedback</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 pt-0 flex gap-3">
                                <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-blue-500/10">
                                    <Link href={`/dashboard/student/projects/${project.id}/edit`}>Bearbeiten</Link>
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200 hover:bg-slate-50" asChild>
                                    <Link href={`/projects/${project.id}`} target="_blank">
                                        <ExternalLink className="w-5 h-5 text-slate-600" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
