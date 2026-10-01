'use client';

// Admin "Users" screen: clinics and pet owners, with search, filters and detail drawers.

import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  getErrorMessage,
  listClinics,
  listOwners,
  type AdminClinic,
  type AdminOwner
} from '@/lib/admin-users';
import { ClinicDetail, OwnerDetail } from './detail-panels';
import { Pager, PresenceBadge, StatusBadge, formatDate, lastSeen } from './user-ui';

type Tab = 'clinics' | 'owners';

const PAGE_SIZE = 15;

export default function UsersComp() {
  const [tab, setTab] = useState<Tab>('clinics');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [owners, setOwners] = useState<AdminOwner[]>([]);
  const [meta, setMeta] = useState({ pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<{ type: Tab; id: string } | null>(null);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const common = {
      page,
      limit: PAGE_SIZE,
      search,
      presence: onlineOnly ? ('online' as const) : undefined
    };

    const request =
      tab === 'clinics'
        ? listClinics(common).then((res) => {
            if (cancelled) return;
            setClinics(res.clinics);
            setMeta({ pages: res.pages, total: res.total });
          })
        : listOwners(common).then((res) => {
            if (cancelled) return;
            setOwners(res.owners);
            setMeta({ pages: res.pages, total: res.total });
          });

    request
      .catch((e) => !cancelled && toast.error(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [tab, page, search, onlineOnly]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setPage(1);
    setSearchInput('');
    setSearch('');
    setOnlineOnly(false);
  };

  const rows = tab === 'clinics' ? clinics : owners;

  return (
    <div className="p-4 md:p-3">
      <h1 className="text-2xl font-semibold text-black-clr sec-ff">Users</h1>
      <p className="mt-1 text-sm text-black/60 pry-ff">Clinics and pet owners on the platform.</p>

      {/* Tabs */}
      <div className="mt-5 inline-flex gap-1 rounded-lg bg-bg-clr p-1 sec-ff">
        {(['clinics', 'owners'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm ${
              tab === t ? 'bg-pry-clr font-medium shadow-sm' : 'text-black/60'
            }`}
          >
            {t === 'clinics' ? 'Clinics' : 'Pet owners'}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 sec-ff">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={tab === 'clinics' ? 'Search clinics…' : 'Search owners…'}
            className="w-full rounded-md border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-acc-clr"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-black/70">
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(e) => {
              setOnlineOnly(e.target.checked);
              setPage(1);
            }}
          />
          Online now
        </label>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-pry-clr">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-black/50 sec-ff">
            {tab === 'clinics' ? (
              <tr>
                <th className="px-4 py-3">Clinic</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Presence</th>
                <th className="px-4 py-3">Last seen</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            ) : (
              <tr>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Pets</th>
                <th className="px-4 py-3">Presence</th>
                <th className="px-4 py-3">Last seen</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-black/5 pry-ff">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto animate-spin text-black/40" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-black/50">
                  No {tab === 'clinics' ? 'clinics' : 'pet owners'} found.
                </td>
              </tr>
            ) : tab === 'clinics' ? (
              clinics.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => setSelected({ type: 'clinics', id: c._id })}
                  className="cursor-pointer hover:bg-black/[0.03]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-black-clr">{c.clinicName || c.fullname || 'Unnamed clinic'}</p>
                    <p className="text-xs text-black/50">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PresenceBadge presence={c.presence} />
                  </td>
                  <td className="px-4 py-3 text-black/60">{lastSeen(c.lastActiveAt, c.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-black/60">{formatDate(c.createdAt)}</td>
                </tr>
              ))
            ) : (
              owners.map((o) => (
                <tr
                  key={o._id}
                  onClick={() => setSelected({ type: 'owners', id: o._id })}
                  className="cursor-pointer hover:bg-black/3"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-black-clr">{o.fullname || '—'}</p>
                    <p className="text-xs text-black/50">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-black/60">{o.phoneNumber || '—'}</td>
                  <td className="px-4 py-3 text-black/60">{o.petCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <PresenceBadge presence={o.presence} />
                  </td>
                  <td className="px-4 py-3 text-black/60">{lastSeen(o.lastActiveAt, o.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-black/60">{formatDate(o.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} pages={meta.pages} total={meta.total} onChange={setPage} />

      {selected?.type === 'clinics' && (
        <ClinicDetail id={selected.id} onClose={() => setSelected(null)} />
      )}
      {selected?.type === 'owners' && (
        <OwnerDetail id={selected.id} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}