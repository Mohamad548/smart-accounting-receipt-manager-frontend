'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout } from '@/lib/api-client';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication on mount - only check localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserId(user.id);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
        setIsAuthenticated(false);
        setUsername(null);
        setUserId(null);
      }
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setUserId(null);
    }
    setIsChecking(false);
  }, []);

  // Removed auto refresh token - no longer needed

  const checkAuth = async () => {
    // Simply check localStorage - don't call refresh token on mount
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserId(user.id);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
        setIsAuthenticated(false);
        setUsername(null);
        setUserId(null);
      }
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setUserId(null);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(username, password);
      if (response.success && response.user) {
        // Store user info and token in localStorage (for cross-origin support)
        localStorage.setItem('auth_user', JSON.stringify({
          id: response.user.id,
          username: response.user.username,
        }));
        // Store token if provided (for cross-origin support)
        if (response.token) {
          localStorage.setItem('accessToken', response.token);
          console.log('✅ Token stored in localStorage');
        } else {
          console.warn('⚠️ No token received from login response');
        }
        setIsAuthenticated(true);
        setUsername(response.user.username);
        setUserId(response.user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
      setUserId(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('accessToken'); // Clear token on logout
    }
  };

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-black">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        userId,
        login,
        logout,
        checkAuth,
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

