'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient, User, LoginCredentials, RegisterCredentials, StudentLoginCredentials } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  studentLogin: (credentials: StudentLoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (authClient.isAuthenticated()) {
        // Load user from localStorage
        const storedUser = authClient.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authClient.login(credentials);
      setUser(response.user);
      // Store user role for redirect logic
      if (typeof window !== 'undefined' && response.user.role) {
        localStorage.setItem('user_role', response.user.role);
      }
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const studentLogin = async (credentials: StudentLoginCredentials) => {
    try {
      const response = await authClient.studentLogin(credentials);
      setUser(response.user);
      // Store user role for redirect logic
      if (typeof window !== 'undefined' && response.user.role) {
        localStorage.setItem('user_role', response.user.role);
      }
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await authClient.register(credentials);
      setUser(response.user);
      // Store user role for redirect logic
      if (typeof window !== 'undefined' && response.user.role) {
        localStorage.setItem('user_role', response.user.role);
      }
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    authClient.setUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        studentLogin,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
