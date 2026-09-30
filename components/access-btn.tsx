// components/access-btn.tsx
"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { ROUTES, postLoginPath } from "@/lib/auth";

const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-acc-clr px-7 text-sm font-semibold text-pry-clr shadow-lg shadow-green-500/25 transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:ring-offset-2 pry-ff";

/**
 * Sign in for visitors, Access dashboard for admins who already have a session.
 * Must render inside <AuthProvider>.
 */
export function AccessButton() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 pry-ff">
        <div
          className="h-12 w-60 animate-pulse rounded-xl bg-green-500/30"
          aria-hidden="true"
        />
        <p className="sr-only" role="status">
          Checking your session
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center gap-3 pry-ff">
        <Link href={postLoginPath(user)} className={primaryButton}>
          <LayoutDashboard className="h-4 w-4" />
          {user.mustChangePassword ? "Continue" : "Access dashboard"}
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-xs text-sec-clr sec-ff">
          Signed in as <span className="font-semibold text-sec-clr">{user.fullname}</span>
          {" · "}
          <button
            type="button"
            onClick={logout}
            className="font-semibold text-sec-clr underline-offset-2 hover:text-gray-900 hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>
    );
  }

  return (
    <Link href={ROUTES.login} className={primaryButton}>
      Sign in to Command Center
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}