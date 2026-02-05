import { authClient } from './auth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface School {
    id: string;
    name: string;
    schoolType: string;
    schoolCode: string;
    street: string | null;
    postalCode: string | null;
    city: string | null;
    state: string | null;
    status: 'active' | 'pending' | 'rejected';
    approvedAt: string | null;
    teachers?: any[];
    classes?: any[];
    _count?: {
        teachers: number;
        classes: number;
    };
}

export async function getSchools(): Promise<School[]> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/schools`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch schools' }));
        throw new Error(error.message || 'Failed to fetch schools');
    }

    return response.json();
}

export async function getSchoolById(id: string): Promise<School> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/schools/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch school' }));
        throw new Error(error.message || 'Failed to fetch school');
    }

    return response.json();
}

export async function approveSchool(id: string): Promise<School> {
    const token = authClient.getToken();
    const user = authClient.getUser();
    if (!token || !user) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/schools/${id}/approve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminId: user.id }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to approve school' }));
        throw new Error(error.message || 'Failed to approve school');
    }

    return response.json();
}
