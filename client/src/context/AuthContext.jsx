import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.me().then(({ user: currentUser }) => {
      if (active) {
        setUser(currentUser);
      }
    }).catch(() => {
      if (active) {
        setUser(null);
      }
    }).finally(() => {
      if (active) {
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const result = await api.login(credentials);
      setUser(result.user);
      return result.user;
    },
    async register(details) {
      return api.register(details);
    },
    async logout() {
      await api.logout();
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
