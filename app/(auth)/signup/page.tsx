// app/(auth)/signup/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create your admin account | PetArk Command",
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}