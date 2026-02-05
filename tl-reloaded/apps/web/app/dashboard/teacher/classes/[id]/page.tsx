'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    BookOpen,
    Trophy,
    ShieldCheck,
    TrendingUp,
    ArrowLeft,
    Download,
    Settings,
    MoreVertical,
    Key,
    UserMinus,
    ExternalLink,
    Search,
    ChevronRight,
    GraduationCap,
    Grid3X3,
    FileText,
    CreditCard
} from 'lucide-react';
import {
    getClassById,
    resetStudentPassword,
    deleteClassStudent
} from '@/lib/class';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.id as string;

    const [classData, setClassData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClassData();
    }, [classId]);

    const fetchClassData = async () => {
        setLoading(true);
        try {
            const data = await getClassById(classId);
            setClassData(data);
        } catch (err) {
            console.error('Failed to fetch class details:', err);
            alert('Klasse konnte nicht geladen werden');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (studentId: string) => {
        try {
            const result = await resetStudentPassword(classId, studentId);
            alert(`Passwort zurückgesetzt! Neues Passwort: ${result.password}`);
        } catch (err) {
            alert('Passwort-Reset fehlgeschlagen');
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm('Möchten Sie diesen Schüler wirklich aus der Klasse entfernen?')) return;

        try {
            await deleteClassStudent(classId, studentId);
            alert('Schüler erfolgreich entfernt');
            fetchClassData(); // Refresh data
        } catch (err) {
            alert('Fehler beim Löschen des Schülers');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Klassendaten werden geladen...</p>
            </div>
        );
    }

    if (!classData) return null;

    const stats = [
        { label: 'Schüler:innen', value: classData.stats.studentCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'T!Coins', value: classData.stats.totalTCoins, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Gesamt Schuljahr' },
        { label: 'T!Score', value: classData.stats.tScore, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Ø pro Schüler:in' },
        { label: 'Projekte', value: classData.stats.projectCount, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                Klasse {classData.name}
                            </h1>
                            <Badge className="bg-blue-600 text-white border-none px-3 py-1 font-black text-xs rounded-full">
                                {classData.grade || 'N/A'}. Stufe
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium">
                            {classData.school?.name} • Schuljahr {classData.schoolYear?.name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl font-bold gap-2">
                                <Download className="w-4 h-4" />
                                Exportieren
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                            <DropdownMenuItem className="font-bold py-3 cursor-pointer">
                                <Grid3X3 className="w-4 h-4 mr-2" /> XLSX Schülerliste
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-bold py-3 cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" /> PDF Login-Kärtchen
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-bold py-3 cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" /> PDF Schülerliste
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                        <Settings className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="premium-card border-none bg-white shadow-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                {stat.sub && (
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.sub}</span>
                                )}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Tabs Container */}
            <Tabs defaultValue="students" className="w-full space-y-6">
                <TabsList className="bg-white/50 backdrop-blur p-1 rounded-2xl border border-slate-100 w-full md:w-auto h-auto grid grid-cols-3 md:flex md:flex-wrap">
                    <TabsTrigger value="students" className="rounded-xl py-3 px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                        Schüler:innen
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="rounded-xl py-3 px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                        Projekte
                    </TabsTrigger>
                    <TabsTrigger value="challenges" className="rounded-xl py-3 px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                        Wettbewerbe
                    </TabsTrigger>
                    <TabsTrigger value="licenses" className="rounded-xl py-3 px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                        Lizenzen
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="rounded-xl py-3 px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 transition-all">
                        Kurse
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="mt-0 outline-none">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-50 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="text-2xl font-black text-slate-900">Klassenliste</CardTitle>
                                <div className="relative w-full md:w-72 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Nach Namen suchen..."
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/10 transition-all outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">T!Coins</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Projekte</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivität</th>
                                            <th className="px-8 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {classData.students?.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-20 text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold">Noch keine Schüler:innen vorhanden</p>
                                                    <Button variant="link" className="text-blue-600 font-black mt-2">
                                                        Schüler:innen hinzufügen
                                                    </Button>
                                                </td>
                                            </tr>
                                        ) : (
                                            classData.students?.filter((s: any) =>
                                                `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).map((student: any) => (
                                                <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                                                                {student.firstName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 leading-none mb-1">{student.firstName} {student.lastName}</p>
                                                                <p className="text-xs text-slate-400 font-medium">{student.username || 'Benutzername'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                                                            <span className="font-black text-slate-700">{student.tCoinsBalance || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <Badge variant="outline" className="rounded-lg border-slate-100 text-slate-600 font-black text-[10px]">
                                                            {student.projectCount || 0} Projekte
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs text-slate-400 font-medium">aktiv vor 7.7 Monaten</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white border-none">
                                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                                                                <DropdownMenuItem className="font-bold py-2.5 px-4 cursor-pointer">
                                                                    <ExternalLink className="w-4 h-4 mr-2" /> Schüler Dashboard
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="font-bold py-2.5 px-4 cursor-pointer text-blue-600"
                                                                    onClick={() => handleResetPassword(student.id)}
                                                                >
                                                                    <Key className="w-4 h-4 mr-2" /> Passwort Reset
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="font-bold py-2.5 px-4 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleDeleteStudent(student.id)}
                                                                >
                                                                    <UserMinus className="w-4 h-4 mr-2" /> Löschen
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] p-20 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <p className="text-slate-400 font-bold">Klassenprojekte</p>
                        <p className="text-slate-300 text-sm mt-1">Hier erscheinen die Fortschritte der gesamten Klasse.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="licenses">
                    <Card className="premium-card border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black text-slate-900">Zugewiesene Kurspakete</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {classData.coursePackages?.map((cp: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-[2rem] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-blue-50">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                            <GraduationCap className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 mb-1">{cp.coursePackage?.title}</p>
                                            <p className="text-xs text-slate-400 font-medium mb-3">{cp.coursePackage?.licenseCount} Lizenzen • Gültig bis Aug 2026</p>
                                            <Button variant="ghost" className="h-8 px-0 text-blue-600 font-black text-xs hover:bg-transparent flex items-center gap-1">
                                                Inhalte ansehen <ChevronRight className="w-3 h-3 text-blue-400" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-400">Paket hinzufügen</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
