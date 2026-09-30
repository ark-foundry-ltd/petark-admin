// app/dashboard/page.tsx
import type { Metadata } from "next";

import PlatformOverview from "@/components/dashboard/platform-overview";

export const metadata: Metadata = {
  title: "PetArk Command Terminal",
  description: "The administrative workspace for the PetArk clinic network.",
};

export default function DashboardPage() {
  return <PlatformOverview />;
}