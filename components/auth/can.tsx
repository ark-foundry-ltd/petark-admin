// components/auth/Can.tsx
"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/context/auth-context";

interface CanProps {
  /** A permission string, or an array meaning "any of these" */
  permission: string | string[];
  children: ReactNode;
  /** Rendered when the admin lacks the permission (nothing by default) */
  fallback?: ReactNode;
}

/**
 * Hide sidebar items and buttons, or guard a whole page with a
 * "no access" fallback. The API enforces permissions too; this is UX only.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
}