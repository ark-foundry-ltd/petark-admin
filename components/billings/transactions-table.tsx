'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/admin-users';
import { listTransactions, type AdminTransaction } from '@/lib/admin-subscriptions';
import { PlanBadge, capitalize, formatDate, formatNaira } from './shared';

const LIMIT = 8;

export default function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [rows, setRows] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    listTransactions({ page, limit: LIMIT })
      .then((res) => {
        if (cancelled) return;
        setRows(res.transactions);
        setPages(res.pages);
      })
      .catch((err) => {
        if (cancelled) return;
        if ((err as AxiosError).response?.status === 403) setForbidden(true);
        else toast.error(getErrorMessage(err));
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <section className="min-w-0 rounded-2xl border border-green-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-black-clr sec-ff">Paystack transactions</h2>
      <p className="text-sm text-tet-clr pry-ff">Most recent platform charges</p>

      {forbidden ? (
        <p className="py-10 text-center text-sm text-tet-clr pry-ff">
          You don&apos;t have permission to view transactions.
        </p>
      ) : (
        <>
          {/* Outer box: border + loading overlay (does not scroll).
              Inner box: the horizontal scroller. */}
          <div className="relative mt-4 rounded-xl border border-green-100">
            <div
              role="region"
              aria-label="Paystack transactions table"
              tabIndex={0}
              className="overflow-x-auto overscroll-x-contain rounded-xl"
            >
              <table className="w-full min-w-160 whitespace-nowrap text-sm">
                <thead className="bg-green-50 text-left text-gray-600 sec-ff uppercase">
                  <tr>
                    {['Clinic', 'Amount', 'Date', 'Plan', 'Cycle', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((t) => (
                    <tr key={t._id}>
                      <td className="px-4 py-3 pry-ff">
                        <p className="font-medium text-sec-clr">{t.clinicName || 'Unknown clinic'}</p>
                        <p className="font-mono text-xs text-gray-500">{t.reference}</p>
                      </td>
                      <td className="px-4 py-3 font-medium pry-ff">{formatNaira(t.amount)}</td>
                      <td className="px-4 py-3 text-gray-600 pry-ff">{formatDate(t.createdAt)}</td>
                      <td className="px-4 py-3 pry-ff"><PlanBadge plan={t.plan} /></td>
                      <td className="px-4 py-3 pry-ff">
                        {capitalize(t.billingCycle)}
                        <p className="text-xs text-gray-500">{capitalize(t.type)}</p>
                      </td>
                      <td className="px-4 py-3 pry-ff">
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-acc-clr ring-1 ring-inset ring-green-600/20">
                          Success
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500 pry-ff">
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
                <Loader2 className="animate-spin text-acc-clr" />
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 text-sm text-gray-600">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="sec-ff">Page {page} of {Math.max(pages, 1)}</span>
            <button
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}