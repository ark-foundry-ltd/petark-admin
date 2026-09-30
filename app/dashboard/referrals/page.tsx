// app/dashboard/referrals/page.tsx
import type { Metadata } from "next";

import { ReferralsView } from "@/components/referrals/referrals-view";

export const metadata: Metadata = {
  title: "Referrals | PetArk Command Terminal",
  description: "Clinic growth referrals and patient referrals across the PetArk network.",
};

export default function ReferralsPage() {
  return <ReferralsView />;
}