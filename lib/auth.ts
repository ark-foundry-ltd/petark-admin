// lib/auth.ts
// Everything the admin frontend needs to talk to the auth endpoints.
// No React in here: components use it through context/AuthContext.

import { isAxiosError } from "axios";
import api, { ADMIN_TOKEN_KEY } from "./api";

// Where adminRoutes is mounted, relative to the axios baseURL
// (NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1), so this hits /api/v1/admin/...
// Change this one line if the backend mounts the admin router somewhere else.
const ADMIN_API = "/admin";

export const ROUTES = {
  login: "/login",
  register: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  changePassword: "/change-password",
  home: "/dashboard",
} as const;

// ---------- Types ----------

export interface AdminUser {
  id: string;
  role: string;
  fullname: string;
  email: string;
  department: string;
  isSuperAdmin: boolean;
  permissions: string[];
  mustChangePassword: boolean;
}

export interface CreateAdminInput {
  fullname: string;
  email: string;
  department: string;
  phoneNumber?: string;
  permissions: string[];
}

export interface ResetTokenInfo {
  fullname: string;
  email: string;
}

interface LoginResponse {
  status: string;
  user: AdminUser;
  token: string;
}

interface MeResponse {
  status: string;
  user: AdminUser;
}

interface MessageResponse {
  status: string;
  message: string;
}

interface ChangePasswordResponse extends MessageResponse {
  token: string;
}

interface ResetPasswordResponse extends MessageResponse {
  user: AdminUser;
  token: string;
}

interface VerifyTokenResponse extends ResetTokenInfo {
  status: string;
}

interface CreateAdminResponse extends MessageResponse {
  admin: AdminUser;
}

// ---------- Token storage ----------

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

// ---------- Helpers ----------

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (!error.response) return "Cannot reach the server. Check your connection.";
  }
  return fallback;
}

export function postLoginPath(user: AdminUser): string {
  return user.mustChangePassword ? ROUTES.changePassword : ROUTES.home;
}

// ad***@petark.internal
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}

// Super admins can do everything. Pass an array to mean "any of these".
export function hasPermission(
  user: AdminUser | null,
  permission: string | string[]
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;

  const required = Array.isArray(permission) ? permission : [permission];
  return required.some((p) => user.permissions.includes(p));
}

// ---------- Requests ----------

export async function login(email: string, password: string): Promise<AdminUser> {
  const { data } = await api.post<LoginResponse>(`${ADMIN_API}/login`, {
    email,
    password,
  });
  tokenStore.set(data.token);
  return data.user;
}

export function logout(): void {
  tokenStore.clear();
}

export async function getMe(): Promise<AdminUser> {
  const { data } = await api.get<MeResponse>(`${ADMIN_API}/me`);
  return data.user;
}

export async function forgotPassword(email: string): Promise<string> {
  const { data } = await api.post<MessageResponse>(`${ADMIN_API}/forgot-password`, {
    email,
  });
  return data.message;
}

// Checks an emailed link (invite or reset) before showing the form.
// Rejects if the link is invalid or expired.
export async function verifyResetToken(token: string): Promise<ResetTokenInfo> {
  const { data } = await api.post<VerifyTokenResponse>(
    `${ADMIN_API}/reset-token/verify`,
    { token }
  );
  return { fullname: data.fullname, email: data.email };
}

// Used by both the forgot-password link and the new-admin invite link.
// The backend signs the admin in, so the token is stored here. Call
// useAuth().refresh() afterwards to load the user into context.
export async function resetPassword(token: string, newPassword: string): Promise<AdminUser> {
  const { data } = await api.post<ResetPasswordResponse>(`${ADMIN_API}/reset-password`, {
    token,
    newPassword,
  });
  tokenStore.set(data.token);
  return data.user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<string> {
  const { data } = await api.patch<ChangePasswordResponse>(
    `${ADMIN_API}/change-password`,
    { currentPassword, newPassword }
  );
  // The backend invalidates old sessions on a password change and returns a fresh token
  tokenStore.set(data.token);
  return data.message;
}

// An admin with create_admin invites a new admin by email
export async function createAdmin(input: CreateAdminInput): Promise<CreateAdminResponse> {
  const { data } = await api.post<CreateAdminResponse>(`${ADMIN_API}/register`, input);
  return data;
}