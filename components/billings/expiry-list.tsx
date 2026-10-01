'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/admin-users';
import { listUpcomingExpirations, type ClinicSubscriptionRow } from '@/lib/admin-subscriptions';
import { DaysLeftPill, PlanBadge, formatDate } from './shared';

interface Props {
  title: string;
  subtitle: string;
  type: 'trial' | 'paid';
  emptyText: string;
  days?: number;
  limit?: number;
  onOpen: (row: ClinicSubscriptionRow) => void;
}

export default function ExpiryList({ title, subtitle, type, emptyText, days = 30, limit = 6, onOpen }: Readonly<Props>) {
  const [rows, setRows] = useState<ClinicSubscriptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listUpcomingExpirations({ type, days, limit })
      .then((res) => {
        if (cancelled) return;
        setRows(res.subscriptions);
        setTotal(res.total);
      })
      .catch((err) => !cancelled && toast.error(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [type, days, limit]);

  return (
    <section className="rounded-2xl border border-green-200 bg-pry-clr p-5">
      <h2 className="text-lg font-semibold text-gray-black-clr sec-ff">{title}</h2>
      <p className="text-sm text-tet-clr pry-ff">{subtitle}</p>

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <button
            key={r.clinicId}
            type="button"
            onClick={() => onOpen(r)}
            className="flex w-full items-center justify-between gap-3 rounded-xl bg-green-50 p-3 text-left transition hover:bg-green-100 cursor-pointer"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-sec-clr sec-ff">{r.clinicName || 'Unnamed clinic'}</p>
              <div className="mt-1 flex items-center gap-2 pry-ff">
                <PlanBadge plan={r.plan} />
                <span className="text-xs text-tet-clr">{formatDate(r.expiresAt)}</span>
              </div>
            </div>
            <DaysLeftPill days={r.daysRemaining} />
          </button>
        ))}

        {loading && <p className="py-6 text-center text-sm text-gray-400">Loading…</p>}
        {!loading && rows.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">{emptyText}</p>
        )}
        {!loading && total > rows.length && (
          <p className="text-center text-xs text-gray-500">
            Showing {rows.length} of {total}
          </p>
        )}
      </div>
    </section>
  );
}