// components/auth/InvalidLinkCard.tsx
import Link from "next/link";

import { ROUTES } from "@/lib/auth";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle } from "./auth-shell";

export function InvalidLinkCard({ kind }: Readonly<{ kind: "invite" | "reset" }>) {
  return (
    <AuthShell>
      <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
      <AuthTitle
        title={kind === "invite" ? "Invitation unavailable" : "Reset link unavailable"}
        description="Links are single-use and expire after a short time."
      />

      <div className="mt-6 space-y-6">
        <Alert variant="error" title="This link is invalid or has expired">
          {kind === "invite"
            ? "Ask an administrator to send a new invitation, or request a password reset if your account already exists."
            : "Request a new password reset link to continue."}
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={ROUTES.forgotPassword}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-green-500 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Request a new link
          </Link>
          <Link
            href={ROUTES.login}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export function VerifyingCard() {
  return (
    <AuthShell>
      <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
      <p className="mt-10 mb-6 text-center text-sm text-gray-500" role="status">
        Verifying your link...
      </p>
    </AuthShell>
  );
}