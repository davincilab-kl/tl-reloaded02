import { LucideIcon } from 'lucide-react';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    schoolYear?: string;
}

export function DashboardHeader({ title, subtitle, icon: Icon, schoolYear }: DashboardHeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                {Icon && <Icon className="w-8 h-8 text-blue-600" />}
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            </div>
            {(subtitle || schoolYear) && (
                <div className="flex items-center gap-4 text-gray-500">
                    {subtitle && <p className="text-lg">{subtitle}</p>}
                    {schoolYear && (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <p className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                                Schuljahr {schoolYear}
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
