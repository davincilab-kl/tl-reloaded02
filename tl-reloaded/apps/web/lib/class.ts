import { authClient } from './auth';

// Ensure API_URL doesn't end with /api to avoid double /api in paths
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface CreateClassData {
  name: string;
  grade?: string;
  designation?: string;
  schoolId: string;
  estimatedStudents?: number;
  paymentMethod: 'license' | 'sponsor' | 'invoice' | 'uew';
  coursePackageIds: string[];
}

export interface Class {
  id: string;
  name: string;
  grade: string | null;
  designation: string | null;
  schoolId: string;
  schoolYearId: string;
  primaryTeacherId: string;
  estimatedStudents: number | null;
  paymentMethod: 'license' | 'sponsor' | 'invoice' | 'uew' | null;
  paymentStatus: 'pending' | 'paid' | 'free' | null;
  createdAt: string;
  updatedAt: string;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  stats?: {
    studentCount: number;
    totalTCoins: number;
    tScore: number;
    projectCount: number;
    certificateCount: number;
  };
}

export interface CreateClassResponse {
  class: Class;
  students: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    password: string;
  }>;
}

export async function createClass(data: CreateClassData): Promise<CreateClassResponse> {
  const token = authClient.getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/class`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create class' }));
    throw new Error(error.message || 'Failed to create class');
  }

  const result = await response.json();
  // The API returns { class, students } directly
  return result;
}

export async function getClasses(): Promise<Class[]> {
  const token = authClient.getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/class`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch classes' }));
    throw new Error(error.message || 'Failed to fetch classes');
  }

  return response.json();
}

export async function getClassById(classId: string): Promise<Class> {
  const token = authClient.getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/class/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch class' }));
    throw new Error(error.message || 'Failed to fetch class');
  }

  return response.json();
}

export interface CoursePackage {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  licenseCount: number;
  freeLicenseCount: number;
  pricePerStudent: number | null;
  currency: string;
  isActive: boolean;
  isAvailable: boolean;
  courses?: Array<{
    course: {
      id: string;
      title: string;
    };
  }>;
}

export async function getAvailableCoursePackages(): Promise<CoursePackage[]> {
  const token = authClient.getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/class/course-packages/available`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch course packages' }));
    throw new Error(error.message || 'Failed to fetch course packages');
  }

  return response.json();
}
export async function deleteClassStudent(classId: string, studentId: string): Promise<void> {
  const token = authClient.getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/api/class/${classId}/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete student' }));
    throw new Error(error.message || 'Failed to delete student');
  }
}

export async function resetStudentPassword(classId: string, studentId: string): Promise<{ password: string }> {
  const token = authClient.getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/api/class/${classId}/students/${studentId}/reset-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to reset password' }));
    throw new Error(error.message || 'Failed to reset password');
  }

  return response.json();
}
