// components/auth/auth-shell.tsx
import type { ReactNode } from "react";

import { PawPrint } from "lucide-react";

interface AuthShellProps {
  children: ReactNode;
  /** Small pill shown under the card */
  footer?: ReactNode;
  /** Wider card, used by the register screen */
  wide?: boolean;
}

export function AuthShell({ children, footer, wide = false }: Readonly<AuthShellProps>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d9f7e6] px-4 py-10">
      <div className="w-full">
        <div
          className={`mx-auto w-full ${
            wide ? "max-w-xl" : "max-w-md"
          } rounded-3xl bg-white p-6 shadow-xl shadow-emerald-900/10 sm:p-8`}
        >
          {children}
        </div>
        {footer ? <div className="mt-4 flex justify-center">{footer}</div> : null}
      </div>
    </main>
  );
}

interface AuthHeaderProps {
  /** Text after "PetArk", e.g. "Command" or "Enterprise" */
  subtitle?: string;
  badge?: string;
}

export function AuthHeader({ subtitle = "Command", badge = "ADMIN" }: Readonly<AuthHeaderProps>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 text-white">
          <PawPrint className="h-5 w-5" />
        </span>
        <span className="text-base font-bold text-gray-900">
          PetArk <span className="font-medium text-gray-500">{subtitle}</span>
        </span>
      </div>
      <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
        {badge}
      </span>
    </div>
  );
}

export function AuthTitle({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="mt-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
      {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
    </div>
  );
}

export function FooterNote({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <p className="rounded-full border border-emerald-100 bg-white/70 px-3.5 py-1.5 text-xs text-gray-500">
      {children}
    </p>
  );
}