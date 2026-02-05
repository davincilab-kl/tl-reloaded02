'use client';

import { useState, useEffect } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Star, TrendingUp, Users, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LeaderboardsPage() {
    const [globalTop, setGlobalTop] = useState<any[]>([]);
    const [classTop, setClassTop] = useState<any[]>([]);
    const [schoolTop, setSchoolTop] = useState<any[]>([]);

    useEffect(() => {
        setGlobalTop([
            { id: '1', name: 'Lukas M.', score: 12500, rank: 1, avatar: '/avatars/1.png', level: 12 },
            { id: '2', name: 'Sarah S.', score: 11200, rank: 2, avatar: '/avatars/2.png', level: 11 },
            { id: '3', name: 'Julian K.', score: 9800, rank: 3, avatar: '/avatars/3.png', level: 10 },
        ]);
        setClassTop([
            { id: '1', name: 'Lukas M.', score: 12500, rank: 1, avatar: '/avatars/1.png', level: 12 },
            { id: '4', name: 'Elena R.', score: 8400, rank: 2, avatar: '/avatars/4.png', level: 8 },
            { id: '5', name: 'Max W.', score: 7200, rank: 3, avatar: '/avatars/5.png', level: 7 },
        ]);
        setSchoolTop([
            { id: 'c1', name: '4A - Informatik', score: 8500, rank: 1, level: 15 },
            { id: 'c2', name: '3B - Coding', score: 7200, rank: 2, level: 14 },
            { id: 'c3', name: '4C - Digitales', score: 6800, rank: 3, level: 13 },
        ]);
    }, []);

    const RankIcon = ({ rank }: { rank: number }) => {
        switch (rank) {
            case 1: return <Trophy className="h-7 w-7 text-yellow-500 drop-shadow-md" />;
            case 2: return <Medal className="h-7 w-7 text-slate-400 drop-shadow-sm" />;
            case 3: return <Medal className="h-7 w-7 text-amber-600 drop-shadow-sm" />;
            default: return <Star className="h-7 w-7 text-slate-300 opacity-50" />;
        }
    };

    const LeaderboardList = ({ items }: { items: any[] }) => (
        <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <Card className={cn(
                            "premium-card group hover:bg-slate-50 transition-colors border-l-4",
                            item.rank === 1 ? "border-l-yellow-400" : item.rank === 2 ? "border-l-slate-400" : item.rank === 3 ? "border-l-orange-400" : "border-l-blue-600"
                        )}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <RankIcon rank={item.rank} />
                                    </div>
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={item.avatar} />
                                        <AvatarFallback className="bg-slate-100 text-blue-600 font-bold">
                                            {item.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-none">{item.name}</h3>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Stufe {item.level}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-blue-600">
                                        {item.score.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">T!Coins</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 space-y-10 max-w-5xl mx-auto pb-20"
        >
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    Leaderboard 🏆
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                    Vergleiche deinen Fortschritt mit anderen Schülern und erklimme die Spitze der Rangliste.
                </p>
            </div>

            <Tabs defaultValue="class" className="w-full">
                <div className="flex justify-center mb-10">
                    <TabsList className="bg-slate-100 p-1.5 h-14 rounded-xl border border-slate-200">
                        <TabsTrigger value="class" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-full">
                            Klasse
                        </TabsTrigger>
                        <TabsTrigger value="school" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-full">
                            Schule
                        </TabsTrigger>
                        <TabsTrigger value="global" className="rounded-lg px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-full">
                            Global
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="class" className="space-y-6">
                    <LeaderboardList items={classTop} />
                </TabsContent>
                <TabsContent value="school" className="space-y-6">
                    <LeaderboardList items={schoolTop} />
                </TabsContent>
                <TabsContent value="global" className="space-y-6">
                    <LeaderboardList items={globalTop} />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
