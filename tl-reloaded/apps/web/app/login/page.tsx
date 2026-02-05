'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { UserRole } from '@repo/db/types';

type LoginTab = 'teacher' | 'student';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, studentLogin, isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect if authenticated (useEffect to avoid render-time navigation)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.student) {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/teacher');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (activeTab === 'teacher') {
        user = await login({ email, password });
      } else {
        user = await studentLogin({ password });
      }
      // Redirect based on role
      if (user?.role === UserRole.student) {
        router.push('/dashboard/student');
      } else {
        router.push('/dashboard/teacher');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Anmelden
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab('teacher');
              setError('');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'teacher'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Lehrerin oder Lehrer
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError('');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'student'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Schülerin oder Schüler
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {activeTab === 'teacher' ? (
            <>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Passwort vergessen?
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Schülerpasswort Eingabe
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Melde dich immer mit deinem persönlichen Schülerpasswort an.
                </p>
              </div>

              <div>
                <label htmlFor="student-password" className="sr-only">
                  Schülerpasswort
                </label>
                <input
                  id="student-password"
                  name="student-password"
                  type="password"
                  autoComplete="off"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Schülerpasswort eingeben"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Hast du dein Passwort vergessen? Wende dich an deinen Lehrer.
                </p>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Noch kein Konto?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Jetzt registrieren
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
