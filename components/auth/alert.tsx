// components/auth/alert.tsx
import type { ReactNode } from "react";

import { CircleAlert, CircleCheck, X } from "lucide-react";

interface AlertProps {
  variant: "error" | "success";
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
}

export function Alert({ variant, title, children, onDismiss }: Readonly<AlertProps>) {
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {isError ? (
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      ) : (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      )}

      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <p className={title ? "text-xs opacity-90" : "text-xs"}>{children}</p>
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded p-0.5 text-red-400 transition hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}