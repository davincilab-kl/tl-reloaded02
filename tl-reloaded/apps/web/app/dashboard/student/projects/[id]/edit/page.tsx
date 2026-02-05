'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Save,
    Play,
    Share2,
    Undo2,
    Redo2,
    ChevronLeft,
    Settings,
    HelpCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProjectWorkspace({ params }: { params: { id: string } }) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [project, setProject] = useState<any>(null);

    const saveProject = useCallback(async () => {
        setIsSaving(true);
        try {
            // Logic to get project JSON from Scratch VM and save to BullsMQ/API
            await fetch(`/api/projects/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: '{ "project": "data" }' }), // Placeholder
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [params.id]);

    useEffect(() => {
        // Auto-save every 30 seconds
        const interval = setInterval(saveProject, 30000);
        return () => clearInterval(interval);
    }, [saveProject]);

    return (
        <div className="flex flex-col h-screen bg-[#f9f9f9]">
            {/* Workspace Header */}
            <header className="h-12 bg-primary text-white flex items-center justify-between px-4 shadow-md">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
                        <a href="/dashboard/student">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Dashboard
                        </a>
                    </Button>
                    <div className="h-4 w-px bg-white/20" />
                    <h1 className="font-bold tracking-tight truncate max-w-[200px]">
                        {project?.title || 'Mein tolles Projekt'}
                    </h1>
                    <Badge variant="secondary" className="bg-white/10 text-white border-none hover:bg-white/20 text-[10px] uppercase">
                        Entwurf
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-[10px] text-white/60 mr-2 flex items-center">
                        {isSaving ? (
                            <>
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Speichere...
                            </>
                        ) : lastSaved ? (
                            `Zuletzt gespeichert um ${lastSaved.toLocaleTimeString()}`
                        ) : (
                            'Noch nicht gespeichert'
                        )}
                    </div>
                    <Button size="sm" variant="secondary" className="h-8 bg-white text-primary hover:bg-white/90" onClick={saveProject}>
                        <Save className="h-4 w-4 mr-2" /> Speichern
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-white hover:bg-white/10">
                        <Share2 className="h-4 w-4 mr-2" /> Einreichen
                    </Button>
                </div>
            </header>

            {/* Main Workspace Area (Scratch Placeholder) */}
            <main className="flex-grow flex overflow-hidden">
                {/* Sidebar / Tools */}
                <aside className="w-16 bg-white border-r flex flex-col items-center py-4 gap-6 shadow-sm">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                        <Undo2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                        <Redo2 className="h-5 w-5" />
                    </Button>
                    <div className="flex-grow" />
                    <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground">
                        <HelpCircle className="h-5 w-5" />
                    </Button>
                </aside>

                {/* Scratch GUI Container */}
                <div className="flex-grow bg-[#fff] relative flex flex-col">
                    <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button size="sm" className="bg-[#4c97ff] text-white hover:bg-[#3d7edb]">Skripte</Button>
                            <Button size="sm" variant="ghost">Kostüme</Button>
                            <Button size="sm" variant="ghost">Klänge</Button>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex bg-muted rounded-lg p-1">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-md">
                                    <div className="w-3 h-3 bg-[#4cb050] rounded-full" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-md">
                                    <div className="w-3 h-3 bg-[#ff4c4c] rounded-full" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow flex items-center justify-center border-dashed border-2 border-muted m-8 rounded-2xl bg-muted/10">
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                            <p className="text-muted-foreground">Hier wird die Scratch-GUI geladen...</p>
                            <Badge variant="outline">Scratch-VM Integration</Badge>
                        </div>
                    </div>
                </div>

                {/* Assets / Stage Management Panel */}
                <aside className="w-80 bg-white border-l p-4 space-y-6 shadow-sm overflow-y-auto">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Figuren</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-square bg-muted/30 rounded-lg border-2 border-transparent hover:border-primary/40 cursor-pointer flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 bg-muted rounded-full mb-1" />
                                    <span className="text-[10px]">Sprite {i}</span>
                                </div>
                            ))}
                            <div className="aspect-square bg-muted/20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/30">
                                <span className="text-lg text-muted-foreground">+</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Bühne</h3>
                        <div className="aspect-video bg-muted/30 rounded-lg border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40">
                            <span className="text-[10px]">Hintergrund 1</span>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
