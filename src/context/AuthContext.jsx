import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate token with backend on initial load
  useEffect(() => {
    let isMounted = true;

    const verifyExistingAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await authApi.getMe();
        if (isMounted) {
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
            setToken(savedToken);
          } else {
            // Unverified or invalid user response
            logout();
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          } else {
            // Backend waking up or offline: preserve cached user so user is not kicked out unnecessarily
            console.warn('Backend auth check skipped (offline/waking up):', err.message);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyExistingAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('auth_token', tokenValue);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('auth_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
