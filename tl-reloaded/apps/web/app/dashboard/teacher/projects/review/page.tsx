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
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    Clock,
    Undo,
    MessageSquare,
    Search,
    BookOpen,
    User,
    ArrowRight,
    Filter,
    RefreshCw
} from 'lucide-react';
import { getAllProjects, reviewProject, type Project } from '@/lib/projects';

export default function ProjectReviewPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await getAllProjects();
            // In a real scenario, the API might handle this filtering, 
            // but we'll ensure we only show submitted projects here.
            setProjects(data.filter(p => p.status === 'submitted_for_review'));
        } catch (err) {
            console.error('Failed to fetch projects for review:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (approve: boolean) => {
        if (!selectedProject) return;
        setIsSubmitting(true);
        try {
            await reviewProject(selectedProject.id, approve, feedback);
            setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
            setSelectedProject(null);
            setFeedback('');
        } catch (err) {
            console.error('Failed to submit review:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <CheckCircle className="w-10 h-10 text-blue-600" />
                        Projekt-Review
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Prüfen Sie eingereichte Projekte und geben Sie konstruktives Feedback.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchProjects}
                    className={cn("rounded-xl h-12 w-12", loading && "animate-spin")}
                >
                    <RefreshCw className="w-5 h-5 text-slate-500" />
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
                {/* Projects List sidebar */}
                <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 pb-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />
                        ))
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-50">
                            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold">Keine ausstehenden Reviews.</p>
                        </div>
                    ) : projects.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={cn(
                                "w-full text-left p-5 rounded-3xl transition-all border-2",
                                selectedProject?.id === project.id
                                    ? "bg-blue-50 border-blue-600 shadow-md shadow-blue-200/50"
                                    : "bg-white border-transparent hover:border-slate-100 shadow-sm"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Badge className="bg-white/80 text-blue-600 border-none font-black text-[10px] uppercase px-2 py-0.5 rounded-lg">
                                    {project.type}
                                </Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase">
                                    {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {project.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm font-medium">
                                <User className="w-3.5 h-3.5" />
                                {project.author?.firstName} {project.author?.lastName}
                                <Badge variant="outline" className="ml-auto text-[10px] font-bold border-slate-200">
                                    {project.class?.name || 'Klasse'}
                                </Badge>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Review Terminal */}
                <div className="lg:col-span-8 flex flex-col">
                    <AnimatePresence mode="wait">
                        {selectedProject ? (
                            <motion.div
                                key={selectedProject.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                <Card className="premium-card border-none bg-white shadow-2xl rounded-[2rem] overflow-hidden flex flex-col h-full">
                                    <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900">{selectedProject.title}</h2>
                                                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                                    eingereicht von <span className="text-blue-600 font-bold">{selectedProject.author?.firstName} {selectedProject.author?.lastName}</span>
                                                </p>
                                            </div>
                                            <Button variant="outline" className="rounded-xl border-slate-200 font-bold group">
                                                Projekt öffnen
                                                <ExternalLink className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-grow overflow-y-auto">
                                        <div className="space-y-8">
                                            <section>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Projektbeschreibung</h4>
                                                <p className="text-slate-600 leading-relaxed text-lg">
                                                    {selectedProject.description || 'Keine Beschreibung vorhanden.'}
                                                </p>
                                            </section>

                                            <section>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lehrer-Feedback</h4>
                                                <Textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    placeholder="Geben Sie hier Ihr Feedback ein. Was war gut? Was kann verbessert werden?"
                                                    className="min-h-[200px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-lg p-5"
                                                />
                                            </section>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex gap-4">
                                        <Button
                                            onClick={() => handleReview(false)}
                                            disabled={isSubmitting}
                                            variant="ghost"
                                            className="rounded-2xl h-14 px-8 font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex-1 border-2 border-transparent hover:border-rose-100"
                                        >
                                            <XCircle className="w-5 h-5 mr-3" />
                                            Nachbesserung anfordern
                                        </Button>
                                        <Button
                                            onClick={() => handleReview(true)}
                                            disabled={isSubmitting}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-emerald-500/20 flex-1 flex items-center justify-center transition-all hover:scale-[1.02]"
                                        >
                                            <CheckCircle className="w-5 h-5 mr-3" />
                                            Projekt freigeben
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-slate-50/50 rounded-[2rem] border-4 border-dashed border-slate-100 p-20 text-center">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                                    <MessageSquare className="w-12 h-12 text-blue-100" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Review ausstehend</h3>
                                <p className="text-slate-400 font-medium max-w-sm">Wählen Sie ein Projekt aus der Liste aus, um mit dem Review-Prozess zu beginnen.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
