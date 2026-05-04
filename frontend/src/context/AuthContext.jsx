import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

const STORAGE_KEY = "euphonica_auth";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadFromStorage);

  const login = useCallback((token, user) => {
    const payload = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuth(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider value={{ token: auth.token, user: auth.user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;