'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { getClasses, type Class } from '@/lib/class';
import Link from 'next/link';
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
import {
  Users,
  Plus,
  Coins,
  Star,
  X,
  Folder,
  GraduationCap,
  BookOpen,
  Layout,
  Printer,
  MoreHorizontal,
  Search,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      setError('Klassen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            Meine Klassen
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Verwalten Sie Ihre Klassen, Students und deren Lernfortschritt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200 text-slate-600">
            <Printer className="w-5 h-5 mr-2" />
            Exportieren
          </Button>
          <Link href="/dashboard/teacher/classes/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5" />
              Klasse anlegen
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="premium-card animate-pulse border-none bg-white rounded-3xl h-64 shadow-md">
              <CardContent className="h-full bg-slate-50/50" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <p className="text-rose-500 font-bold mb-4">{error}</p>
          <Button onClick={fetchClasses} variant="outline" className="rounded-xl">Erneut versuchen</Button>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-lg">Keine Klassen gefunden.</p>
          <p className="text-slate-400 text-sm">Erstellen Sie Ihre erste Klasse, um zu starten.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {classes.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col"
              >
                <Card className="premium-card border-none bg-white shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all group border border-transparent hover:border-blue-100 flex flex-col h-full">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg">
                        {item.grade || 'Klasse'}
                      </Badge>
                      <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-500">
                      {item.designation || 'Keine Bezeichnung'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/80 rounded-2xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Students</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">{item.stats?.studentCount || 0}</p>
                      </div>
                      <div className="bg-slate-50/80 rounded-2xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Projekte</span>
                        </div>
                        <p className="text-xl font-black text-slate-900">{item.stats?.projectCount || 0}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          Durchschn. T-Score
                        </span>
                        <span className="text-slate-900 font-black">{item.stats?.tScore || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold flex items-center gap-2">
                          <Coins className="w-4 h-4 text-blue-500" />
                          Gesamt T-Coins
                        </span>
                        <span className="text-slate-900 font-black">{item.stats?.totalTCoins || 0}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0 mt-auto">
                    <Link
                      href={`/dashboard/teacher/classes/${item.id}`}
                      className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all group/btn"
                    >
                      Klasse verwalten
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
