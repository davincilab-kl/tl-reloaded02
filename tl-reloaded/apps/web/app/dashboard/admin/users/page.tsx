'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    Users as UsersIcon,
    Plus,
    Search,
    RefreshCw,
    XCircle,
    UserCircle,
    Mail,
    Calendar,
    ChevronRight,
    UserCog,
    GraduationCap,
    School as SchoolIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTeachers, getStudents, impersonateUser, type UserProfile } from '@/lib/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UsersPage() {
    const [teachers, setTeachers] = useState<UserProfile[]>([]);
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('teachers');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const [teachersData, studentsData] = await Promise.all([
                getTeachers(),
                getStudents()
            ]);
            setTeachers(teachersData || []);
            setStudents(studentsData || []);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError('Verbindung zum Server fehlgeschlagen.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleImpersonate = async (userId: string) => {
        try {
            const user = await impersonateUser(userId);
            // In a real app, we'd update the auth state and redirect
            // For now, we show a success message or handle it as per project patterns
            alert(`Impersonating ${user.firstName} ${user.lastName}`);
        } catch (err) {
            console.error('Impersonation failed:', err);
        }
    };

    const filteredUsers = (activeTab === 'teachers' ? teachers : students).filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <UsersIcon className="w-10 h-10 text-blue-600" />
                        Benutzerverwaltung
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Verwalten Sie alle Lehrkräfte und Schüler im TalentsLounge Netzwerk.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchData(true)}
                        className={cn("rounded-xl h-12 w-12", isRefreshing && "animate-spin")}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Benutzer einladen
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overlay */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Gesamt Benutzer', value: teachers.length + students.length, icon: UsersIcon, color: 'text-blue-500' },
                    { label: 'Lehrkräfte', value: teachers.length, icon: UserCog, color: 'text-indigo-500' },
                    { label: 'Schüler', value: students.length, icon: GraduationCap, color: 'text-emerald-500' },
                    { label: 'Inaktiv', value: 0, icon: XCircle, color: 'text-slate-400' },
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

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Tabs defaultValue="teachers" className="w-full md:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-100 h-14 shadow-sm">
                        <TabsTrigger value="teachers" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 h-full">
                            Lehrkräfte
                        </TabsTrigger>
                        <TabsTrigger value="students" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 h-full">
                            Schüler
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Suchen nach Name oder E-Mail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-600/20 font-medium transition-all"
                    />
                </div>
            </div>

            {/* Main Table Card */}
            <Card className="premium-card border-none bg-white shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-b border-slate-100">
                                <TableHead className="font-black text-slate-900 pl-8 h-16 text-xs uppercase tracking-wider">Benutzer</TableHead>
                                <TableHead className="font-black text-slate-900 text-xs uppercase tracking-wider">Kontakt</TableHead>
                                <TableHead className="font-black text-slate-900 text-xs uppercase tracking-wider">Registriert am</TableHead>
                                <TableHead className="font-black text-slate-900 text-xs uppercase tracking-wider text-center">Rolle</TableHead>
                                <TableHead className="text-right font-black text-slate-900 pr-8 text-xs uppercase tracking-wider">Aktion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-slate-400 font-bold">Lade Benutzerdaten...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <XCircle className="w-12 h-12 text-rose-500" />
                                            <p className="text-rose-500 font-bold">{error}</p>
                                            <Button variant="outline" onClick={() => fetchData()} className="rounded-xl">Erneut versuchen</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-32 text-center text-slate-400 font-bold">
                                        Keine Benutzer gefunden.
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((u) => (
                                <TableRow key={u.id} className="group hover:bg-blue-50/30 transition-colors border-b border-slate-50">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 rounded-2xl shadow-sm border-2 border-white">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.firstName}`} />
                                                <AvatarFallback className="bg-blue-50 text-blue-600 font-black">
                                                    {u.firstName[0]}{u.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                                                    {u.firstName} {u.lastName}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wide mt-0.5">
                                                    ID: {u.id.split('-')[0]}...
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                                                <Mail className="w-3.5 h-3.5 text-slate-300" />
                                                {u.email || 'Keine E-Mail'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            {new Date(u.createdAt).toLocaleDateString('de-DE')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(
                                            "border-none font-black text-[10px] uppercase tracking-wider px-3 py-1",
                                            u.role === 'admin' ? "bg-purple-50 text-purple-600" :
                                                u.role === 'teacher' ? "bg-indigo-50 text-indigo-600" :
                                                    "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleImpersonate(u.id)}
                                                className="rounded-xl font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
                                            >
                                                <UserCircle className="w-4 h-4" />
                                                Login als
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 h-9 w-9">
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
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
