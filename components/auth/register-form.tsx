// components/auth/RegisterForm.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/context/auth-context";
import { ROUTES, getErrorMessage, resetPassword } from "@/lib/auth";
import { isPasswordValid } from "@/lib/password";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle, FooterNote } from "./auth-shell";
import { InvalidLinkCard, VerifyingCard } from "./invalid-link-card";
import { Mail, User } from "lucide-react";
import { RequirementsList, StrengthMeter } from "./password-strength";
import { SubmitButton } from "./submit-bn";
import { PasswordField, TextField } from "./text-field";
import { useResetLink } from "./use-reset-link";

/**
 * Invite acceptance. An admin with create_admin invites someone by email;
 * the link lands here as /register?token=...
 */
export function RegisterForm() {
  const token = useSearchParams().get("token") ?? "";
  const link = useResetLink(token);

  if (link.status === "verifying") return <VerifyingCard />;
  if (link.status === "invalid") return <InvalidLinkCard kind="invite" />;

  return <RegisterFields token={token} fullname={link.info.fullname} email={link.info.email} />;
}

function RegisterFields({
  token,
  fullname,
  email,
}: {
  token: string;
  fullname: string;
  email: string;
}) {
  const router = useRouter();
  const { refresh } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
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
    if (!acknowledged) {
      setError("Please confirm the acknowledgement to continue.");
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
    <AuthShell wide footer={<FooterNote>Passwords are stored hashed</FooterNote>}>
      <AuthHeader subtitle="Enterprise" badge="ADMIN COMMAND" />
      <AuthTitle
        title="Create your admin account"
        description="You have been invited to PetArk Command. Choose a password to activate your administrative access."
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error ? (
          <Alert variant="error" title="Could not create account" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <TextField
          label="Full Name"
          icon={<User className="h-4 w-4" />}
          value={fullname}
          readOnly
        />

        <TextField
          label="Work Email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          readOnly
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordField
            label="Confirm Password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={mismatch ? "Passwords do not match" : undefined}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <StrengthMeter password={password} title="Entropy evaluation" />
          <RequirementsList password={password} columns={2} />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-500"
          />
          I will keep my credentials confidential and use this account only for authorized PetArk
          administration.
        </label>

        <SubmitButton loading={submitting} loadingText="Creating account...">
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-semibold text-green-600 hover:text-green-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}