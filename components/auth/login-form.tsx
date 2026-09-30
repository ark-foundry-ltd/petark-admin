// components/auth/LoginForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/context/auth-context";
import { ROUTES, getErrorMessage, postLoginPath } from "@/lib/auth";

import { Alert } from "./alert";
import { AuthHeader, AuthShell, AuthTitle, FooterNote } from "./auth-shell";
import { Mail } from "lucide-react";
import { SubmitButton } from "./submit-bn";
import { PasswordField, TextField } from "./text-field";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);
      router.replace(postLoginPath(user));
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell footer={<FooterNote>Authorized personnel only</FooterNote>}>
      <AuthHeader subtitle="Command" badge="ADMIN" />
      <AuthTitle
        title="Welcome back"
        description="Sign in to access your administrative workspace and clinic network governance."
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error ? (
          <Alert variant="error" title="Authentication failed" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <TextField
          label="Work Email"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="you@petark.cloud"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          labelRight={
            <Link
              href={ROUTES.forgotPassword}
              className="text-xs text-acc-clr hover:text-green-700"
            >
              Forgot password?
            </Link>
          }
          required
        />

        <SubmitButton loading={submitting} loadingText="Signing in...">
          Sign in to Command Center
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500 sec-ff">
        Access is by invitation. Contact your PetArk administrator to get an account.
      </p>
    </AuthShell>
  );
}