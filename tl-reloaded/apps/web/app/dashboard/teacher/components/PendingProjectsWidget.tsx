import { ClipboardCheck, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PendingProject {
    id: string;
    title: string;
    author: {
        firstName: string;
        lastName: string;
    };
    class: {
        name: string;
    } | null;
    createdAt: string;
}

interface PendingProjectsWidgetProps {
    projects: PendingProject[];
}

export function PendingProjectsWidget({ projects }: PendingProjectsWidgetProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-all duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Ausstehende Prüfungen</h3>
                </div>
                {projects.length > 0 && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                        {projects.length}
                    </span>
                )}
            </div>

            <div className="p-6 flex-1">
                {projects.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">Alles erledigt!</p>
                        <p className="text-sm text-gray-400 mt-1">Keine ausstehenden Projektprüfungen</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {projects.slice(0, 5).map((project) => (
                            <div
                                key={project.id}
                                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                            >
                                <FileText className="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-blue-500 transition-colors" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                        {project.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 truncate">
                                        von {project.author.firstName} {project.author.lastName}
                                        {project.class && <span className="text-gray-400"> • {project.class.name}</span>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {projects.length > 0 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <Link href="/dashboard/teacher/projects">
                        <Button variant="ghost" className="w-full justify-between hover:bg-white text-gray-600 hover:text-blue-600 group">
                            Alle anzeigen
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
