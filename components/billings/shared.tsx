// components/shared.tsx

import type { SubscriptionState } from '@/lib/admin-subscriptions';

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-NG', { dateStyle: 'medium' }) : '—';

export const formatNaira = (n?: number | null) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0
      }).format(n);

export const capitalize = (s?: string | null) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

const STATE_STYLES: Record<SubscriptionState, { label: string; className: string }> = {
  subscribed: { label: 'Subscribed', className: 'bg-green-50 text-green-700 ring-green-600/20' },
  trial: { label: 'Pro trial', className: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  unsubscribed: { label: 'Unsubscribed', className: 'bg-gray-100 text-gray-600 ring-gray-500/20' }
};

export function StateBadge({ state }: { state: SubscriptionState }) {
  const s = STATE_STYLES[state];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  );
}

const PLAN_STYLES: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  starter: 'bg-amber-100 text-amber-800',
  standard: 'bg-sky-100 text-sky-800',
  pro: 'bg-green-200 text-green-900',
  enterprise: 'bg-neutral-800 text-white'
};

export function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold sec-ff ${
        PLAN_STYLES[plan] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {capitalize(plan)}
    </span>
  );
}

export function DaysLeft({ days }: { days: number | null }) {
  if (days == null) return <span className="text-gray-400">—</span>;
  const tone =
    days <= 3 ? 'text-red-600 font-semibold' : days <= 7 ? 'text-amber-600 font-medium' : 'text-gray-700';
  return <span className={tone}>{days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}</span>;
}

export function DaysLeftPill({ days }: { days: number | null }) {
  if (days == null) return null;
  const tone =
    days <= 3 ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-white text-gray-700 ring-gray-300';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {days === 0 ? 'Today' : `${days}d left`}
    </span>
  );
}