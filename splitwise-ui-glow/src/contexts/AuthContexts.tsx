import { set } from "date-fns";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; name: string; email: string; groups?: any[] } | null;

const AuthContext = createContext<{
  user: User;
  isLoading: boolean;
  setUser: (u: User) => void;
  logout: () => Promise<void>;
}>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = (u: User) => {
    setUserState(u);
    // When user is set (e.g., after login), we are no longer in an initial loading state.
    if (isLoading) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try to verify session using cookie: call /auth/me
    const check = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const u = await res.json();
        setUser(u);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  } catch (err) {
    // ignore
    setUser(null);
  } finally {
    window.location.href = "/login";
  }
};


  return <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
