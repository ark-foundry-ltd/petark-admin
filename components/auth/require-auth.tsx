// components/auth/RequireAuth.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/lib/auth";

interface RequireAuthProps {
  children: ReactNode;
  /** Shown while the session is being checked or a redirect is in flight */
  fallback?: ReactNode;
}

/**
 * Wrap every logged-in page (usually once, in the dashboard layout).
 * - not logged in            -> /login
 * - temporary password       -> /change-password
 */
export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const mustChangePassword =
    user?.mustChangePassword === true && pathname !== ROUTES.changePassword;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(ROUTES.login);
    } else if (mustChangePassword) {
      router.replace(ROUTES.changePassword);
    }
  }, [loading, user, mustChangePassword, router]);

  if (loading || !user || mustChangePassword) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}