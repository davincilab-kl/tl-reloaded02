import { authClient } from './auth';

// Ensure API_URL doesn't end with /api to avoid double /api in paths
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface TeacherDashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    role: string;
  };
  school: {
    id: string;
    name: string;
    schoolCode: string | null;
    freeLicensesEnabled: boolean;
  } | null;
  classes: Array<{
    id: string;
    name: string;
    grade: string | null;
    designation: string | null;
    stats: {
      studentCount: number;
      totalTCoins: number;
      tScore: number;
      projectCount: number;
      certificateCount: number;
    };
  }>;
  pendingProjects: Array<{
    id: string;
    title: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
    };
    class: {
      id: string;
      name: string;
    } | null;
    createdAt: string;
  }>;
  coursePackages: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
  currentSchoolYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  infoWebinar: {
    attended: boolean;
    attendedAt: string | null;
  };
  forderungApproval: {
    approved: boolean;
    approvedAt: string | null;
    canUseForderung: boolean;
  };
}

export async function getTeacherDashboard(): Promise<TeacherDashboardData> {
  const token = authClient.getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/teacher/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch dashboard' }));
    throw new Error(error.message || 'Failed to fetch dashboard');
  }

  return response.json();
}
