// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password | PetArk Command",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}