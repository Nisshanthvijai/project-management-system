import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthFailureHandler, setToken } from '../api/client';

const TOKEN_KEY = 'pm_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null); // e.g. "Your session has expired"
  const [bootError, setBootError] = useState(null); // e.g. no network on app start

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  }, []);

  // When any request gets "token expired", log out and show the message on the login screen.
  useEffect(() => {
    setAuthFailureHandler(async (message) => {
      await clearSession();
      setNotice(message);
    });
  }, [clearSession]);

  const boot = useCallback(async () => {
    setLoading(true);
    setBootError(null);
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        setToken(token);
        const res = await api.me();
        setUser(res.user);
      }
    } catch (err) {
      // Token rejected: the handler already cleared it. Network trouble: let the user retry.
      if (err.status === 0) setBootError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  const startSession = async ({ user, token }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setToken(token);
    setNotice(null);
    setUser(user);
  };

  const login = async (credentials) => startSession(await api.login(credentials));
  const register = async (details) => startSession(await api.register(details));

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Log out locally even if the server call fails.
    }
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, notice, bootError, boot, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
