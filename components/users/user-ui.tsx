// components/users/user-ui.tsx

'use client';

// Small shared UI pieces for the admin users screens.

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Presence } from '@/lib/admin-users';

const PRESENCE: Record<Presence, { label: string; dot: string; text: string }> = {
  online: { label: 'Online', dot: 'bg-green-500', text: 'text-green-700' },
  active: { label: 'Active', dot: 'bg-amber-500', text: 'text-amber-700' },
  inactive: { label: 'Inactive', dot: 'bg-gray-400', text: 'text-gray-600' },
  never: { label: 'No activity yet', dot: 'bg-gray-300', text: 'text-gray-500' }
};

export function PresenceBadge({ presence }: { presence: Presence }) {
  const p = PRESENCE[presence] ?? PRESENCE.never;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium sec-ff ${p.text}`}>
      <span className={`h-2 w-2 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}

// Account status (e.g. active / suspended / revoked)
export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-black/40">—</span>;
  const good = status === 'active';
  const bad = ['suspended', 'revoked', 'dismissed'].includes(status);
  const style = good
    ? 'bg-green-100 text-green-700'
    : bad
      ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-600';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}

export const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

export const lastSeen = (lastActiveAt?: string | null, lastLoginAt?: string | null) => {
  const times = [lastActiveAt, lastLoginAt].filter(Boolean).map((d) => new Date(d as string).getTime());
  if (!times.length) return '—';
  const mins = Math.floor((Date.now() - Math.max(...times)) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : formatDate(new Date(Math.max(...times)).toISOString());
};

export function Pager({
  page,
  pages,
  total,
  onChange
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between pt-3 text-sm text-black/60 pry-ff">
      <span>
        Page {page} of {Math.max(pages, 1)} · {total} total
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-black/10 p-1.5 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="rounded-md border border-black/10 p-1.5 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export function Drawer({
  title,
  onClose,
  children
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-bg-clr shadow-xl">
        <header className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h2 className="truncate text-lg font-semibold text-acc-clr sec-ff">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-black/5">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-black/50 sec-ff">{label}</p>
      <p className="mt-0.5 text-sm text-black-clr pry-ff">{value || '—'}</p>
    </div>
  );
}

export const asText = (v?: string[] | string) => (Array.isArray(v) ? v.join(', ') : v);

export const formatAddress = (
  a?: { street?: string; city?: string; state?: string; country?: string } | string | null
) => {
  if (!a) return undefined;
  if (typeof a === 'string') return a;
  return [a.street, a.city, a.state, a.country].filter(Boolean).join(', ') || undefined;
};