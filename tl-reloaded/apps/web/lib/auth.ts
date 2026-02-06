import type { UserRole } from '@repo/db/types';

// Ensure API_URL doesn't end with /api to avoid double /api in paths
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

export interface User {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId?: string;
  classId?: string;
  avatarId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredTitle?: string;
  phone?: string;
}

export interface StudentLoginCredentials {
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

class AuthClient {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  async studentLogin(credentials: StudentLoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/student/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem('user_role');
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }
}

export const authClient = new AuthClient();
