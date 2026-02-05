import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'orange' | 'purple';
    description?: string;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    delay?: number;
}

export function StatsCard({ label, value, icon: Icon, description, trend, delay = 0 }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <div className="premium-card p-6 group relative overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/10 group-hover:bg-blue-500/30 transition-all duration-500" />

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-2">{label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
                    </div>
                    <div className="p-3 rounded-2xl transition-all duration-500 bg-blue-50 text-blue-600 group-hover:scale-110">
                        <Icon className="w-6 h-6" />
                    </div>
                </div>

                {(description || trend) && (
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        {trend && (
                            <span
                                className={cn(
                                    'font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider',
                                    trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                )}
                            >
                                {trend.positive ? '↑' : '↓'} {trend.value}%
                            </span>
                        )}
                        {description && <span className="text-slate-400 font-medium text-xs tracking-tight">{description}</span>}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
