'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/admin-users';
import {
  getClinicSubscriptionHistory,
  type SubscriptionEventType,
  type SubscriptionHistoryEntry
} from '@/lib/admin-subscriptions';
import { capitalize, formatDate, formatNaira } from './shared';

const EVENT_LABELS: Record<SubscriptionEventType, { label: string; className: string }> = {
  purchase: { label: 'Subscribed', className: 'bg-emerald-50 text-emerald-700' },
  renewal: { label: 'Renewed', className: 'bg-emerald-50 text-emerald-700' },
  upgrade: { label: 'Upgraded', className: 'bg-indigo-50 text-indigo-700' },
  downgrade: { label: 'Downgraded', className: 'bg-amber-50 text-amber-700' },
  expired: { label: 'Expired', className: 'bg-red-50 text-red-700' },
  trial_started: { label: 'Pro trial started', className: 'bg-sky-50 text-sky-700' },
  trial_expired: { label: 'Pro trial ended', className: 'bg-gray-100 text-gray-600' }
};

interface Props {
  clinic: { id: string; name: string } | null;
  onClose: () => void;
}

export default function HistoryDrawer({ clinic, onClose }: Props) {
  const [entries, setEntries] = useState<SubscriptionHistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // reset when a different clinic is opened
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries([]);
    setPage(1);
    setPages(1);
  }, [clinic?.id]);

  useEffect(() => {
    if (!clinic) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    getClinicSubscriptionHistory(clinic.id, { page, limit: 10 })
      .then((res) => {
        if (cancelled) return;
        setEntries((prev) => (page === 1 ? res.history : [...prev, ...res.history]));
        setPages(res.pages);
      })
      .catch((err) => !cancelled && toast.error(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [clinic, page]);

  if (!clinic) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-gray-200 p-5">
          <div>
            <p className="text-xs text-gray-500">Subscription history</p>
            <h2 className="text-lg font-semibold text-gray-900">{clinic.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {entries.map((e) => {
            const ev = EVENT_LABELS[e.type] ?? { label: e.type, className: 'bg-gray-100 text-gray-600' };
            return (
              <div key={e._id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ev.className}`}>
                    {ev.label}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(e.createdAt)}</span>
                </div>

                <p className="mt-2 text-sm font-medium text-gray-900">
                  {capitalize(e.plan)}
                  {e.billingCycle ? ` · ${capitalize(e.billingCycle)}` : ''}
                  {e.previousPlan ? (
                    <span className="font-normal text-gray-500"> (from {capitalize(e.previousPlan)})</span>
                  ) : null}
                </p>

                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                  <dt>Period start</dt>
                  <dd className="text-right">{formatDate(e.startedAt)}</dd>
                  <dt>Period end</dt>
                  <dd className="text-right">{formatDate(e.expiresAt)}</dd>
                  {e.amount != null && (
                    <>
                      <dt>Amount paid</dt>
                      <dd className="text-right">{formatNaira(e.amount)}</dd>
                    </>
                  )}
                  {e.reference && (
                    <>
                      <dt>Reference</dt>
                      <dd className="truncate text-right font-mono">{e.reference}</dd>
                    </>
                  )}
                </dl>

                {e.backfilled && (
                  <p className="mt-2 text-[11px] text-gray-400">Imported from existing subscription data</p>
                )}
              </div>
            );
          })}

          {!loading && entries.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500">No subscription history yet.</p>
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-gray-500" />
            </div>
          )}

          {!loading && page < pages && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Load more
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}