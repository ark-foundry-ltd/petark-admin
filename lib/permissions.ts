// lib/permissions.ts
// Mirrors the permission strings in the backend (db/models/admin_permissions.js).
// Add more here as screens need them.

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_STATISTICS: "view_statistics",
  LIST_CLINICS: "list_clinics",
  VIEW_CLINIC_DETAILS: "view_clinic_details",
  APPROVE_CLINIC_ACCOUNTS: "approve_clinic_accounts",
  LIST_STAFF: "list_staff",
  LIST_PET_OWNERS: "list_pet_owners",
  VIEW_SUBSCRIPTIONS: "view_subscriptions",
  LIST_REFERRALS: "list_referrals",
  VIEW_REFERRAL_DETAILS: "view_referral_details",
  ADD_REFERRAL_EVENT: "add_referral_event",
  MANAGE_ADDONS: "manage_addons",
  LIST_SUPPORT_REQUESTS: "list_support_requests",
  LIST_ADMINS: "list_admins",
  CREATE_ADMIN: "create_admin",
  UPDATE_ADMIN: "update_admin",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];