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
import {
    Video,
    RefreshCw,
    Calendar,
    Clock,
    Users,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getWebinars, syncWebinars, type Webinar } from '@/lib/webinars';

export default function WebinarsPage() {
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWebinars();
    }, []);

    const fetchWebinars = async () => {
        setLoading(true);
        try {
            const data = await getWebinars();
            setWebinars(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching webinars:', err);
            setError('Webinare konnten nicht geladen werden.');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncWebinars();
            await fetchWebinars();
        } catch (err: any) {
            console.error('Error syncing webinars:', err);
        } finally {
            setSyncing(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Video className="w-10 h-10 text-blue-600" />
                        Webinare
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Synchronisieren und verwalten Sie Calendly-Webinare für Lehrkräfte.
                    </p>
                </div>
                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                    <RefreshCw className={cn("w-5 h-5", syncing && "animate-spin")} />
                    {syncing ? 'Synchronisiere...' : 'Jetzt Synchronisieren'}
                </Button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 font-bold">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="premium-card animate-pulse border-none bg-white rounded-3xl h-64 shadow-md">
                            <CardContent className="h-full bg-slate-50/50" />
                        </Card>
                    ))
                ) : webinars.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] shadow-sm border border-slate-50">
                        <Video className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg">Keine Webinare gefunden.</p>
                        <p className="text-slate-400 text-sm">Klicken Sie auf Synchronisieren, um Daten von Calendly zu laden.</p>
                    </div>
                ) : webinars.map((webinar) => (
                    <Card key={webinar.id} className="premium-card border-none bg-white shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full border border-transparent hover:border-blue-100">
                        <CardHeader className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <Badge className={cn(
                                    "font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg border-none",
                                    webinar.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {webinar.status === 'active' ? 'Geplant' : webinar.status}
                                </Badge>
                                <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                    <Video className="w-5 h-5" />
                                </div>
                            </div>
                            <CardTitle className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                {webinar.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6 flex-grow">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    {formatDate(webinar.startTime)}
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    {formatTime(webinar.startTime)} - {formatTime(webinar.endTime)} Uhr
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    {webinar.attendeeCount} Teilnehmer:innen
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold hover:bg-slate-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-all flex items-center justify-center gap-2 h-11">
                                Details ansehen
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </motion.div>
    );
}
