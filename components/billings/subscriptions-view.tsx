// components/billings/subscriptions-view.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/admin-users';
import {
  getSubscriptionSummary,
  listSubscriptions,
  type BillingCycle,
  type ClinicSubscriptionRow,
  type SubscriptionState,
  type SubscriptionSummary
} from '@/lib/admin-subscriptions';
import { SummaryCards, TierBreakdown } from './billing-summary';
import TransactionsTable from './transactions-table';
import ExpiryList from './expiry-list';
import SubscriptionTable from './subscription-table';
import HistoryDrawer from '@/components/billings/history-drawer';

const LIMIT = 15;

const inputClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-acc-clr sec-ff';

export default function SubscriptionsView() {
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [historyFor, setHistoryFor] = useState<{ id: string; name: string } | null>(null);

  // All-clinics table
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [state, setState] = useState<SubscriptionState | ''>('');
  const [plan, setPlan] = useState('');
  const [cycle, setCycle] = useState<BillingCycle | ''>('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ClinicSubscriptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const requestId = useRef(0);
  const clinicsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getSubscriptionSummary()
      .then((res) => setSummary(res.summary))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const id = ++requestId.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    listSubscriptions({
      page,
      limit: LIMIT,
      search: debouncedSearch,
      state: state || undefined,
      plan: plan || undefined,
      billingCycle: cycle || undefined
    })
      .then((res) => {
        if (id !== requestId.current) return;
        setRows(res.subscriptions);
        setTotal(res.total);
        setPages(res.pages);
      })
      .catch((err) => id === requestId.current && toast.error(getErrorMessage(err)))
      .finally(() => id === requestId.current && setLoading(false));
  }, [page, debouncedSearch, state, plan, cycle]);

  const filterFromCard = (s: SubscriptionState) => {
    setState(s);
    setPage(1);
    clinicsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openHistory = (r: ClinicSubscriptionRow) =>
    setHistoryFor({ id: r.clinicId, name: r.clinicName || 'Unnamed clinic' });

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold text-black-clr sec-ff">Subscriptions &amp; Billing</h1>
        <p className="text-sm text-tet-clr pry-ff">
          Platform billing data is fully visible to admins, including Paystack transactions.
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-2xl border border-acc-clr bg-bg-clr p-4 text-sm text-sec-clr pry-ff">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-acc-clr" />
        <p>
          Billing is platform-owned data, so amounts, plans and cycles are shown in full. Clinic sales
          and inventory records remain aggregate-only elsewhere in this tool.
        </p>
      </div>

      <SummaryCards summary={summary} onSelect={filterFromCard} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <TierBreakdown summary={summary} />
          <TransactionsTable />
        </div>

        <div className="space-y-6">
          <ExpiryList
            title="Trial countdown pipeline"
            subtitle="Trials ordered by urgency"
            type="trial"
            days={30}
            emptyText="No active trials."
            onOpen={openHistory}
          />
          <ExpiryList
            title="Upcoming expirations"
            subtitle="Paid plans expiring in the next 30 days"
            type="paid"
            days={30}
            emptyText="No paid plans expiring soon."
            onOpen={openHistory}
          />
        </div>
      </div>

      <section ref={clinicsRef} className="scroll-mt-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-black-clr sec-ff">All clinics</h2>
          <p className="text-sm text-tet-clr pry-ff">Status, plan, billing cycle and renewal date for every clinic</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-55 flex-1 sec-ff">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tet-clr" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search clinic name or email"
              className={`${inputClass} w-full pl-9`}
            />
          </div>

          <select className={inputClass} value={state}
            onChange={(e) => { setState(e.target.value as SubscriptionState | ''); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="subscribed">Subscribed</option>
            <option value="trial">Pro trial</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>

          <select className={inputClass} value={plan}
            onChange={(e) => { setPlan(e.target.value); setPage(1); }}>
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="standard">Standard</option>
            <option value="pro">Pro</option>
          </select>

          <select className={inputClass} value={cycle}
            onChange={(e) => { setCycle(e.target.value as BillingCycle | ''); setPage(1); }}>
            <option value="">Monthly &amp; annual</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>

        <SubscriptionTable rows={rows} loading={loading} onViewHistory={openHistory} />

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{total} clinic{total === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span>Page {page} of {Math.max(pages, 1)}</span>
            <button
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <HistoryDrawer clinic={historyFor} onClose={() => setHistoryFor(null)} />
    </main>
  );
}