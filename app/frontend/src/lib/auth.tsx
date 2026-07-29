import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, clearToken, getToken, getTokenExpiry, setToken, setUnauthorizedHandler } from "./api";
import type { LoginResponse, User } from "@/types/api";
import { toast } from "sonner";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (silent?: boolean) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(!!getToken());
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doLogout = useCallback(async (silent = false) => {
    try {
      if (getToken()) await api.post("/auth/logout").catch(() => {});
    } finally {
      clearToken();
      setTokenState(null);
      setUser(null);
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
      if (!silent && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setTokenState(null);
      setUser(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    });
  }, []);

  const scheduleExpiry = useCallback(() => {
    const exp = getTokenExpiry();
    if (!exp) return;
    const ms = exp - Date.now();
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    if (ms <= 0) {
      doLogout(true).then(() => toast.error("Session expired. Please log in again."));
      return;
    }
    expiryTimer.current = setTimeout(() => {
      doLogout(true).then(() => toast.error("Session expired. Please log in again."));
    }, ms);
  }, [doLogout]);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!getToken()) return null;
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    scheduleExpiry();
    refreshUser().finally(() => setIsLoading(false));
  }, [token, refreshUser, scheduleExpiry]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(data.access_token, data.expires_in);
    setTokenState(data.access_token);
    scheduleExpiry();
    const me = await api.get<User>("/auth/me");
    setUser(me.data);
  }, [scheduleExpiry]);

  const value = useMemo<AuthContextValue>(() => ({
    user, token, isLoading, login, logout: doLogout, refreshUser, setUser,
  }), [user, token, isLoading, login, doLogout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}