// lib/admin-subscriptions.ts
// Admin API calls: subscription management.

import { AxiosError } from 'axios';
import api from '@/lib/api';
import type { Paged, ListParams } from '@/lib/admin-users';

// ---------- Types ----------

export type SubscriptionState = 'subscribed' | 'trial' | 'unsubscribed';
export type BillingCycle = 'monthly' | 'annual';

export interface ClinicSubscriptionRow {
  clinicId: string;
  clinicName: string | null;
  email: string | null;
  phoneNumber: string | null;
  state: SubscriptionState;
  isTrial: boolean;
  plan: string; // 'free' when unsubscribed; 'pro' during a trial
  billingCycle: BillingCycle | null; // null for trial/unsubscribed
  startedAt: string | null;
  expiresAt: string | null;
  daysRemaining: number | null; // null when unsubscribed
  trial: {
    startedAt: string | null;
    endsAt: string | null;
    convertedAt: string | null;
  } | null;
  createdAt: string | null;
}

export type SubscriptionEventType =
  | 'purchase'
  | 'renewal'
  | 'upgrade'
  | 'downgrade'
  | 'expired'
  | 'trial_started'
  | 'trial_expired';

export interface SubscriptionHistoryEntry {
  _id: string;
  clinicId: string;
  type: SubscriptionEventType;
  plan: string;
  billingCycle: BillingCycle | null;
  amount: number | null; // naira; null for trials, expiries and backfilled rows
  reference: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  previousPlan?: string | null;
  previousBillingCycle?: BillingCycle | null;
  backfilled?: boolean;
  createdAt: string;
}

export interface TierSummary {
  plan: string;
  clinics: number;
  mrr: number; // naira, monthly-equivalent
  monthly: number;
  annual: number;
}

export interface SubscriptionSummary {
  totalClinics: number;
  subscribed: number;
  onTrial: number;
  unsubscribed: number;
  expiringIn7Days: number;
  trialsEndingIn7Days: number;
  mrr: number;
  tiers: TierSummary[];
}

export interface AdminTransaction {
  _id: string;
  clinicId: string;
  clinicName: string | null;
  reference: string;
  amount: number | null;
  plan: string;
  billingCycle: BillingCycle | null;
  type: SubscriptionEventType;
  status: 'success';
  createdAt: string;
}

export interface SubscriptionListParams extends ListParams {
  state?: SubscriptionState;
  plan?: string;
  billingCycle?: BillingCycle;
}

// ---------- Helpers ----------

const fail = (label: string, error: unknown): never => {
  const err = error as AxiosError;
  console.error(`${label}:`, err.response?.data || err.message);
  throw error;
};

const clean = <T extends object>(params: T) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );

// ---------- Calls ----------

export const listSubscriptions = async (params: SubscriptionListParams = {}) => {
  try {
    const res = await api.get<Paged & { subscriptions: ClinicSubscriptionRow[] }>(
      '/admin/subscriptions',
      { params: clean(params) }
    );
    return res.data;
  } catch (error) {
    return fail('listSubscriptions', error);
  }
};

export const getSubscriptionSummary = async () => {
  try {
    const res = await api.get<{ status: string; summary: SubscriptionSummary }>(
      '/admin/subscriptions/summary'
    );
    return res.data;
  } catch (error) {
    return fail('getSubscriptionSummary', error);
  }
};

export const listUpcomingExpirations = async (
  params: ListParams & { days?: number; type?: 'trial' | 'paid' } = {}
) => {
  try {
    const res = await api.get<Paged & { days: number; subscriptions: ClinicSubscriptionRow[] }>(
      '/admin/subscriptions/upcoming',
      { params: clean(params) }
    );
    return res.data;
  } catch (error) {
    return fail('listUpcomingExpirations', error);
  }
};

export const getClinicSubscriptionHistory = async (clinicId: string, params: ListParams = {}) => {
  try {
    const res = await api.get<Paged & { clinicName: string | null; history: SubscriptionHistoryEntry[] }>(
      `/admin/subscriptions/${clinicId}/history`,
      { params: clean(params) }
    );
    return res.data;
  } catch (error) {
    return fail('getSubscriptionHistory', error);
  }
};

export const listTransactions = async (params: ListParams = {}) => {
  try {
    const res = await api.get<Paged & { transactions: AdminTransaction[] }>(
      '/admin/subscriptions/transactions',
      { params: clean(params) }
    );
    return res.data;
  } catch (error) {
    return fail('listTransactions', error);
  }
};