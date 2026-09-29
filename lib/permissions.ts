// lib/permissions.ts
// Mirrors the permission strings in the backend (db/models/admin_permissions.js).
// Add more here as screens need them.

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  LIST_CLINICS: "list_clinics",
  VIEW_CLINIC_DETAILS: "view_clinic_details",
  APPROVE_CLINIC_ACCOUNTS: "approve_clinic_accounts",
  LIST_ADMINS: "list_admins",
  CREATE_ADMIN: "create_admin",
  UPDATE_ADMIN: "update_admin",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];