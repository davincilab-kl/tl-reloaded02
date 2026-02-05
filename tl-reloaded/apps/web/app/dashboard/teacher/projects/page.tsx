'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    BookOpen,
    Search,
    Filter,
    MoreVertical,
    ArrowRight,
    User,
    Clock,
    CheckCircle2,
    Plus,
    BarChart3
} from 'lucide-react';
import { getAllProjects, type Project } from '@/lib/projects';

export default function TeacherProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await getAllProjects();
            setProjects(data || []);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.author?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.author?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-10 h-10 text-blue-600" />
                        Projekte
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Alle eingereichten und veröffentlichten Projekte Ihrer Students.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Statistik
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Neues Projekt
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Projekt oder Student:in suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-6 shadow-xl shadow-slate-200/30 focus:border-blue-500 focus:ring-0 outline-none font-medium transition-all"
                    />
                </div>
                <Button variant="outline" className="rounded-2xl h-14 px-6 border-slate-100 bg-white shadow-xl shadow-slate-200/30 font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter
                </Button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="premium-card animate-pulse border-none bg-white rounded-3xl h-64 shadow-md">
                            <CardContent className="h-full bg-slate-50/50" />
                        </Card>
                    ))
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <BookOpen className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Keine Projekte gefunden.</p>
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <Card key={project.id} className="premium-card border-none bg-white shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full border border-transparent hover:border-blue-100">
                            <div className="p-6 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className={cn(
                                        "font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg border-none",
                                        project.status === 'published' ? "bg-emerald-50 text-emerald-600" :
                                            project.status === 'submitted_for_review' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {project.status === 'published' ? 'Veröffentlicht' :
                                            project.status === 'submitted_for_review' ? 'Review ausstehend' : project.status}
                                    </Badge>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                        {project.type}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                    {project.title}
                                </h3>
                            </div>

                            <CardContent className="flex-grow space-y-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                                        {project.author?.firstName?.[0]}{project.author?.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{project.author?.firstName} {project.author?.lastName}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.class?.name || 'Klasse'}</p>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                    {project.description || 'Keine Beschreibung verfügbar.'}
                                </p>
                            </CardContent>

                            <div className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-slate-50 group-hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(project.updatedAt).toLocaleDateString('de-DE')}
                                </div>
                                <Link
                                    href={`/dashboard/teacher/projects/${project.id}`}
                                    className="text-blue-600 font-black text-sm flex items-center gap-1 group/link"
                                >
                                    Details
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </motion.div>
    );
}

import Link from 'next/link';
