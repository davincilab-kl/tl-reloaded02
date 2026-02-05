'use client';

import { useAuth } from '@/providers/auth-provider';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Layout,
  Trophy,
  Star,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Aktive Kurse', value: '3', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Projekte', value: '12', icon: Layout, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'T!Coins', value: '1,240', icon: Star, color: 'text-amber-500', bg: 'bg-amber-100' },
    { label: 'Rang', value: '#4', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  const recentActivities = [
    { id: 1, title: 'Basics of JavaScript abgeschlossen', time: 'Vor 2 Stunden', type: 'course' },
    { id: 2, title: 'Neues Projekt "Mein Portfolio" erstellt', time: 'Gestern', type: 'project' },
    { id: 3, title: '50 T!Coins verdient', time: 'Vor 2 Tagen', type: 'reward' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-10 max-w-7xl mx-auto pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Hallo, <span className="text-blue-600">{user?.firstName}</span>! 👋
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Schön, dass du wieder da bist. Bereit für die nächste Lektion?
          </p>
        </div>
        <Button size="lg" className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all font-bold group">
          Lernen fortsetzen
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="premium-card group bg-white/50 backdrop-blur-sm">
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-50 text-blue-600">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-none font-bold text-xs bg-emerald-50 text-emerald-600">
                    +12% <TrendingUp className="ml-1 h-3 w-3" />
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Courses & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Aktive Kurse
            </h2>
            <Button variant="ghost" className="font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">Alle anzeigen</Button>
          </div>

          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="premium-card group cursor-pointer border-l-4 border-l-blue-600 hover:bg-slate-50 transition-colors">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Digitales Management {i}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center text-sm text-slate-500 font-medium">
                          <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-500" /> 8/12 Lektionen
                        </div>
                        <div className="flex items-center text-sm text-slate-500 font-medium">
                          <Clock className="mr-1.5 h-4 w-4" /> 4h verbleibend
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: i === 1 ? '75%' : '40%' }} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{i === 1 ? '75%' : '40%'} abgeschlossen</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            Aktivität
          </h2>
          <Card className="premium-card bg-white/50 backdrop-blur-sm">
            <CardContent className="p-6 space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative z-10 border-2 border-white">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    {index !== recentActivities.length - 1 && (
                      <div className="absolute top-8 bottom-[-24px] left-1/2 w-0.5 bg-slate-100 -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                    <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl h-11 font-bold text-slate-600 border-slate-200">Ganzer Verlauf</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
