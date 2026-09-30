// components/auth/ChangePasswordForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { ROUTES, getErrorMessage } from "@/lib/auth";
import { isPasswordValid } from "@/lib/password";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle } from "./auth-shell";
import { RequirementsList, StrengthMeter } from "./password-strength";
import { SubmitButton } from "./submit-bn";
import { PasswordField } from "./text-field";

/** Shown when an admin signs in with a temporary password set by a super admin */
export default function ChangePasswordForm() {
  const router = useRouter();
  const { user, changePassword, logout } = useAuth();

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!current) {
      setError("Enter your current password.");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("Your new password does not meet all the requirements yet.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await changePassword(current, password);
      router.replace(ROUTES.home);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="pry-ff">
        <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
        <AuthTitle
          title="Change your password"
          description={
            <span className="sec-ff">
              {user?.mustChangePassword
                ? "You are using a temporary password. Choose a new one to continue."
                : "Choose a new password for your account."}
            </span>
          }
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {error ? (
            <Alert variant="error" title="Could not change password" onDismiss={() => setError(null)}>
              <span className="sec-ff">{error}</span>
            </Alert>
          ) : null}

          <PasswordField
            label="Current Password"
            name="current"
            autoComplete="current-password"
            placeholder="Your current or temporary password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />

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

          <SubmitButton loading={submitting} loadingText="Updating...">
            Update password
          </SubmitButton>
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-5 w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-800"
        >
          Sign out
        </button>
      </div>
    </AuthShell>
  );
}