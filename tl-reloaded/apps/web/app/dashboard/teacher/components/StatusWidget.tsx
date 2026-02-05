import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatusWidgetProps {
    title: string;
    icon: LucideIcon;
    status: 'success' | 'warning' | 'error';
    statusText: string;
    description?: string;
    date?: string;
    className?: string;
    delay?: number;
}

export function StatusWidget({
    title,
    icon: Icon,
    status,
    statusText,
    description,
    date,
    className,
    delay = 0,
}: StatusWidgetProps) {
    const statusStyles = {
        success: 'border-l-emerald-500 shadow-emerald-500/5',
        warning: 'border-l-amber-500 shadow-amber-500/5',
        error: 'border-l-rose-500 shadow-rose-500/5',
    };

    const iconStyles = {
        success: 'text-emerald-500 bg-emerald-50',
        warning: 'text-amber-500 bg-amber-50',
        error: 'text-rose-500 bg-rose-50',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <div
                className={cn(
                    'p-6 rounded-2xl border bg-white hover:bg-slate-50 transition-colors flex flex-col gap-4',
                    className
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base tracking-tight text-slate-900 leading-none">{title}</h4>
                </div>
                <div className="space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-2">
                        <span className={cn(
                            'w-2 h-2 rounded-full',
                            status === 'success' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                        )} />
                        {statusText}
                    </p>
                    {description && <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>}
                </div>
            </div>
        </motion.div>
    );
}
