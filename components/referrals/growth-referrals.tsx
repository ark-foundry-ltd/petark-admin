// components/referrals/growth-referrals.tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { listGrowthReferrals, type GrowthStatus } from "@/lib/referrals";
import { useDebounced, useRequest } from "@/lib/use-request";

import { ReferralDetail } from "./referral-detail";
import {
  EmptyState,
  ErrorState,
  Pagination,
  RowsSkeleton,
  StatusBadge,
  formatDate,
  inputClass,
} from "./referral-ui";

const STATUS_OPTIONS: ReadonlyArray<{ value: "" | GrowthStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "signed_up", label: "Signed up" },
  { value: "converted", label: "Converted" },
  { value: "rewarded", label: "Rewarded" },
  { value: "rejected", label: "Rejected" },
];

export function GrowthReferrals({ onChanged }: Readonly<{ onChanged: () => void }>) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | GrowthStatus>("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debouncedSearch = useDebounced(search.trim(), 350);
  const key = JSON.stringify({ debouncedSearch, status, page, reloadKey });

  const { data, error, loading } = useRequest(
    () => listGrowthReferrals({ search: debouncedSearch, status, page }),
    key
  );

  const reload = () => setReloadKey((value) => value + 1);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1 border border-gray-300 rounded-xl outline-none">
          <span className="sr-only">Search referrals</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by clinic name or code"
            className={`${inputClass} pl-10 pry-ff`}
          />
        </label>

        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "" | GrowthStatus);
              setPage(1);
            }}
            className={`${inputClass} sm:w-48 pry-ff border border-gray-300 rounded-xl`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <RowsSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No referrals found"
            hint={
              search || status
                ? "Try a different search or status."
                : "Referrals appear here when a new clinic signs up with another clinic's code."
            }
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="pry-ff hidden px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-sec-clr lg:grid lg:grid-cols-[1.4fr_1.4fr_0.9fr_0.9fr_0.8fr] lg:gap-4"
            >
              <span>Referrer</span>
              <span>Referred clinic</span>
              <span>Code</span>
              <span>Status</span>
              <span>Signed up</span>
            </div>

            <ul className={`space-y-2 transition-opacity ${loading ? "opacity-60" : ""}`}>
              {data.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="grid w-full gap-3 rounded-2xl border border-tet-clr bg-bg-clr p-4 text-left transition-colors hover:bg-tint-soft-clr sm:grid-cols-2 lg:grid-cols-[1.4fr_1.4fr_0.9fr_0.9fr_0.8fr] lg:items-center lg:gap-4"
                  >
                    <div className="min-w-0">
                      <span className="sec-ff mb-0.5 block text-[11px] uppercase tracking-wide  lg:hidden">
                        Referrer
                      </span>
                      <p className="pry-ff truncate text-sm font-semibold text-txt-clr">
                        {item.referrer?.clinicName ?? "Unknown clinic"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <span className="sec-ff mb-0.5 block text-[11px] uppercase tracking-wide text-sec-clr lg:hidden">
                        Referred clinic
                      </span>
                      <p className="pry-ff truncate text-sm font-semibold text-black-clr">
                        {item.referred?.clinicName ?? "Unknown clinic"}
                      </p>
                    </div>
                    <p className="pry-ff text-sm tracking-wide text-black-clr">{item.code}</p>
                    <div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="sec-ff text-sm text-sec-clr">{formatDate(item.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>

            <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>

      {selectedId ? (
        <ReferralDetail
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => {
            reload();
            onChanged();
          }}
        />
      ) : null}
    </div>
  );
}