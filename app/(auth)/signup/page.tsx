// app/(auth)/signup/page.tsx

import { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default function SignUpPage() {
    return <RegisterForm />;
}