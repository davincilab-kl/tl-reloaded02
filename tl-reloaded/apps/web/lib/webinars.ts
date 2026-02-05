import { authClient } from './auth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface Webinar {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string | null;
    status: 'active' | 'cancelled' | 'completed';
    attendeeCount: number;
    externalId: string | null;
}

export async function getWebinars(): Promise<Webinar[]> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/webinars`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch webinars' }));
        throw new Error(error.message || 'Failed to fetch webinars');
    }

    return response.json();
}

export async function syncWebinars(): Promise<{ success: boolean; count: number }> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/webinars/sync`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to sync webinars' }));
        throw new Error(error.message || 'Failed to sync webinars');
    }

    return response.json();
}
