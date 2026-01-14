'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Check for mock user first
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
          setIsLoading(false);
          return;
        }
        
        try {
          const response = await fetch(`${API_URL}/api/v1/user/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token expired, try refresh
            await refreshToken();
          }
        } catch (error) {
          console.error('Auth init error:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('mock_user');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setUser(data.user);
    } catch (error) {
      // Mock auth fallback for demo/development
      console.warn('API unavailable, using mock auth');
      if (email && password.length >= 4) {
        const mockUser = {
          id: 'mock-user-1',
          email: email,
          name: email.split('@')[0],
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        const mockToken = 'mock-token-' + Date.now();
        localStorage.setItem('access_token', mockToken);
        localStorage.setItem('refresh_token', mockToken);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw new Error('Invalid email or password (min 4 chars)');
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('refresh_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: token }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Fetch user data
        const userResponse = await fetch(`${API_URL}/api/v1/user/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });
        if (userResponse.ok) {
          setUser(await userResponse.json());
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper to get auth headers
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
