// components/growth-referral-card.tsx
// Drop into the clinic dashboard (owner only), e.g. on the dashboard home or settings.
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Check, Copy, Gift } from "lucide-react";
import { toast } from "sonner";

import {
  getMyReferralCode,
  getMyReferrals,
  type MyReferralStatus,
  type MyReferrals,
  type ReferralCode,
} from "@/lib/growth-referral";

const STATUS_LABELS: Record<MyReferralStatus, string> = {
  signed_up: "Signed up",
  converted: "Subscribed",
  rewarded: "Reward granted",
  rejected: "Not eligible",
};

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return "Could not load your referrals. Please try again.";
}

function CopyRow({ label, value }: Readonly<{ label: string; value: string }>) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-pry-clr/15 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="sec-ff text-[11px] uppercase tracking-wide text-sec-clr">{label}</p>
        <p className="pry-ff truncate text-sm font-semibold text-pry-clr">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="rounded-lg bg-pry-clr p-2 text-pry-clr transition-opacity hover:opacity-90"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function GrowthReferralCard() {
  const [reload, setReload] = useState(0);
  const [state, setState] = useState<{
    key: number;
    code: ReferralCode | null;
    mine: MyReferrals | null;
    error: string | null;
  }>({ key: -1, code: null, mine: null, error: null });

  useEffect(() => {
    let active = true;

    Promise.all([getMyReferralCode(), getMyReferrals()])
      .then(([code, mine]) => {
        if (active) setState({ key: reload, code, mine, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState({ key: reload, code: null, mine: null, error: errorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, [reload]);

  const loading = state.key !== reload;

  return (
    <section
      aria-labelledby="refer-title"
      className="rounded-2xl border border-pry-clr/15 bg-bg-clr p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pry-clr/10 text-pry-clr">
          <Gift className="h-5 w-5" />
        </span>
        <div>
          <h2 id="refer-title" className="pry-ff text-base font-bold text-pry-clr">
            Refer a clinic
          </h2>
          <p className="sec-ff mt-0.5 text-sm text-sec-clr">
            Share your code with another veterinary clinic. You can follow their progress here.
          </p>
        </div>
      </div>

      {loading ? (
        <div aria-hidden="true" className="mt-5 space-y-3">
          <div className="h-14 animate-pulse rounded-xl bg-pry-clr/10" />
          <div className="h-14 animate-pulse rounded-xl bg-pry-clr/10" />
        </div>
      ) : state.error || !state.code || !state.mine ? (
        <div role="alert" className="mt-5">
          <p className="sec-ff text-sm text-sec-clr">{state.error}</p>
          <button
            type="button"
            onClick={() => setReload((value) => value + 1)}
            className="pry-ff mt-3 rounded-full bg-pry-clr px-5 py-2 text-sm font-semibold text-pry-clr"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <CopyRow label="Your code" value={state.code.code} />
            <CopyRow label="Signup link" value={state.code.link} />
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              ["Referred", state.mine.stats.total],
              ["Subscribed", state.mine.stats.converted],
              ["Rewards", state.mine.stats.rewarded],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-pry-clr/5 px-2 py-3">
                <dd className="pry-ff text-2xl font-extrabold text-pry-clr">{value}</dd>
                <dt className="sec-ff text-xs text-sec-clr">{label}</dt>
              </div>
            ))}
          </dl>

          {state.mine.referrals.length > 0 ? (
            <ul className="mt-5 divide-y divide-pry-clr/10">
              {state.mine.referrals.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="pry-ff truncate text-sm font-semibold text-pry-clr">
                      {item.clinicName ?? "New clinic"}
                    </p>
                    {item.rewardNote ? (
                      <p className="sec-ff text-xs text-sec-clr">Reward: {item.rewardNote}</p>
                    ) : null}
                  </div>
                  <span className="pry-ff shrink-0 rounded-full bg-pry-clr/10 px-2.5 py-1 text-xs font-semibold text-pry-clr">
                    {STATUS_LABELS[item.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sec-ff mt-5 text-sm text-sec-clr">
              No clinics have signed up with your code yet.
            </p>
          )}
        </>
      )}
    </section>
  );
}