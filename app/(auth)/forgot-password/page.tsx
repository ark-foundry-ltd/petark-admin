// app/(auth)/forgot-password/page.tsx

import { Metadata } from "next";
import ForgotPsw from "@/components/auth/forgot-psw-form";

export const metadata: Metadata = {
    title: "Forgot Password",
};

export default function ForgotPasswordPage() {
    return <ForgotPsw />;
}