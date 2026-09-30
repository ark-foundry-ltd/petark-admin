// lib/growth-referral.ts
// Clinic dashboard: share your referral code and see who signed up with it.

import axios from "axios";

import api from "@/lib/api";

export type MyReferralStatus = "signed_up" | "converted" | "rewarded" | "rejected";

export interface ReferralCode {
  code: string;
  /** Signup link with ?ref=CODE already attached */
  link: string;
}

export interface MyReferral {
  id: string;
  clinicName: string | null;
  status: MyReferralStatus;
  createdAt: string;
  /** Only set once an admin has recorded the reward */
  rewardNote: string | null;
}

export interface MyReferrals {
  stats: { total: number; converted: number; rewarded: number };
  referrals: MyReferral[];
}

// Paths are relative to your axios baseURL; the backend mounts these at /api/growth-referrals
export async function getMyReferralCode(): Promise<ReferralCode> {
  try {
    const { data } = await api.get<ReferralCode & { status: string }>("/growth-referrals/code");
    return { code: data.code, link: data.link };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("getMyReferralCode failed:", error.response?.data ?? error.message);
    }
    throw error;
  }
}

export async function getMyReferrals(): Promise<MyReferrals> {
  try {
    const { data } = await api.get<MyReferrals & { status: string }>("/growth-referrals/mine");
    return { stats: data.stats, referrals: data.referrals };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("getMyReferrals failed:", error.response?.data ?? error.message);
    }
    throw error;
  }
}