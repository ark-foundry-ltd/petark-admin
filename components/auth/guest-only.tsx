// components/auth/GuestOnly.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { postLoginPath } from "@/lib/auth";

interface GuestOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrap the login and forgot-password pages so an admin who is already
 * logged in is sent to the dashboard instead. Do not use it on
 * /reset-password: invite and reset links must work while logged in too.
 */
export function GuestOnly({ children, fallback = null }: GuestOnlyProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(postLoginPath(user));
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}