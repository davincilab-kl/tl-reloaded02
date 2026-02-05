'use client';

import { motion } from 'framer-motion';
import {
    GraduationCap,
    CreditCard,
    Zap,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    ShoppingBag,
    ShoppingCart,
    Info,
    Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CoursePackagesPage() {
    const packages = [
        {
            id: 1,
            title: "Coding Master-Paket",
            subtitle: "Komplette Grundausbildung",
            price: "499€",
            licenses: 30,
            features: ["Alle Lektionen (20+)", "Interaktive Übungen", "Lehrer-Dashboard", "Zertifikate"],
            popular: true,
            color: "bg-blue-600"
        },
        {
            id: 2,
            title: "Web-Starter Paket",
            subtitle: "Einstieg in die Webentwicklung",
            price: "249€",
            licenses: 30,
            features: ["HTML & CSS Basis", "Eigene Webseiten hosten", "Support-Chat", "Kursunterlagen"],
            popular: false,
            color: "bg-indigo-600"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <GraduationCap className="w-10 h-10 text-blue-600" />
                        Kurspakete
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Erweitern Sie Ihr Repertoire mit neuen Kurslizenzen für Ihre Klassen.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl h-12 px-6 font-bold gap-2">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                        Gutschein einlösen
                    </Button>
                </div>
            </div>

            {/* Active Licenses Banner */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black mb-1">Status: Ausreichend Lizenzen</h2>
                            <p className="text-slate-400 font-medium">
                                Sie haben aktuell 12 ungenutzte Lizenzen. Diese können Sie jeder Klasse zuweisen.
                            </p>
                        </div>
                    </div>
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold px-8 h-12 truncate">
                        Lizenzen verwalten
                    </Button>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900">Verfügbare Pakete</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className={`premium-card border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden relative group hover:shadow-2xl transition-all ${pkg.popular ? 'ring-4 ring-blue-600/5' : ''}`}>
                            {pkg.popular && (
                                <div className="absolute top-6 right-6">
                                    <Badge className="bg-blue-600 text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest rounded-full">
                                        Empfohlen
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="p-10 pb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg ${pkg.color}`}>
                                    <Package className="w-8 h-8" />
                                </div>
                                <CardTitle className="text-3xl font-black text-slate-900 mb-1">{pkg.title}</CardTitle>
                                <CardDescription className="font-bold text-blue-600 tracking-wide uppercase text-xs">
                                    {pkg.subtitle}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-0 space-y-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900">{pkg.price}</span>
                                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">pro Klasse / Jahr</span>
                                </div>

                                <ul className="space-y-4">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                    <li className="flex items-center gap-3 text-slate-600 font-medium">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        Inklusive {pkg.licenses} Lizenzen
                                    </li>
                                </ul>

                                <div className="pt-6">
                                    <Button className={`w-full h-14 rounded-2xl font-black text-lg gap-2 text-white shadow-lg transition-transform hover:scale-[1.02] ${pkg.color}`}>
                                        <ShoppingCart className="w-5 h-5" />
                                        Jetzt bestellen
                                    </Button>
                                    <p className="text-center text-slate-400 font-medium text-xs mt-4 flex items-center justify-center gap-2">
                                        <Info className="w-3 h-3" /> Angebot anfordern für die gesamte Schule
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Comparison / FAQ Section */}
            <Card className="premium-card border-none bg-indigo-50/50 shadow-sm rounded-[2.5rem] mt-12 overflow-hidden border border-indigo-100/50">
                <CardContent className="p-12 flex flex-col md:flex-row items-center gap-12">
                    <div className="shrink-0 w-24 h-24 bg-white rounded-3xl shadow-xl shadow-indigo-200/50 flex items-center justify-center">
                        <ShieldCheck className="w-12 h-12 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black text-slate-900 mb-2">Gesicherte Finanzierung?</h4>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            Für öffentliche Schulen in Österreich bieten wir die Abwicklung über das Projekt "Digitale Grundbildung" an.
                            Wählen Sie beim Checkout einfach "UEW" als Zahlungsmethode.
                        </p>
                    </div>
                    <Button variant="link" className="text-indigo-600 font-black text-lg p-0 h-auto gap-2 group shrink-0">
                        Mehr Infos <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
