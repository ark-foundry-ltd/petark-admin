// context/AuthContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  ADMIN_PASSWORD_CHANGE_EVENT,
  ADMIN_UNAUTHORIZED_EVENT,
} from "@/lib/api";
import {
  ROUTES,
  changePassword as changePasswordRequest,
  getMe,
  hasPermission,
  login as loginRequest,
  tokenStore,
  type AdminUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AdminUser | null;
  /** true while the initial session check is running */
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refresh: () => Promise<AdminUser | null>;
  can: (permission: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return null;
    }

    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      // A 401 already cleared the token in the axios interceptor
      setUser(null);
      return null;
    }
  }, []);

  // Restore the session on first load
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  // React to the axios interceptor
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      router.replace(ROUTES.login);
    };
    const onPasswordChangeRequired = () => {
      router.replace(ROUTES.changePassword);
    };

    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized);
    window.addEventListener(ADMIN_PASSWORD_CHANGE_EVENT, onPasswordChangeRequired);
    return () => {
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized);
      window.removeEventListener(ADMIN_PASSWORD_CHANGE_EVENT, onPasswordChangeRequired);
    };
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const admin = await loginRequest(email, password);
    setUser(admin);
    return admin;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    router.replace(ROUTES.login);
  }, [router]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await changePasswordRequest(currentPassword, newPassword);
      await refresh(); // clears mustChangePassword in local state
    },
    [refresh]
  );

  const can = useCallback(
    (permission: string | string[]) => hasPermission(user, permission),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, changePassword, refresh, can }),
    [user, loading, login, logout, changePassword, refresh, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}