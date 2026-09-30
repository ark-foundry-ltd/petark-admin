// components/auth/ResetPasswordForm.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { ROUTES, getErrorMessage, maskEmail, resetPassword } from "@/lib/auth";
import { isPasswordValid } from "@/lib/password";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle, FooterNote } from "./auth-shell";
import { InvalidLinkCard, VerifyingCard } from "./invalid-link-card";
import { RequirementsList, StrengthMeter } from "./password-strength";
import { SubmitButton } from "./submit-bn";
import { PasswordField } from "./text-field";
import { useResetLink } from "./use-reset-link";

/** Forgot-password link target: /reset-password?token=... */
export default function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const link = useResetLink(token);

  if (link.status === "verifying") return <VerifyingCard />;
  if (link.status === "invalid") return <InvalidLinkCard kind="reset" />;

  return <ResetFields token={token} email={link.info.email} />;
}

function ResetFields({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!isPasswordValid(password)) {
      setError("Your password does not meet all the requirements yet.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await resetPassword(token, password);
      await refresh();
      router.replace(ROUTES.home);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      footer={
        <FooterNote>
          <span className="sec-ff">Passwords are stored hashed</span>
        </FooterNote>
      }
    >
      <div className="pry-ff">
        <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
        <AuthTitle
          title="Create a new password"
          description={
            <span className="sec-ff">
              {`Choose a new password for ${maskEmail(email)}. It must be different from your current one.`}
            </span>
          }
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error ? (
            <Alert variant="error" title="Could not reset password" onDismiss={() => setError(null)}>
              <span className="sec-ff">{error}</span>
            </Alert>
          ) : null}

          <PasswordField
            label="New Password"
            name="password"
            autoComplete="new-password"
            placeholder="Enter a new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <StrengthMeter password={password} title="Entropy level" />

          <PasswordField
            label="Confirm New Password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Repeat the new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={mismatch ? "Passwords do not match" : undefined}
          />

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Credential requirements
            </p>
            <RequirementsList password={password} />
          </div>

          <SubmitButton loading={submitting} loadingText="Resetting...">
            Reset password &amp; sign in
          </SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}