import { authClient } from './auth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    lastLoginAt?: string;
    schoolId?: string;
    classId?: string;
    avatarId?: string;
}

export async function getTeachers(): Promise<UserProfile[]> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/users/teachers`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch teachers' }));
        throw new Error(error.message || 'Failed to fetch teachers');
    }

    return response.json();
}

export async function getStudents(): Promise<UserProfile[]> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/users/students`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch students' }));
        throw new Error(error.message || 'Failed to fetch students');
    }

    return response.json();
}

export async function impersonateUser(id: string): Promise<UserProfile> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/users/${id}/impersonate`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Impersonation failed' }));
        throw new Error(error.message || 'Impersonation failed');
    }

    return response.json();
}

export async function uploadAvatar(file: File): Promise<UserProfile> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/users/avatar`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Upload failed');
    }

    return response.json();
}
