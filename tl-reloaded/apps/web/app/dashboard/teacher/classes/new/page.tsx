'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { createClass, getAvailableCoursePackages, type CoursePackage } from '@/lib/class';
import { getTeacherDashboard } from '@/lib/teacher';
import Link from 'next/link';

export default function NewClassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [coursePackages, setCoursePackages] = useState<CoursePackage[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [grade, setGrade] = useState('');
  const [designation, setDesignation] = useState('');
  const [estimatedStudents, setEstimatedStudents] = useState(25);
  const [selectedCoursePackages, setSelectedCoursePackages] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'license' | 'sponsor' | 'invoice' | 'uew'>('invoice');

  // Check if licenses are available for selected course packages
  const hasAvailableLicenses = dashboardData?.school?.freeLicensesEnabled && selectedCoursePackages.length > 0;

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [dashboard, packages] = await Promise.all([
          getTeacherDashboard(),
          getAvailableCoursePackages(),
        ]);
        setDashboardData(dashboard);
        setCoursePackages(packages);

        // Default select first course package
        if (packages.length > 0) {
          const firstPackage = packages[0];
          if (firstPackage) {
            setSelectedCoursePackages([firstPackage.id]);
          }
          // Set default payment method based on license availability
          if (dashboard?.school?.freeLicensesEnabled) {
            setPaymentMethod('license');
          } else {
            setPaymentMethod('invoice');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!dashboardData?.school?.id) {
      setError('Keine Schule zugewiesen. Bitte verbinde dich zuerst mit einer Schule.');
      setLoading(false);
      return;
    }

    if (!grade || !designation) {
      setError('Bitte gib Stufe und Klassenbezeichnung ein.');
      setLoading(false);
      return;
    }

    if (selectedCoursePackages.length === 0) {
      setError('Bitte wähle mindestens ein Kurspaket aus.');
      setLoading(false);
      return;
    }

    // Validate Förderung usage
    if (paymentMethod === 'sponsor') {
      if (!dashboardData.forderungApproval?.canUseForderung) {
        if (!dashboardData.infoWebinar?.attended) {
          setError('Info-Webinar für das aktuelle Schuljahr nicht besucht. Bitte besuche zuerst ein Info-Webinar.');
          setLoading(false);
          return;
        }
        if (!dashboardData.forderungApproval?.approved) {
          setError('Förderung für das aktuelle Schuljahr nicht freigegeben. Bitte wende dich an den Administrator.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const className = `${grade}${designation}`;
      const result = await createClass({
        name: className,
        grade,
        designation,
        schoolId: dashboardData.school.id,
        estimatedStudents,
        paymentMethod,
        coursePackageIds: selectedCoursePackages,
      });

      // Redirect to classes list with success message
      router.push(`/dashboard/teacher/classes?created=true&students=${result.students.length}`);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen der Klasse');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Daten...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Keine Schule zugewiesen.</p>
          <Link
            href="/dashboard/teacher/school"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Zur Schulverwaltung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/dashboard/teacher/classes"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Zurück zu Klassen
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Klasse anlegen</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klassenname <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Stufe</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="z.B. 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Klassenbezeichnung</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="z.B. A, B, AB"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {grade && designation && (
                  <p className="mt-2 text-sm text-gray-600">
                    Klassenname: <span className="font-semibold">{grade}{designation}</span>
                  </p>
                )}
              </div>

              {/* Student Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geschätzte Schüleranzahl <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={estimatedStudents}
                  onChange={(e) => setEstimatedStudents(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Schüler werden automatisch mit zufälligen Passwörtern erstellt
                </p>
              </div>

              {/* Course Packages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kurspakete <span className="text-red-500">*</span>
                </label>
                {coursePackages.length === 0 ? (
                  <p className="text-gray-500 text-sm">Keine Kurspakete verfügbar.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4">
                    {coursePackages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCoursePackages.includes(pkg.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelected = [...selectedCoursePackages, pkg.id];
                              setSelectedCoursePackages(newSelected);
                            } else {
                              const newSelected = selectedCoursePackages.filter((id) => id !== pkg.id);
                              setSelectedCoursePackages(newSelected);
                              // If license payment was selected but no longer available, switch to invoice
                              if (paymentMethod === 'license' && (!dashboardData?.school?.freeLicensesEnabled || newSelected.length === 0)) {
                                setPaymentMethod('invoice');
                              }
                            }
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{pkg.title}</div>
                          {pkg.description && (
                            <div className="text-sm text-gray-600 mt-1">{pkg.description}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Lizenzen sind pro Schuljahr gültig
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zahlungsmethode <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {hasAvailableLicenses && (
                    <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="license"
                        checked={paymentMethod === 'license'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Aus aktuellen Lizenzen Klasse erstellen</div>
                        <div className="text-sm text-gray-600">0,00 € - sofort verfügbar</div>
                        <div className="text-xs text-gray-500 mt-1">Verwendet Lizenzen des aktuellen Schuljahres</div>
                      </div>
                    </label>
                  )}

                  <label
                    className={`flex items-start space-x-3 p-4 border rounded-md cursor-pointer ${paymentMethod === 'sponsor'
                      ? 'border-blue-500 bg-blue-50'
                      : dashboardData?.forderungApproval?.canUseForderung
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'border-gray-200 hover:bg-gray-50 opacity-60'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="sponsor"
                      checked={paymentMethod === 'sponsor'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      disabled={!dashboardData?.forderungApproval?.canUseForderung}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Gefördert durch TalentsLounge Angels
                        {!dashboardData?.forderungApproval?.canUseForderung && (
                          <span className="ml-2 text-xs text-red-600">(Nicht verfügbar)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">0,00 € - kostenlos, solange Kontingent besteht</div>
                      {!dashboardData?.infoWebinar?.attended && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ Info-Webinar für aktuelles Schuljahr nicht besucht
                        </div>
                      )}
                      {dashboardData?.infoWebinar?.attended && !dashboardData?.forderungApproval?.approved && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ Förderung für aktuelles Schuljahr nicht freigegeben
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="invoice"
                      checked={paymentMethod === 'invoice'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Zahlung per Rechnung</div>
                      <div className="text-sm text-gray-600">z.B. über den Elternverein</div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="uew"
                      checked={paymentMethod === 'uew'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Unterrichtsmittel eigener Wahl (UeW)</div>
                      <div className="text-sm text-gray-600">Rechnung mit Schulstempel/Unterschrift hochladen</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/dashboard/teacher/classes"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Abbrechen
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Erstelle Klasse...' : 'Klasse anlegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
