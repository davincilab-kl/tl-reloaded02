import { School, Settings, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SchoolStatusWidgetProps {
    school: {
        name: string;
        schoolCode: string | null;
        freeLicensesEnabled: boolean;
    } | null;
}

export function SchoolStatusWidget({ school }: SchoolStatusWidgetProps) {
    if (!school) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center gap-3 text-white">
                    <School className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Meine Schule</h3>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">{school.name}</h4>
                            {school.schoolCode && (
                                <div className="flex items-center gap-2 mt-1 text-gray-600">
                                    <span className="text-sm font-medium">Schulcode:</span>
                                    <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono text-blue-600 bg-blue-50">
                                        {school.schoolCode}
                                    </code>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Gratis-Lizenzen:</span>
                            <div
                                className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
                                    school.freeLicensesEnabled
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                )}
                            >
                                {school.freeLicensesEnabled ? (
                                    <>
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Aktiviert
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-3.5 h-3.5" />
                                        Deaktiviert
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <Link href="/dashboard/teacher/school">
                        <Button variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 w-full md:w-auto">
                            <Settings className="w-4 h-4" />
                            Schule verwalten
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
