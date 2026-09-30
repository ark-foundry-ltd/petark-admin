// components/dashboard/platform-overview.tsx
"use client";

import { ShieldCheck } from "lucide-react";

// Sample figures taken from the design. Replace with data from the API once the
// platform stats endpoint exists (keep the same shape and nothing else changes).
const overview = {
  totalClinics: { value: 218, note: "+14 this month" },
  monthlyRevenue: { value: 7689000, note: "Paystack, net of discounts" },
  trialConversion: { rate: 63, converted: 42, trials: 67, windowDays: 90 },
  petOwners: { value: 6140, note: "+560 this month" },
  tiers: [
    { label: "Free", count: 5 },
    { label: "Starter", count: 30 },
    { label: "Standard", count: 74 },
    { label: "Pro", count: 65 },
  ],
};

const numberFormat = new Intl.NumberFormat("en-NG");
const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function StatCard({
  label,
  value,
  note,
}: Readonly<{
  label: string;
  value: string;
  note: string;
}>) {
  return (
    <div
      className="rounded-2xl border border-gray-300 p-5 bg-bg-clr">
      <p className="pry-ff text-xs font-semibold uppercase tracking-wide text-txt-clr">{label}</p>
      <p className="pry-ff mt-2 text-2xl font-extrabold text-black-clr">{value}</p>
      <p className="pry-ff mt-1 text-sm text-gray-600">{note}</p>
    </div>
  );
}

export default function PlatformOverview() {
  const { trialConversion } = overview;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="pry-ff text-3xl font-extrabold tracking-tight text-txt-clr sm:text-4xl">
        Platform Overview
      </h1>
      <p className="pry-ff mt-1.5 text-sm text-gray-600">
        Aggregated health of every PetArk clinic, subscription and pet owner account.
      </p>

      <div
        role="note"
        className="mt-6 flex items-start gap-3 rounded-2xl border border-acc-clr bg-bg-clr px-5 py-4 "
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-acc-clr" />
        <p className="pry-ff text-sm text-gray-600">
          Platform and billing metrics are fully visible here. Patient records, appointments and
          clinical notes are never exposed to admin tooling.
        </p>
      </div>

      <section aria-label="Key metrics" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total clinics"
          value={numberFormat.format(overview.totalClinics.value)}
          note={overview.totalClinics.note}
        />
        <StatCard
          label="Monthly recurring revenue"
          value={currencyFormat.format(overview.monthlyRevenue.value)}
          note={overview.monthlyRevenue.note}
        />
        <StatCard
          label="Trial conversions"
          value={`${trialConversion.rate}%`}
          note={`${trialConversion.converted} of ${trialConversion.trials} trials in ${trialConversion.windowDays} days`}
        />
        <StatCard
          label="Pet owners"
          value={numberFormat.format(overview.petOwners.value)}
          note={overview.petOwners.note}
        />
      </section>

      <section
        aria-labelledby="tiers-title"
        className="mt-6 rounded-2xl border border-gray-300 bg-pry-clr p-5 sm:p-6"
      >
        <h2 id="tiers-title" className="pry-ff text-base font-bold text-txt-clr">
          Active subscriptions by tier
        </h2>
        <p className="pry-ff mt-0.5 text-sm text-gray-600">
          Counted from currently billable clinic accounts.
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {overview.tiers.map((tier) => (
            <li
              key={tier.label}
              className="rounded-2xl border border-gray-300 bg-bg-clr p-4"
            >
              <p className="pry-ff text-xs font-semibold uppercase tracking-wide text-txt-clr">
                {tier.label}
              </p>
              <p className="pry-ff mt-2 text-3xl font-extrabold text-black-clr">
                {numberFormat.format(tier.count)}
              </p>
                <p className="pry-ff mt-1 text-sm text-gray-600">clinics</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}