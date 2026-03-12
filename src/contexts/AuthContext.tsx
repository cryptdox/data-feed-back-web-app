import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { User } from '../types';
import { STORAGE_KEYS, AUTH_API_URL } from '../constants';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  handleLogout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  });
  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        refreshAccessToken();
        setLoading(false);
        return;
      }
  
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          userId: payload.userId,
          email: payload.email,
          realmId: payload.realmId,
          sessionId: payload.sessionId,
          name: payload.name ?? payload.email.split('@')[0],
          isEmailVerified: payload.isEmailVerified,
          isMasterRealmUser: payload.isMasterRealmUser,
        });
      } catch {
        logout();
        setLoading(false);
      }
    }
    setLoading(false);
  }, [token]);

  const refreshAccessToken = async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!storedRefreshToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.accessToken && data.data?.refreshToken) {
        const newToken = data.data.accessToken;
        const refreshToken = data.data?.refreshToken;
      
        setToken(newToken);
        setRefreshToken(refreshToken)
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      
        scheduleTokenRefresh(newToken);
      
        return true;
      }

      logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    scheduleTokenRefresh(newToken)
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
  };

  const handleLogout = async () => {
    try {
      const response = await apiService.handleLogout();
      if (!response.success) {
        alert(response.message || 'Logout failed');
        return;
      }
      logout();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  };

  function isTokenExpired(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.AUTH_TOKEN && !event.newValue) {
        logout();
      }
    };
  
    window.addEventListener("storage", handler);
  
    return () => window.removeEventListener("storage", handler);
  }, []);

  function scheduleTokenRefresh(token: string) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
  
    const timeout = expiresAt - Date.now() - 60000;

    console.log({timeout})
  
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
  
    if (timeout > 0) {
      refreshTimer.current = setTimeout(() => {
        refreshAccessToken();
      }, timeout);
    }
  }

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      refreshAccessToken();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        logout,
        handleLogout,
        isAuthenticated: !!token && !isTokenExpired(token),
        loading,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
