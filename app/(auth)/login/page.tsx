// app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/login-form";
import { GuestOnly } from "@/components/auth/guest-only"; // your file name may differ

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}