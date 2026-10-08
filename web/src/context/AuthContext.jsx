import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, ask the server who we are.
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => setUser(res.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleAuthSuccess = ({ user, token }) => {
    tokenStore.set(token);
    setUser(user);
  };

  const login = async (credentials) => handleAuthSuccess(await api.login(credentials));
  const register = async (details) => handleAuthSuccess(await api.register(details));

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Even if the server call fails, we still log out locally.
    }
    tokenStore.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
