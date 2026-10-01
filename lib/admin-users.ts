// lib/admin-users.ts
// Admin API calls: clinics, clinic staff/patients, pet owners and their pets.

import { AxiosError } from 'axios';
import api from '@/lib/api'; // ASSUMPTION: default export of lib/api.ts (switch to `{ api }` if named)

// ---------- Types ----------

export type Presence = 'online' | 'active' | 'inactive' | 'never';

interface PresenceFields {
  presence: Presence;
  lastActiveAt?: string | null;
  lastLoginAt?: string | null;
}

export interface ClinicAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ClinicService {
  _id: string;
  name: string;
  price?: number;
}

export interface AdminClinic extends PresenceFields {
  _id: string;
  clinicName?: string;
  fullname?: string;
  email: string;
  phoneNumber?: string;
  status?: string;
  address?: ClinicAddress | string | null;
  animalsHandled?: string[];
  servicesProvided?: ClinicService[];
  daysOpen?: string[];
  startingTime?: string;
  closingTime?: string;
  clinicProfile?: {
    licenseNumber?: string | null;
    licenseDocument?: string | null;
    ownerPassport?: string | null;
    ownerIDCard?: string[] | string | null;
  };
  subscription?: {
    plan?: string;
    status?: string;
    expiresAt?: string | null;
    billingCycle?: string;
  };
  createdAt?: string;
}

export interface AdminStaff extends PresenceFields {
  _id: string;
  fullname?: string;
  email: string;
  role: string;
  status?: string;
  createdAt?: string;
}

export interface OwnerContact {
  fullname?: string;
  phoneNumber?: string;
  email?: string;
}

export interface AdminPet {
  _id: string;
  name?: string;
  species?: string;
  breed?: string;
  sex?: string;
  age?: string | number;
  color?: string;
  userId?: string | null;
  unclaimedOwner?: OwnerContact | null;
  createdAt?: string;
}

export interface AdminClinicPatient {
  _id: string;
  petId: string;
  clinicId: string;
  registrationNo?: string;
  createdAt?: string;
  pet?: AdminPet;
  owner?: OwnerContact | null;
}

export interface AdminOwner extends PresenceFields {
  _id: string;
  fullname?: string;
  email: string;
  phoneNumber?: string;
  petCount?: number;
  createdAt?: string;
}

export interface Paged {
  status: string;
  count: number;
  total: number;
  page: number;
  pages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClinicListParams extends ListParams {
  presence?: 'online';
}

// ---------- Helpers ----------

export const getErrorMessage = (error: unknown): string => {
  const err = error as AxiosError<{ message?: string }>;
  return err.response?.data?.message || err.message || 'Something went wrong.';
};

const fail = (label: string, error: unknown): never => {
  const err = error as AxiosError;
  console.error(`${label}:`, err.response?.data || err.message);
  throw error;
};

// Drop empty values so they aren't sent as query params
const clean = <T extends object>(params: T) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );

// ---------- Clinics ----------

export const listClinics = async (params: ClinicListParams = {}) => {
  try {
    const res = await api.get<Paged & { clinics: AdminClinic[] }>('/admin/clinics', {
      params: clean(params)
    });
    return res.data;
  } catch (error) {
    return fail('listClinics', error);
  }
};

export const getClinic = async (id: string) => {
  try {
    const res = await api.get<{ status: string; clinic: AdminClinic }>(`/admin/clinics/${id}`);
    return res.data;
  } catch (error) {
    return fail('getClinic', error);
  }
};

export const listClinicStaff = async (
  clinicId: string,
  params: ListParams & { role?: string; status?: string } = {}
) => {
  try {
    const res = await api.get<Paged & { staff: AdminStaff[] }>(
      `/admin/clinics/${clinicId}/staff`,
      { params: clean(params) }
    );
    return res.data;
  } catch (error) {
    return fail('listClinicStaff', error);
  }
};

export const listClinicPatients = async (clinicId: string, params: ListParams = {}) => {
  try {
    const res = await api.get<Paged & { patients: AdminClinicPatient[] }>(
      `/admin/clinics/${clinicId}/patients`,
      { params: clean(params) }
    );
    return res.data;
  } catch (error) {
    return fail('listClinicPatients', error);
  }
};

// ---------- Pet owners ----------

export const listOwners = async (params: ListParams & { presence?: 'online' } = {}) => {
  try {
    const res = await api.get<Paged & { owners: AdminOwner[] }>('/admin/clinics/owners', {
      params: clean(params)
    });
    return res.data;
  } catch (error) {
    return fail('listOwners', error);
  }
};

export const getOwner = async (id: string) => {
  try {
    const res = await api.get<{ status: string; owner: AdminOwner; pets: AdminPet[] }>(
      `/admin/clinics/owners/${id}`
    );
    return res.data;
  } catch (error) {
    return fail('getOwner', error);
  }
};