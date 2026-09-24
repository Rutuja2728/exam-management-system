import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginRequest } from '../services/examService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      async login(email, password) {
        const res = await loginRequest(email, password);
        localStorage.setItem('token', res.data.data.token);
        setToken(res.data.data.token);
        setUser(res.data.data.user);
        return res.data.data.user;
      },
      logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
