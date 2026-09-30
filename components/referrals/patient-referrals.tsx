// components/dashboard/referrals/patient-referrals.tsx
"use client";

import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";

import { listPatientReferrals } from "@/lib/referrals";
import { useDebounced, useRequest } from "@/lib/use-request";

import {
    EmptyState,
    ErrorState,
    Pagination,
    RowsSkeleton,
    StatusBadge,
    formatDate,
    inputClass,
    labelFor,
} from "./referral-ui";

/** Read-only oversight of patient referrals between clinics: metadata only */
export function PatientReferrals({ statuses }: Readonly<{ statuses: string[] }>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounced(search.trim(), 350);
  const key = JSON.stringify({ debouncedSearch, status, page, reloadKey });

  const { data, error, loading } = useRequest(
    () => listPatientReferrals({ search: debouncedSearch, status, page }),
    key
  );

  return (
    <div>
      <p className="pry-ff mb-4 text-sm text-gray-400">
        Clinic names, status and dates only. Patient records and shared clinical notes are never
        shown here.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1 border border-gray-300 rounded-xl outline-none">
          <span className="sr-only">Search by clinic</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by clinic name"
            className={`${inputClass} pl-10 pry-ff`}
          />
        </label>

        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={`${inputClass} sm:w-48 pry-ff`}
          >
            <option value="">All statuses</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {labelFor(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        {error && !data ? (
          <ErrorState message={error} onRetry={() => setReloadKey((value) => value + 1)} />
        ) : !data ? (
          <RowsSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No patient referrals found"
            hint={search || status ? "Try a different search or status." : "Nothing has been referred yet."}
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="pry-ff hidden px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-black-clr lg:grid lg:grid-cols-[1.4fr_1.4fr_0.9fr_0.7fr_0.8fr] lg:gap-4"
            >
              <span>From</span>
              <span>To</span>
              <span>Status</span>
              <span>Records</span>
              <span>Sent</span>
            </div>

            <ul className={`space-y-2 transition-opacity ${loading ? "opacity-60" : ""}`}>
              {data.items.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-gray-300 bg-bg-clr p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.4fr_0.9fr_0.7fr_0.8fr] lg:items-center lg:gap-4"
                >
                  <div className="min-w-0">
                    <span className="sec-ff mb-0.5 block text-[11px] uppercase tracking-wide text-black-clr lg:hidden">
                      From
                    </span>
                    <p className="pry-ff truncate text-sm font-semibold text-tet-clr">
                      {item.from?.clinicName ?? item.from?.clinicName ?? "Unknown clinic"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <span className="sec-ff mb-0.5 block text-[11px] uppercase tracking-wide text-black-clr lg:hidden">
                      To
                    </span>
                    <p className="pry-ff flex items-center gap-2 truncate text-sm font-semibold text-gray-700">
                      <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-black-clr sm:block lg:hidden" />
                      {item.to?.clinicName ?? "Unknown clinic"}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="sec-ff text-sm text-black-clr">
                    {item.sharedCount} shared
                  </p>
                  <p className="sec-ff text-sm text-black-clr">{formatDate(item.createdAt)}</p>
                </li>
              ))}
            </ul>

            <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}