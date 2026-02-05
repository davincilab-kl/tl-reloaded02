import { Users, GraduationCap, Coins, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ClassItem {
    id: string;
    name: string;
    stats: {
        studentCount: number;
        totalTCoins: number;
    };
}

interface ClassListWidgetProps {
    classes: ClassItem[];
}

export function ClassListWidget({ classes }: ClassListWidgetProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Meine Klasse(n)</h3>
                </div>
            </div>

            <div className="p-6 flex-1">
                {classes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <p className="text-gray-500 mb-6">Noch keine Klassen vorhanden.</p>
                        <Link href="/dashboard/teacher/classes/new">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <Plus className="w-4 h-4" />
                                Erste Klasse anlegen
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {classes.slice(0, 3).map((classItem) => (
                            <Link
                                key={classItem.id}
                                href="/dashboard/teacher/classes"
                                className="block group"
                            >
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {classItem.name}
                                        </h4>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            <span>{classItem.stats.studentCount} Schüler</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                            <span>{classItem.stats.totalTCoins}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {classes.length > 3 && (
                            <p className="text-center text-sm text-gray-500 pt-2">
                                + {classes.length - 3} weitere Klasse(n)
                            </p>
                        )}
                    </div>
                )}
            </div>

            {classes.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <Link href="/dashboard/teacher/classes">
                        <Button variant="ghost" className="w-full justify-between hover:bg-white text-gray-600 hover:text-blue-600 group">
                            Alle Klassen anzeigen
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
