import { History, Loader2 } from 'lucide-react';
import type { ClinicSubscriptionRow } from '@/lib/admin-subscriptions';
import { DaysLeft, PlanBadge, StateBadge, capitalize, formatDate } from './shared';

interface Props {
  rows: ClinicSubscriptionRow[];
  loading: boolean;
  onViewHistory: (row: ClinicSubscriptionRow) => void;
}

const HEADERS = ['Clinic', 'Status', 'Plan', 'Billing', 'Start date', 'Expires / renews', 'Days left', ''];

export default function SubscriptionTable({ rows, loading, onViewHistory }: Readonly<Props>) {
  return (
    <div className="relative overflow-x-auto rounded-2xl border border-green-200 bg-pry-clr">
      <table className="w-full min-w-225 text-sm">
        <thead className="bg-green-50 text-left text-gray-600">
          <tr>
            {HEADERS.map((h) => (
              <th key={h} className="px-4 py-3 font-medium sec-ff uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.clinicId} className="hover:bg-green-50/50">
              <td className="px-4 py-3 pry-ff">
                <p className="font-medium text-sec-clr">{r.clinicName || 'Unnamed clinic'}</p>
                <p className="text-xs text-gray-500">{r.email}</p>
              </td>
              <td className="px-4 py-3 pry-ff"><StateBadge state={r.state} /></td>
              <td className="px-4 py-3"><PlanBadge plan={r.plan} /></td>
              <td className="px-4 py-3 pry-ff">
                {r.state === 'trial' ? 'Free trial' : capitalize(r.billingCycle)}
              </td>
              <td className="px-4 py-3 pry-ff">{formatDate(r.startedAt)}</td>
              <td className="px-4 py-3 pry-ff">{formatDate(r.expiresAt)}</td>
              <td className="px-4 py-3 pry-ff"><DaysLeft days={r.daysRemaining} /></td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onViewHistory(r)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-pry-clr px-2.5 py-1.5 text-xs font-medium text-sec-clr hover:bg-gray-100 cursor-pointer pry-ff"
                >
                  <History size={14} /> History
                </button>
              </td>
            </tr>
          ))}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={HEADERS.length} className="px-4 py-12 text-center text-tet-clr sec-ff">
                No clinics match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-pry-clr/60">
          <Loader2 className="animate-spin text-acc-clr" />
        </div>
      )}
    </div>
  );
}