// lib/referrals.ts
// Admin API for both referral systems.

import api from "./api";


const ADMIN_API = "/admin";
// ---------- Types ----------

export type GrowthStatus = "signed_up" | "converted" | "rewarded" | "rejected";
export type GrowthEventType = "note" | "converted" | "rewarded" | "rejected";

export interface ClinicRef {
  id: string;
  clinicName: string | null;
  email: string | null;
}

export interface GrowthReferralEvent {
  type: GrowthEventType | "signed_up";
  note: string | null;
  byName: string | null;
  at: string;
}

export interface GrowthReferral {
  id: string;
  code: string;
  status: GrowthStatus;
  createdAt: string;
  convertedAt: string | null;
  rewardedAt: string | null;
  rewardNote: string | null;
  referrer: ClinicRef | null;
  referred: ClinicRef | null;
  events?: GrowthReferralEvent[];
}

export interface PatientReferral {
  id: string;
  status: string;
  createdAt: string | null;
  sharedCount: number;
  from: ClinicRef | null;
  to: ClinicRef | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ReferralOverview {
  growth: {
    total: number;
    signedUp: number;
    converted: number;
    rewarded: number;
    rejected: number;
    conversionRate: number;
  };
  patient: {
    total: number;
    last30Days: number;
    byStatus: Record<string, number>;
  };
}

export interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AddEventInput {
  type: GrowthEventType;
  note?: string;
  rewardNote?: string;
}

interface ListResponse<T> {
  total: number;
  page: number;
  pages: number;
  referrals: T[];
}

function cleanParams(params: ListParams) {
  return {
    search: params.search || undefined,
    status: params.status || undefined,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
}

// ---------- Requests ----------

export async function getReferralOverview(): Promise<ReferralOverview> {
  const { data } = await api.get<ReferralOverview>(`${ADMIN_API}/referrals/overview`);
  return data;
}

export async function listGrowthReferrals(params: ListParams): Promise<Page<GrowthReferral>> {
  const { data } = await api.get<ListResponse<GrowthReferral>>(`${ADMIN_API}/referrals/growth`, {
    params: cleanParams(params),
  });
  return { items: data.referrals, total: data.total, page: data.page, pages: data.pages };
}

export async function getGrowthReferral(id: string): Promise<GrowthReferral> {
  const { data } = await api.get<{ referral: GrowthReferral }>(
    `${ADMIN_API}/referrals/growth/${id}`
  );
  return data.referral;
}

export async function addGrowthReferralEvent(
  id: string,
  input: AddEventInput
): Promise<GrowthReferral> {
  const { data } = await api.post<{ referral: GrowthReferral }>(
    `${ADMIN_API}/referrals/growth/${id}/events`,
    input
  );
  return data.referral;
}

export async function listPatientReferrals(params: ListParams): Promise<Page<PatientReferral>> {
  const { data } = await api.get<ListResponse<PatientReferral>>(`${ADMIN_API}/referrals/patient`, {
    params: cleanParams(params),
  });
  return { items: data.referrals, total: data.total, page: data.page, pages: data.pages };
}