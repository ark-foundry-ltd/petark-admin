// lib/admin-addons.ts
import api from "@/lib/api";

export type AddonResource = "treatments" | "remindersPerMonth" | "inventorySkus";
export type AddonSource = "purchase" | "admin_grant";

export interface ResourceTotals {
    purchases: number;
    units: number;
    revenue: number;
}

export interface AddonOverview {
    month: string;
    thisMonth: ResourceTotals & { byResource: Record<AddonResource, ResourceTotals> };
    allTime: { purchases: number; revenue: number };
    granted: { count: number; units: number };
}

export interface AddonPurchaseRow {
    id: string;
    resource: AddonResource;
    units: number;
    packs: number;
    price: number;
    month: string;
    source: AddonSource;
    paymentReference: string | null;
    purchasedAt: string;
    note: string | null;
    grantedByName: string | null;
    clinic: { id: string; clinicName: string | null; email: string | null } | null;
}

export interface AddonListResponse {
    total: number;
    page: number;
    pages: number;
    purchases: AddonPurchaseRow[];
}

export interface AddonListParams {
    page?: number;
    search?: string;
    resource?: AddonResource | "";
    source?: AddonSource | "";
}

export async function getAddonOverview(): Promise<AddonOverview> {
    const { data } = await api.get("/admin/addons/overview");
    return data;
}

export async function listAddonPurchases(params: AddonListParams): Promise<AddonListResponse> {
    const { data } = await api.get("/admin/addons", {
        params: {
            page: params.page || 1,
            limit: 20,
            search: params.search || undefined,
            resource: params.resource || undefined,
            source: params.source || undefined,
        },
    });
    return data;
}

export interface GrantAddonPayload {
    clinicEmail: string;
    resource: AddonResource;
    packs: number;
    note: string;
}

export async function grantAddon(payload: GrantAddonPayload): Promise<AddonPurchaseRow> {
    const { data } = await api.post("/admin/addons/grant", payload);
    return data.purchase;
}