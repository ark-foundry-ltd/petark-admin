// components/referrals/referral-detail.tsx
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import {
  addGrowthReferralEvent,
  getGrowthReferral,
  type GrowthEventType,
  type GrowthStatus,
} from "@/lib/referrals";
import { useRequest } from "@/lib/use-request";

import { ErrorState, StatusBadge, formatDate, inputClass } from "./referral-ui";

// Mirrors EVENT_RULES in the backend (db/models/growth_referral.js)
const NEXT_EVENTS: Record<GrowthStatus, GrowthEventType[]> = {
  signed_up: ["note", "converted", "rejected"],
  converted: ["note", "rewarded", "rejected"],
  rewarded: ["note"],
  rejected: ["note"],
};

const EVENT_ACTIONS: Record<GrowthEventType, string> = {
  note: "Add a note",
  converted: "Mark as converted",
  rewarded: "Record reward granted",
  rejected: "Reject referral",
};

const EVENT_LABELS: Record<string, string> = {
  signed_up: "Clinic signed up",
  note: "Note",
  converted: "Converted",
  rewarded: "Reward granted",
  rejected: "Rejected",
};

export function ReferralDetail({
  id,
  onClose,
  onChanged,
}: Readonly<{ id: string; onClose: () => void; onChanged: () => void }>) {
  const { can } = useAuth();
  const closeButton = useRef<HTMLButtonElement>(null);

  const [version, setVersion] = useState(0);
  const { data: referral, error } = useRequest(() => getGrowthReferral(id), `${id}:${version}`);

  const [type, setType] = useState<GrowthEventType>("note");
  const [note, setNote] = useState("");
  const [rewardNote, setRewardNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Escape closes; page behind does not scroll while the panel is open
  useEffect(() => {
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const allowed = referral ? NEXT_EVENTS[referral.status] : [];
  const activeType = allowed.includes(type) ? type : (allowed[0] ?? "note");
  const noteRequired = activeType === "note" || activeType === "rejected";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !referral) return;

    if (noteRequired && !note.trim()) {
      setFormError(activeType === "rejected" ? "Give a reason for rejecting." : "Write a note first.");
      return;
    }
    if (activeType === "rewarded" && !rewardNote.trim()) {
      setFormError("Describe the reward that was granted.");
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await addGrowthReferralEvent(referral.id, {
        type: activeType,
        note: note.trim() || undefined,
        rewardNote: activeType === "rewarded" ? rewardNote.trim() : undefined,
      });
      toast.success("Referral updated");
      setNote("");
      setRewardNote("");
      setType("note");
      setVersion((value) => value + 1);
      onChanged();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div role="presentation" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Referral details"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg-clr shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line-clr px-5 py-4">
          <h2 className="pry-ff text-base font-bold text-txt-clr">Referral details</h2>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-txt-clr transition-colors hover:bg-pry-clr/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {error && !referral ? <ErrorState message={error} /> : null}
          {!referral && !error ? (
            <div aria-hidden="true" className="h-40 animate-pulse rounded-2xl bg-pry-clr/10" />
          ) : null}

          {referral ? (
            <>
              <section className="space-y-3 rounded-2xl border border-line-clr bg-tint-soft-clr p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="pry-ff text-sm font-semibold tracking-wide text-txt-clr">
                    {referral.code}
                  </p>
                  <StatusBadge status={referral.status} />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="sec-ff text-xs text-muted-clr">Referrer</dt>
                    <dd className="pry-ff font-semibold text-txt-clr">
                      {referral.referrer?.clinicName ?? "Unknown clinic"}
                    </dd>
                    <dd className="sec-ff truncate text-xs text-muted-clr">
                      {referral.referrer?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="sec-ff text-xs text-muted-clr">Referred clinic</dt>
                    <dd className="pry-ff font-semibold text-txt-clr">
                      {referral.referred?.clinicName ?? "Unknown clinic"}
                    </dd>
                    <dd className="sec-ff truncate text-xs text-muted-clr">
                      {referral.referred?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="sec-ff text-xs text-muted-clr">Signed up</dt>
                    <dd className="pry-ff font-semibold text-txt-clr">
                      {formatDate(referral.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="sec-ff text-xs text-muted-clr">Converted</dt>
                    <dd className="pry-ff font-semibold text-txt-clr">
                      {formatDate(referral.convertedAt)}
                    </dd>
                  </div>
                </dl>

                {referral.rewardNote ? (
                  <p className="sec-ff rounded-xl bg-tint-clr px-3 py-2 text-sm text-txt-clr">
                    Reward: {referral.rewardNote}
                  </p>
                ) : null}
              </section>

              <section aria-labelledby="timeline-title">
                <h3 id="timeline-title" className="pry-ff text-sm font-bold text-txt-clr">
                  Timeline
                </h3>
                <ol className="mt-3 space-y-4 border-l border-line-clr pl-4">
                  {(referral.events ?? []).map((item, index) => (
                    <li key={`${item.at}-${index}`} className="relative">
                      <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-pry-clr" />
                      <p className="pry-ff text-sm font-semibold text-txt-clr">
                        {EVENT_LABELS[item.type] ?? item.type}
                      </p>
                      {item.note ? (
                        <p className="sec-ff mt-0.5 text-sm text-txt-clr">{item.note}</p>
                      ) : null}
                      <p className="sec-ff mt-0.5 text-xs text-muted-clr">
                        {formatDate(item.at)}
                        {item.byName ? ` by ${item.byName}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              {can(PERMISSIONS.ADD_REFERRAL_EVENT) ? (
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <h3 className="pry-ff text-sm font-bold text-txt-clr">Log an event</h3>

                  <select
                    aria-label="Event type"
                    value={activeType}
                    onChange={(event) => setType(event.target.value as GrowthEventType)}
                    className={inputClass}
                  >
                    {allowed.map((option) => (
                      <option key={option} value={option}>
                        {EVENT_ACTIONS[option]}
                      </option>
                    ))}
                  </select>

                  {activeType === "rewarded" ? (
                    <input
                      type="text"
                      value={rewardNote}
                      onChange={(event) => setRewardNote(event.target.value)}
                      placeholder="What was granted? e.g. 1 free month"
                      maxLength={300}
                      className={inputClass}
                    />
                  ) : null}

                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder={
                      activeType === "rejected"
                        ? "Reason (required)"
                        : noteRequired
                          ? "Note (required)"
                          : "Note (optional)"
                    }
                    className={inputClass}
                  />

                  {formError ? (
                    <p role="alert" className="sec-ff text-sm text-muted-clr">
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="pry-ff h-11 w-full rounded-xl bg-pry-clr text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? "Saving..." : "Save event"}
                  </button>
                </form>
              ) : null}
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}