// app/dashboard/subscriptions/page.tsx

import type { Metadata } from 'next';
import SubscriptionsView from '@/components/billings/subscriptions-view';
import { AddonsView } from "@/components/addons/addons-view";

export const metadata: Metadata = {
  title: 'Subscriptions & Billing',
  description: 'Plans, renewals, trials and Paystack transactions across all clinics.'
};

export default function SubscriptionsPage() {
  return (
    <main>
      <SubscriptionsView />
      <AddonsView />
    </main>
  );
}