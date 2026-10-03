// components/billings/billing-summary.tsx

import type { SubscriptionState, SubscriptionSummary } from '@/lib/admin-subscriptions';
import { PlanBadge, capitalize, formatNaira } from './shared';

interface Props {
  summary: SubscriptionSummary | null;
  onSelect?: (state: SubscriptionState) => void;
}

export function SummaryCards({ summary, onSelect }: Readonly<Props>) {
  const paidTiers = summary?.tiers.map((t) => capitalize(t.plan)).join(', ');

  const cards: {
    label: string;
    value?: string | number;
    hint?: string;
    highlight?: boolean;
    state?: SubscriptionState;
  }[] = [
    { label: 'MRR', value: summary ? formatNaira(summary.mrr) : undefined, highlight: true },
    { label: 'Paid clinics', value: summary?.subscribed, hint: paidTiers || undefined, state: 'subscribed' },
    {
      label: 'Active trials',
      value: summary?.onTrial,
      hint:
        summary && summary.trialsEndingIn7Days > 0
          ? `${summary.trialsEndingIn7Days} ending within 7 days`
          : undefined,
      state: 'trial'
    },
    { label: 'Expiring in 7 days', value: summary?.expiringIn7Days, hint: 'Paid plans' }
  ];

  return (
    // Mobile/tablet: swipeable row that bleeds to the screen edges.
    // Desktop (lg+): normal 4-column grid.
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {cards.map((c) => (
        <button
          key={c.label}
          type="button"
          disabled={!c.state}
          onClick={() => c.state && onSelect?.(c.state)}
          className={`w-56 shrink-0 snap-start rounded-2xl border border-green-200 p-5 text-left sm:w-64 lg:w-auto ${
            c.highlight ? 'bg-green-100' : 'bg-green-50'
          } ${c.state ? 'transition hover:border-green-400' : 'cursor-default'}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-800 sec-ff">{c.label}</p>
          <p className="mt-2 truncate text-3xl font-bold text-gray-950 pry-ff">
            {c.value ?? <span className="text-gray-300">…</span>}
          </p>
          {c.hint && <p className="mt-1 text-xs text-tet-clr sec-ff">{c.hint}</p>}
        </button>
      ))}
    </div>
  );
}

export function TierBreakdown({ summary }: Readonly<{ summary: SubscriptionSummary | null }>) {
  const tiers = summary?.tiers ?? [];
  const mrr = summary?.mrr ?? 0;

  return (
    <section className="min-w-0 rounded-2xl border border-green-200 bg-pry-clr p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-black-clr sec-ff">Tier breakdown</h2>
      <p className="text-sm text-tet-clr pry-ff">Clinics and MRR contribution per plan</p>

      <div className="mt-4 space-y-3">
        {tiers.map((t) => {
          const share = mrr > 0 ? Math.round((t.mrr / mrr) * 100) : 0;
          return (
            <div key={t.plan} className="rounded-xl bg-green-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex items-center gap-3">
                  <PlanBadge plan={t.plan} />
                  <span className="text-sm text-tet-clr pry-ff">
                    {t.clinics} clinic{t.clinics === 1 ? '' : 's'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-sec-clr pry-ff">{formatNaira(t.mrr)}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-green-100">
                <div className="h-full rounded-full bg-acc-clr" style={{ width: `${share}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500 pry-ff">
                {share}% of MRR · {t.monthly} monthly · {t.annual} annual
              </p>
            </div>
          );
        })}

        {summary && tiers.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">No paying clinics yet.</p>
        )}
        {!summary && <p className="py-6 text-center text-sm text-gray-400">Loading…</p>}
      </div>
    </section>
  );
}