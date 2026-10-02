// components/referrals/referral-ui.tsx
"use client";

import { ChevronLeft, ChevronRight, Inbox, TriangleAlert } from "lucide-react";

const BADGE_STYLES: Record<string, string> = {
  signed_up: "bg-line-clr/40 text-txt-clr",
  converted: "bg-tint-clr text-indigo-400",
  rewarded: "bg-pry-clr text-acc-clr",
  rejected: "bg-txt-clr/10 text-red-400",
  pending: "bg-line-clr/40 text-txt-clr",
  accepted: "bg-tint-clr text-acc-clr",
  declined: "bg-txt-clr/10 text-orange-400",
};

const BADGE_LABELS: Record<string, string> = {
  signed_up: "Signed up",
  converted: "Converted",
  rewarded: "Rewarded",
  rejected: "Rejected",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
};

export function labelFor(status: string): string {
  return (
    BADGE_LABELS[status] ?? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}

export function StatusBadge({ status }: Readonly<{ status: string }>) {
  return (
    <span
      className={`pry-ff inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        BADGE_STYLES[status] ?? "bg-pry-clr/40"
      }`}
    >
      {labelFor(status)}
    </span>
  );
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(
    date
  );
}

export function Pagination({
  page,
  pages,
  total,
  onChange,
}: Readonly<{ page: number; pages: number; total: number; onChange: (page: number) => void }>) {
  if (pages <= 1) {
    return <p className="sec-ff mt-4 text-xs text-muted-clr">{total} total</p>;
  }

  const buttonClass =
    "rounded-full border border-line-clr p-2 text-txt-clr transition-colors hover:bg-pry-clr/10 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="sec-ff text-xs text-muted-clr">
        Page {page} of {pages} &middot; {total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={buttonClass}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className={buttonClass}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: Readonly<{ title: string; hint?: string }>) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-gray-400" />
      <p className="sec-ff mt-3 text-sm font-semibold text-gray-400">{title}</p>
      {hint ? <p className="pry-ff mt-1 max-w-sm text-sm text-black-clr">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: Readonly<{ message: string; onRetry?: () => void }>) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-line-clr bg-tint-soft-clr px-6 py-10 text-center"
    >
      <TriangleAlert className="h-8 w-8 text-muted-clr" />
      <p className="pry-ff mt-3 text-sm font-semibold text-txt-clr">Could not load this</p>
      <p className="sec-ff mt-1 text-sm text-muted-clr">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="pry-ff mt-4 rounded-full bg-acc-clr px-5 py-2 text-sm font-semibold text-pry-clr transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function RowsSkeleton({ rows = 5 }: Readonly<{ rows?: number }>) {
  return (
    <ul aria-hidden="true" className="space-y-2">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="h-16 animate-pulse rounded-2xl bg-pry-clr/10" />
      ))}
    </ul>
  );
}

export const inputClass =
  "w-full rounded-xl border border-tet-clr bg-tint-soft-clr px-3 py-2.5 text-sm text-sec-clr outline-none transition placeholder:text-sec-clr focus:border-pry-clr focus:ring-2 sec-ff focus:ring-acc-clr";