// components/auth/InvalidLinkCard.tsx
import Link from "next/link";

import { ROUTES } from "@/lib/auth";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle } from "./auth-shell";

export function InvalidLinkCard({ kind }: Readonly<{ kind: "invite" | "reset" }>) {
  return (
    <AuthShell>
      <div className="pry-ff">
        <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
        <AuthTitle
          title={kind === "invite" ? "Invitation unavailable" : "Reset link unavailable"}
          description={
            <span className="sec-ff">Links are single-use and expire after a short time.</span>
          }
        />

        <div className="mt-6 space-y-6">
          <Alert variant="error" title="This link is invalid or has expired">
            <span className="sec-ff">
              {kind === "invite"
                ? "Ask an administrator to send a new invitation, or request a password reset if your account already exists."
                : "Request a new password reset link to continue."}
            </span>
          </Alert>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.forgotPassword}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-acc-clr text-sm font-semibold text-pry-clr transition hover:bg-green-600 pry-ff"
            >
              Request a new link
            </Link>
            <Link
              href={ROUTES.login}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-sec-clr transition hover:bg-gray-50 pry-ff"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

export function VerifyingCard() {
  return (
    <AuthShell>
      <div className="pry-ff">
        <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
        <p className="sec-ff mt-10 mb-6 text-center text-sm text-gray-500" role="status">
          Verifying your link...
        </p>
      </div>
    </AuthShell>
  );
}