import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser, Role } from "./types";

const STORAGE_KEY = "smartgym.auth";

/**
 * Mock authentication layer.
 * Swap `signIn` for a POST /api/auth/login call against the Express backend later —
 * the rest of the app only depends on the AuthUser shape exposed here.
 */
interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  signIn: (email: string, password: string, role: Role) => Promise<AuthUser>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoUsers: Record<Role, AuthUser> = {
  ADMIN: {
    id: "A-1",
    name: "Ravi Deshmukh",
    email: "admin@smartgym.in",
    role: "ADMIN",
    avatarInitials: "RD",
  },
  MEMBER: {
    id: "M-1000",
    name: "Rahul Sharma",
    email: "rahul@smartgym.in",
    role: "MEMBER",
    avatarInitials: "RS",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, _password: string, role: Role) => {
    await new Promise((r) => setTimeout(r, 700));
    const base = demoUsers[role];
    const next: AuthUser = { ...base, email: email || base.email };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
