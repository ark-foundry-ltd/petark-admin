// components/auth/ForgotPasswordForm.tsx
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { ROUTES, forgotPassword, getErrorMessage, maskEmail } from "@/lib/auth";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle } from "./auth-shell";
import { ArrowLeft, Mail } from "lucide-react";
import { SubmitButton } from "./submit-bn";
import { TextField } from "./text-field";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const address = email.trim();
    setError(null);
    setSentTo(null);
    setSubmitting(true);

    try {
      await forgotPassword(address);
      setSentTo(address);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="pry-ff">
        <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
        <AuthTitle
          title="Forgot your password?"
          description={
            <span className="sec-ff">
              Enter your registered administrator email address and we will send you a password
              reset link.
            </span>
          }
        />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {sentTo ? (
            <Alert variant="success">
              <span className="sec-ff">
                If an account exists for {maskEmail(sentTo)}, a reset link has been sent. Check
                your inbox or spam folder. The link is valid for 30 minutes.
              </span>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="error" title="Could not send link" onDismiss={() => setError(null)}>
              <span className="sec-ff">{error}</span>
            </Alert>
          ) : null}

          <TextField
            label="Admin Work Email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="you@petark.cloud"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <SubmitButton loading={submitting} loadingText="Sending...">
            Send reset link
          </SubmitButton>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5">
          <Link
            href={ROUTES.login}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sec-clr hover:text-black-clr transition pry-ff"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}