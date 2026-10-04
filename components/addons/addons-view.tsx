// components/addons/addons-view.tsx
"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import { Can } from "@/components/auth/can";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getAddonOverview,
  grantAddon,
  listAddonPurchases,
  type AddonListResponse,
  type AddonOverview,
  type AddonResource,
  type AddonSource,
} from "@/lib/admin-addons";

const RESOURCE_LABEL: Record<AddonResource, string> = {
  treatments: "Treatments",
  remindersPerMonth: "Reminders",
  inventorySkus: "Inventory items",
};

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const formatDate = (v: string) =>
  new Date(v).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const errorText = (error: unknown) =>
  error instanceof AxiosError
    ? (error.response?.data?.message ?? error.message)
    : "Something went wrong.";

function Stat({
  label,
  value,
  note,
  tone,
  loading,
}: Readonly<{ label: string; value: string; note?: string; tone: "strong" | "soft"; loading: boolean }>) {
  return (
    <div
      className={`rounded-2xl border border-gray-300 p-5 ${
        tone === "strong" ? "bg-tint-clr" : "bg-tint-soft-clr"
      }`}
    >
      <p className="pry-ff text-xs font-semibold uppercase tracking-wide text-black-clr">{label}</p>
      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded-lg bg-pry-clr/20" />
      ) : (
        <>
          <p className="pry-ff mt-2 text-3xl font-extrabold text-txt-clr">{value}</p>
          {note ? <p className="pry-ff mt-1 text-sm text-gray-400">{note}</p> : null}
        </>
      )}
    </div>
  );
}

function NoAccess() {
  return (
    <div className="rounded-2xl border border-gray-300 bg-tint-soft-clr p-8 text-center">
      <p className="pry-ff text-sm font-semibold text-txt-clr">You do not have access to add-ons</p>
      <p className="sec-ff mt-1 text-sm text-muted-clr">
        Ask a super admin to grant the view subscriptions permission.
      </p>
    </div>
  );
}

const inputClass =
  "sec-ff w-full rounded-xl border border-gray-300 bg-bg-clr px-3 py-2 text-sm text-txt-clr focus:outline-none focus:ring-2 focus:ring-acc-clr";

