// components/dashboard/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Activity,
  Boxes,
  Building2,
  CreditCard,
  Gift,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import type { AdminUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

import { useSidebar } from "@/context/sidebar-context";

// ---------- Config ----------

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile bottom bar */
  mobileLabel?: string;
  icon: LucideIcon;
  /** Shown only if the admin has this permission (any of, when an array) */
  permission: string | string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, permission: PERMISSIONS.VIEW_DASHBOARD },
  { href: "/dashboard/clinics", label: "Clinics", icon: Building2, permission: PERMISSIONS.LIST_CLINICS },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: Users,
    permission: [PERMISSIONS.LIST_PET_OWNERS, PERMISSIONS.LIST_STAFF],
  },
  {
    href: "/dashboard/subscriptions",
    label: "Subscriptions & Billing",
    mobileLabel: "Subscriptions",
    icon: CreditCard,
    permission: PERMISSIONS.VIEW_SUBSCRIPTIONS,
  },
  { href: "/dashboard/inventory", label: "Inventory Health", icon: Boxes, permission: PERMISSIONS.VIEW_STATISTICS },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift, permission: PERMISSIONS.LIST_REFERRALS },
  {
    href: "/dashboard/support",
    label: "Support & Activity",
    icon: Activity,
    permission: PERMISSIONS.LIST_SUPPORT_REQUESTS,
  },
];

/**
 * Mobile bottom bar: with more links than this, it shows this many plus "More",
 * and "More" opens the full drawer. The design screenshot shows 4; change it here.
 */
export const MOBILE_VISIBLE_LINKS = 3;

// ---------- Helpers ----------

export function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function roleLabel(user: AdminUser | null): string {
  if (!user) return "Admin";
  return user.isSuperAdmin ? "Super Admin" : user.department || "Admin";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function useVisibleNav(): NavItem[] {
  const { can } = useAuth();
  return NAV_ITEMS.filter((item) => can(item.permission));
}

// ---------- Small pieces ----------

export function BrandMark() {
  return (
    <Image
        src="/petark_logo.png"
        alt="Petark Logo"
        width={32}
        height={32}
     />
  );
}

function NavLink({
  item,
  active,
  collapsed = false,
  onNavigate,
}: Readonly<{
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}>) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`pry-ff flex items-center gap-3 rounded-full py-3 text-sm font-medium transition-colors ${
        collapsed ? "justify-center px-0" : "px-4"
      } ${active ? "bg-acc-clr text-pry-clr" : "text-sec-clr hover:bg-pry-clr/10"}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function UserCard({ collapsed = false }: Readonly<{ collapsed?: boolean }>) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div
      className={`flex items-center gap-3 p-4 ${collapsed ? "flex-col" : ""}`}
    >
      <span
        title={collapsed ? user.fullname : undefined}
        className="pry-ff flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acc-clr text-xs font-bold text-pry-clr"
      >
        {initials(user.fullname)}
      </span>

      {collapsed ? null : (
        <div className="min-w-0 flex-1">
          <p className="pry-ff truncate text-sm font-semibold text-txt-clr">{user.fullname}</p>
          <p className="sec-ff truncate text-xs text-muted-clr">{roleLabel(user)}</p>
        </div>
      )}

      <div className={`flex items-center ${collapsed ? "flex-col gap-1" : "gap-0.5"}`}>
        {collapsed ? null : (
          <Link
            href="/dashboard/settings"
            aria-label="Settings"
            className="rounded-full p-2 text-muted-clr transition-colors hover:bg-pry-clr/10 hover:text-txt-clr"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-full p-2 text-muted-clr transition-colors hover:bg-pry-clr/10 hover:text-txt-clr"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------- Desktop ----------

function DesktopSidebar() {
  const pathname = usePathname();
  const items = useVisibleNav();
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      aria-label="Sidebar"
      className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-bg-clr shadow transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex items-center px-4 py-5 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        <BrandMark />
        {collapsed ? null : <span className="pry-ff text-sm font-bold text-txt-clr">PetArk</span>}
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`pry-ff flex w-full items-center gap-3 rounded-full py-2.5 text-sm text-muted-clr transition-colors hover:bg-pry-clr/10 hover:text-txt-clr ${
            collapsed ? "justify-center" : "px-4"
          }`}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {collapsed ? null : "Collapse"}
        </button>
      </div>

      <UserCard collapsed={collapsed} />
    </aside>
  );
}

// ---------- Mobile ----------

function MobileBottomNav() {
  const pathname = usePathname();
  const items = useVisibleNav();
  const { openMobile } = useSidebar();

  const hasOverflow = items.length > MOBILE_VISIBLE_LINKS;
  const shown = hasOverflow ? items.slice(0, MOBILE_VISIBLE_LINKS) : items;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t shadow-md border-bg-clr bg-bg-clr pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {shown.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`pry-ff flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              active ? "text-acc-clr" : "text-sec-clr hover:text-sec-clr"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.mobileLabel ?? item.label}
          </Link>
        );
      })}

      {hasOverflow ? (
        <button
          type="button"
          onClick={openMobile}
          aria-haspopup="dialog"
          className="pry-ff flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-acc-clr transition-colors hover:text-txt-clr"
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      ) : null}
    </nav>
  );
}

function MobileDrawer() {
  const pathname = usePathname();
  const items = useVisibleNav();
  const { user } = useAuth();
  const { mobileOpen, closeMobile } = useSidebar();
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) closeButton.current?.focus();
  }, [mobileOpen]);

  return (
    <div className="lg:hidden" inert={!mobileOpen}>
      <div
        role="presentation"
        onClick={closeMobile}
        className={`fixed inset-0 z-40 bg-bg-clr transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col shadow-md  transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-5">
          <BrandMark />
          <div className="min-w-0 flex-1">
            <p className="pry-ff text-sm font-bold text-txt-clr">PetArk</p>
            <p className="sec-ff text-xs text-muted-clr">{roleLabel(user)}</p>
          </div>
          <button
            ref={closeButton}
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="rounded-full p-2 text-txt-clr transition-colors hover:bg-pry-clr/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={closeMobile}
            />
          ))}
        </nav>

        <UserCard />
      </aside>
    </div>
  );
}

/** Render once in the dashboard layout: desktop sidebar, mobile bottom bar, and mobile drawer */
export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
      <MobileDrawer />
    </>
  );
}