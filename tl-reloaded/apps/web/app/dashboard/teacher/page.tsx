'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getTeacherDashboard, type TeacherDashboardData } from '@/lib/teacher';
import { LayoutDashboard, Users, Trophy, Coins, CalendarDays, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { DashboardHeader } from './components/DashboardHeader';
import { SchoolStatusWidget } from './components/SchoolStatusWidget';
import { StatsCard } from './components/StatsCard';
import { StatusWidget } from './components/StatusWidget';
import { ClassListWidget } from './components/ClassListWidget';
import { PendingProjectsWidget } from './components/PendingProjectsWidget';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await getTeacherDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 animate-pulse">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  // Calculate trends (mocked for now, but infrastructure is ready)
  const studentCount = dashboardData.classes.reduce((sum, c) => sum + c.stats.studentCount, 0);
  const tCoinsTotal = dashboardData.classes.reduce((sum, c) => sum + c.stats.totalTCoins, 0);

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        subtitle={`Willkommen zurück, ${user?.firstName}!`}
        icon={LayoutDashboard}
        schoolYear={dashboardData.currentSchoolYear?.name}
      />

      {/* School Status */}
      <div className="mb-8">
        <SchoolStatusWidget school={dashboardData.school} />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Klassen"
          value={dashboardData.classes.length}
          icon={Users}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          label="Schüler:innen"
          value={studentCount}
          icon={GraduationCap}
          color="green"
          trend={{ value: 12, label: 'vs last month', positive: true }}
          delay={0.2}
        />
        <StatsCard
          label="T!Coins Gesamt"
          value={tCoinsTotal.toLocaleString()}
          icon={Coins}
          color="orange"
          description="Gesammelte Coins"
          delay={0.3}
        />
        <StatsCard
          label="Wettbewerbe"
          value="3"
          icon={Trophy}
          color="purple"
          description="Laufende Wettbewerbe"
          delay={0.4}
        />
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatusWidget
          title="Info-Webinar"
          icon={CalendarDays}
          status={dashboardData.infoWebinar.attended ? 'success' : 'warning'}
          statusText={dashboardData.infoWebinar.attended ? 'Teilgenommen' : 'Noch offen'}
          description={dashboardData.infoWebinar.attended ? 'Voraussetzung erfüllt' : 'Bitte melden Sie sich für ein Webinar an.'}
          date={dashboardData.infoWebinar.attendedAt ? new Date(dashboardData.infoWebinar.attendedAt).toLocaleDateString() : undefined}
          delay={0.5}
        />
        <StatusWidget
          title="Förderung"
          icon={Coins}
          status={dashboardData.forderungApproval.approved ? 'success' : 'warning'}
          statusText={dashboardData.forderungApproval.approved ? 'Genehmigt' : 'Ausstehend'}
          date={dashboardData.forderungApproval.approvedAt ? new Date(dashboardData.forderungApproval.approvedAt).toLocaleDateString() : undefined}
          delay={0.6}
        />
        <StatusWidget
          title="Klassen-Förderung"
          icon={Users}
          status={dashboardData.forderungApproval.canUseForderung ? 'success' : 'error'}
          statusText={dashboardData.forderungApproval.canUseForderung ? 'Verfügbar' : 'Gesperrt'}
          description={dashboardData.forderungApproval.canUseForderung ? 'Sie können geförderte Klassen anlegen.' : 'Voraussetzungen nicht erfüllt.'}
          delay={0.7}
        />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ClassListWidget classes={dashboardData.classes} />
        </div>
        <div className="lg:col-span-1">
          <PendingProjectsWidget projects={dashboardData.pendingProjects} />
        </div>
      </div>
    </>
  );
}
