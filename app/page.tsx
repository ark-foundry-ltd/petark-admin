// app/page.tsx
import type { Metadata } from "next";
import { Activity, Building2, KeyRound, ShieldCheck } from "lucide-react";

import { AuthHeader } from "@/components/auth/auth-shell";
import { AccessButton } from "@/components/access-btn";

export const metadata: Metadata = {
  title: "PetArk Command Center",
  description:
    "The administrative workspace for the PetArk clinic network.",
};

const features = [
  {
    icon: Building2,
    title: "Clinic governance",
    description:
      "Review new clinic registrations, approve or reject them, and keep the network in good standing.",
  },
  {
    icon: KeyRound,
    title: "Access control",
    description:
      "Invite administrators and give each one only the permissions their role needs.",
  },
  {
    icon: Activity,
    title: "Clinic activity",
    description:
      "See when clinics last signed in and which ones are online right now.",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-bg-clr">
      {/* soft background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-112 w-md -translate-x-1/2 rounded-full bg-green-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-24 h-104 w-104 rounded-full bg-emerald-200/60 blur-3xl"
      />

      <header className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6">
        <AuthHeader subtitle="Command" badge="ADMIN CONSOLE" />
      </header>

      <section
        aria-labelledby="home-title"
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-acc-clr backdrop-blur pry-ff">
          <ShieldCheck className="h-3.5 w-3.5" />
          Authorized personnel only
        </span>

        <h1
          id="home-title"
          className="mt-6 text-4xl font-extrabold tracking-tight text-sec-clr sec-ff sm:text-6xl"
        >
          Welcome to the PetArk <span className="text-acc-clr">Command Center</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-sec-clr sm:text-lg pry-ff">
          The administrative workspace for the PetArk clinic network. Manage clinics,
          administrators, and access from one place.
        </p>

        <div className="mt-10">
          <AccessButton />
        </div>

        <p className="mt-6 text-xs text-sec-clr sec-ff">
          Access is by invitation. Contact your PetArk administrator if you need an account.
        </p>
      </section>

      <section
        aria-label="What you can do here"
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12"
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-2xl border border-pry-clr bg-pry-clr/80 p-6 shadow-sm backdrop-blur"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-acc-clr">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-sm font-semibold text-black-clr sec-ff">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-sec-clr pry-ff">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="relative z-10 pb-6 text-center text-xs text-sec-clr sec-ff">
        PetArk Command Center &middot; Admin console
      </footer>
    </main>
  );
}