function GrantPanel({ onGranted, onClose }: Readonly<{ onGranted: () => void; onClose: () => void }>) {
  const [clinicEmail, setClinicEmail] = useState("");
  const [resource, setResource] = useState<AddonResource>("treatments");
  const [packs, setPacks] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const row = await grantAddon({ clinicEmail: clinicEmail.trim(), resource, packs, note: note.trim() });
      setMessage({
        ok: true,
        text: `Granted +${row.units} ${RESOURCE_LABEL[row.resource].toLowerCase()} to ${
          row.clinic?.clinicName ?? "the clinic"
        } for ${row.month}.`,
      });
      setClinicEmail("");
      setNote("");
      onGranted();
    } catch (error) {
      setMessage({ ok: false, text: errorText(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 grid gap-4 rounded-2xl border border-gray-300 bg-tint-soft-clr p-5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <p className="pry-ff text-sm font-semibold text-txt-clr">Grant add-on units for free</p>
        <p className="sec-ff mt-0.5 text-xs text-muted-clr">
          Applies to the current month only. Recorded against your name with the reason below.
        </p>
      </div>
      <label className="sec-ff text-xs font-medium text-sec-clr">
        Clinic email
        <input
          type="email"
          required
          value={clinicEmail}
          onChange={(e) => setClinicEmail(e.target.value)}
          className={`${inputClass} mt-1`}
          placeholder="clinic@example.com"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="sec-ff text-xs font-medium text-sec-clr">
          Add-on
          <select
            value={resource}
            onChange={(e) => setResource(e.target.value as AddonResource)}
            className={`${inputClass} mt-1`}
          >
            <option value="treatments">Treatments</option>
            <option value="remindersPerMonth">Reminders</option>
          </select>
        </label>
        <label className="sec-ff text-xs font-medium text-sec-clr">
          Packs (+20 each)
          <input
            type="number"
            min={1}
            max={20}
            value={packs}
            onChange={(e) => setPacks(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            className={`${inputClass} mt-1`}
          />
        </label>
      </div>
      <label className="sec-ff text-xs font-medium text-sec-clr sm:col-span-2">
        Reason
        <input
          type="text"
          required
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${inputClass} mt-1`}
          placeholder="e.g. Goodwill after downtime on 12 Oct"
        />
      </label>
      {message && (
        <p
          role="status"
          className={`sec-ff text-sm sm:col-span-2 ${message.ok ? "text-green-700" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="pry-ff rounded-full bg-acc-clr px-5 py-2 text-sm font-semibold text-pry-clr disabled:opacity-60"
        >
          {submitting ? "Granting..." : "Grant units"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="pry-ff bg-red-200 rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-700 hover:text-pry-clr transition-all"
        >
          Close
        </button>
      </div>
    </form>
  );
}

function AddonsContent() {
  const [version, setVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [resource, setResource] = useState<AddonResource | "">("");
  const [source, setSource] = useState<AddonSource | "">("");
  const [showGrant, setShowGrant] = useState(false);

  const [overview, setOverview] = useState<{ version: number; data?: AddonOverview; error?: string } | null>(null);
  const [list, setList] = useState<{ key: string; data?: AddonListResponse; error?: string } | null>(null);

  const listKey = `${page}|${search}|${resource}|${source}|${version}`;
  const overviewLoading = overview?.version !== version;
  const listLoading = list?.key !== listKey;

  useEffect(() => {
    let cancelled = false;
    getAddonOverview()
      .then((data) => !cancelled && setOverview({ version, data }))
      .catch((error) => !cancelled && setOverview({ version, error: errorText(error) }));
    return () => {
      cancelled = true;
    };
  }, [version]);

  useEffect(() => {
    let cancelled = false;
    listAddonPurchases({ page, search, resource, source })
      .then((data) => !cancelled && setList({ key: listKey, data }))
      .catch((error) => !cancelled && setList({ key: listKey, error: errorText(error) }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);

  const stats = overview?.data;
  const rows = list?.data?.purchases ?? [];

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="pry-ff text-3xl font-extrabold tracking-tight text-txt-clr sm:text-4xl">Add-ons</h1>
          <p className="sec-ff mt-1.5 text-sm text-muted-clr sm:text-base">
            Extra treatments and reminders clinics bought, and units granted by the team.
          </p>
        </div>
        <Can permission={PERMISSIONS.MANAGE_ADDONS}>
          <button
            type="button"
            onClick={() => setShowGrant((v) => !v)}
            className="pry-ff rounded-full bg-acc-clr px-5 py-2 text-sm font-semibold text-pry-clr"
          >
            {showGrant ? "Hide grant form" : "Grant add-on"}
          </button>
        </Can>
      </div>

      <Can permission={PERMISSIONS.MANAGE_ADDONS}>
        {showGrant && (
          <GrantPanel onGranted={() => setVersion((v) => v + 1)} onClose={() => setShowGrant(false)} />
        )}
      </Can>

      {overview?.error ? (
        <p role="alert" className="sec-ff mt-4 text-sm text-muted-clr">
          Summary unavailable: {overview.error}
        </p>
      ) : (
        <section aria-label="Summary" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat
            label="Purchases this month"
            value={String(stats?.thisMonth.purchases ?? 0)}
            tone="strong"
            loading={overviewLoading}
          />
          <Stat
            label="Units sold"
            value={String(stats?.thisMonth.units ?? 0)}
            note={`${stats?.granted.units ?? 0} granted free`}
            tone="strong"
            loading={overviewLoading}
          />
          <Stat
            label="Revenue this month"
            value={formatNaira(stats?.thisMonth.revenue ?? 0)}
            tone="soft"
            loading={overviewLoading}
          />
          <Stat
            label="All-time revenue"
            value={formatNaira(stats?.allTime.revenue ?? 0)}
            note={`${stats?.allTime.purchases ?? 0} purchases`}
            tone="soft"
            loading={overviewLoading}
          />
        </section>
      )}

      <form onSubmit={applySearch} className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search clinic name or email"
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={resource}
          onChange={(e) => {
            setPage(1);
            setResource(e.target.value as AddonResource | "");
          }}
          className={`${inputClass} w-auto`}
          aria-label="Filter by add-on"
        >
          <option value="">All add-ons</option>
          <option value="treatments">Treatments</option>
          <option value="remindersPerMonth">Reminders</option>
          <option value="inventorySkus">Inventory items</option>
        </select>
        <select
          value={source}
          onChange={(e) => {
            setPage(1);
            setSource(e.target.value as AddonSource | "");
          }}
          className={`${inputClass} w-auto`}
          aria-label="Filter by source"
        >
          <option value="">Purchased and granted</option>
          <option value="purchase">Purchased</option>
          <option value="admin_grant">Granted by admin</option>
        </select>
        <button
          type="submit"
          className="pry-ff rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-sec-clr hover:text-tet-clr"
        >
          Search
        </button>
      </form>

      <section aria-label="Add-on purchases" className="mt-4 overflow-x-auto rounded-2xl border border-gray-300">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-tint-soft-clr">
            <tr className="pry-ff text-xs font-semibold uppercase tracking-wide text-black-clr">
              <th className="px-4 py-3">Clinic</th>
              <th className="px-4 py-3">Add-on</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="sec-ff divide-y divide-gray-300 text-sm text-txt-clr">
            {listLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-clr">
                  Loading...
                </td>
              </tr>
            ) : list?.error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-clr">
                  {list.error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-clr">
                  No add-on purchases match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={listLoading ? "opacity-60" : undefined}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.clinic?.clinicName ?? "Unknown clinic"}</p>
                    <p className="text-xs text-muted-clr">{row.clinic?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3">{RESOURCE_LABEL[row.resource] ?? row.resource}</td>
                  <td className="px-4 py-3">
                    +{row.units}
                    <span className="text-xs text-muted-clr"> ({row.packs} {row.packs === 1 ? "pack" : "packs"})</span>
                  </td>
                  <td className="px-4 py-3">{row.price > 0 ? formatNaira(row.price) : "Free"}</td>
                  <td className="px-4 py-3">
                    {row.source === "admin_grant" ? (
                      <>
                        <p>Granted</p>
                        <p className="text-xs text-muted-clr">
                          {row.grantedByName ? `by ${row.grantedByName}` : ""}
                          {row.note ? `: ${row.note}` : ""}
                        </p>
                      </>
                    ) : (
                      "Purchased"
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(row.purchasedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {list?.data && list.data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="sec-ff text-sm text-muted-clr">
            Page {list.data.page} of {list.data.pages} · {list.data.total} records
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="pry-ff rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-sec-clr disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= list.data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="pry-ff rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-sec-clr disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AddonsView() {
  return (
    <Can permission={PERMISSIONS.VIEW_SUBSCRIPTIONS} fallback={<NoAccess />}>
      <AddonsContent />
    </Can>
  );
}