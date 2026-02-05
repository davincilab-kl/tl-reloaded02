'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ShoppingCart,
    CreditCard,
    FileText,
    CheckCircle,
    Truck,
    ArrowRight
} from 'lucide-react';

export default function OrderManagementPage() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        // Mock orders
        setOrders([
            { id: 'O1', course: 'Basis-Paket Coding', class: '4A', students: 25, status: 'shipped', payment: 'Invoice', date: '2026-01-15' },
            { id: 'O2', course: 'Fortgeschritten I', class: '3B', students: 18, status: 'processing', payment: 'Funded', date: '2026-02-02' },
            { id: 'O3', course: 'Hardware-Kit', class: '4A', students: 25, status: 'pending', payment: 'UEW', date: '2026-02-05' },
        ]);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'shipped': return <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Versendet</Badge>;
            case 'processing': return <Badge variant="warning" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">In Bearbeitung</Badge>;
            case 'pending': return <Badge variant="secondary">Wartet auf Zahlung</Badge>;
            default: return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>;
        }
    };

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case 'Invoice': return <FileText className="mr-2 h-4 w-4 opacity-70" />;
            case 'Funded': return <CheckCircle className="mr-2 h-4 w-4 text-primary opacity-70" />;
            case 'UEW': return <CreditCard className="mr-2 h-4 w-4 opacity-70" />;
            default: return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bestellungen & Kurse</h1>
                    <p className="text-muted-foreground">
                        Erwerben Sie neue Kurspakete für Ihre Klassen.
                    </p>
                </div>
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-sm">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Neue Kurse bestellen
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-primary text-white border-none shadow-md overflow-hidden relative">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                        <Truck className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-white/70">Aktive Kurse</CardDescription>
                        <CardTitle className="text-3xl font-black">4</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-white/50">Für 3 Klassen freigeschaltet</p>
                    </CardContent>
                </Card>
                {/* ... more summary cards could go here */}
            </div>

            <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold flex items-center">
                    Bestellverlauf
                    <Badge variant="outline" className="ml-3 font-medium">{orders.length}</Badge>
                </h2>

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Bestellung</TableHead>
                                <TableHead>Kurspaket</TableHead>
                                <TableHead>Klasse</TableHead>
                                <TableHead>Zahlungsmethode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Beinhaltet</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell className="font-semibold">{order.course}</TableCell>
                                    <TableCell>{order.class}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm">
                                            {getPaymentIcon(order.payment)}
                                            {order.payment}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="hover:text-primary">
                                            Details <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
