// components/auth/SubmitButton.tsx
import type { ReactNode } from "react";

import { ArrowRight, LoaderCircle } from "lucide-react";

interface SubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  children,
  loading = false,
  disabled = false,
  loadingText = "Please wait...",
}: Readonly<SubmitButtonProps>) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-acc-clr text-sm font-semibold text-pry-clr cursor-pointer shadow-sm transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 pry-ff"
    >
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}