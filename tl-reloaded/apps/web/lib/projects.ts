import { authClient } from './auth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface Project {
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: 'draft' | 'submitted_for_review' | 'published' | 'refinement_requested';
    authorId: string;
    classId: string | null;
    createdAt: string;
    updatedAt: string;
    author?: {
        firstName: string;
        lastName: string;
    };
    class?: {
        name: string;
    };
}

export async function getMyProjects(): Promise<Project[]> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/projects/my-projects`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch projects' }));
        throw new Error(error.message || 'Failed to fetch projects');
    }

    return response.json();
}

export async function getAllProjects(): Promise<Project[]> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch projects' }));
        throw new Error(error.message || 'Failed to fetch projects');
    }

    return response.json();
}

export async function submitProject(id: string): Promise<Project> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/projects/${id}/submit`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to submit project' }));
        throw new Error(error.message || 'Failed to submit project');
    }

    return response.json();
}

export async function reviewProject(id: string, approve: boolean, feedback: string): Promise<Project> {
    const token = authClient.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/projects/${id}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            status: approve ? 'published' : 'refinement_requested',
            feedback
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to review project' }));
        throw new Error(error.message || 'Failed to review project');
    }

    return response.json();
}
