// components/referrals/referrals-view.tsx
"use client";

import { useState } from "react";

import { Can } from "@/components/auth/can";
import { PERMISSIONS } from "@/lib/permissions";
import { getReferralOverview } from "@/lib/referrals";
import { useRequest } from "@/lib/use-request";

import { GrowthReferrals } from "./growth-referrals";
import { PatientReferrals } from "./patient-referrals";
import { labelFor } from "./referral-ui";

type TabId = "growth" | "patient";

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "growth", label: "Clinic growth" },
  { id: "patient", label: "Patient referrals" },
];

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
        <div aria-hidden="true">
          <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-pry-clr/20" />
          <div className="mt-3 h-3 w-24 animate-pulse rounded bg-pry-clr/10" />
        </div>
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
      <p className="pry-ff text-sm font-semibold text-txt-clr">You do not have access to referrals</p>
      <p className="sec-ff mt-1 text-sm text-muted-clr">
        Ask a super admin to grant the list referrals permission.
      </p>
    </div>
  );
}

function ReferralsContent() {
  const [tab, setTab] = useState<TabId>("growth");
  const [statsVersion, setStatsVersion] = useState(0);

  const { data, error, loading } = useRequest(getReferralOverview, `overview:${statsVersion}`);

  const growth = data?.growth;
  const patient = data?.patient;
  const isLoading = loading && !data;

  const topStatuses = Object.entries(patient?.byStatus ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="pry-ff text-3xl font-extrabold tracking-tight text-txt-clr sm:text-4xl">
        Referrals
      </h1>
      <p className="sec-ff mt-1.5 text-sm text-muted-clr sm:text-base">
        Clinics referring clinics to PetArk, and patients referred between clinics.
      </p>

      <div
        role="tablist"
        aria-label="Referral type"
        className="mt-6 inline-flex rounded-full border border-gray-300 bg-bg-clr p-1"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`pry-ff rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id ? "bg-acc-clr text-pry-clr" : "text-sec-clr hover:text-tet-clr"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && !data ? (
        <p role="alert" className="sec-ff mt-4 text-sm text-muted-clr">
          Summary unavailable: {error}
        </p>
      ) : (
        <section aria-label="Summary" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tab === "growth" ? (
            <>
              <Stat label="Clinics referred" value={String(growth?.total ?? 0)} tone="strong" loading={isLoading} />
              <Stat
                label="Awaiting conversion"
                value={String(growth?.signedUp ?? 0)}
                note="Signed up, not yet paying"
                tone="strong"
                loading={isLoading}
              />
              <Stat
                label="Converted"
                value={String((growth?.converted ?? 0) + (growth?.rewarded ?? 0))}
                note={`${growth?.conversionRate ?? 0}% conversion`}
                tone="soft"
                loading={isLoading}
              />
              <Stat label="Rewards granted" value={String(growth?.rewarded ?? 0)} tone="soft" loading={isLoading} />
            </>
          ) : (
            <>
              <Stat label="Total referrals" value={String(patient?.total ?? 0)} tone="strong" loading={isLoading} />
              <Stat
                label="Last 30 days"
                value={String(patient?.last30Days ?? 0)}
                tone="strong"
                loading={isLoading}
              />
              {topStatuses.map(([name, count]) => (
                <Stat key={name} label={labelFor(name)} value={String(count)} tone="soft" loading={isLoading} />
              ))}
            </>
          )}
        </section>
      )}

      <section aria-label="Referral list" className="mt-6">
        {tab === "growth" ? (
          <GrowthReferrals onChanged={() => setStatsVersion((value) => value + 1)} />
        ) : (
          <PatientReferrals statuses={Object.keys(patient?.byStatus ?? {})} />
        )}
      </section>
    </div>
  );
}

export function ReferralsView() {
  return (
    <Can permission={PERMISSIONS.LIST_REFERRALS} fallback={<NoAccess />}>
      <ReferralsContent />
    </Can>
  );
}