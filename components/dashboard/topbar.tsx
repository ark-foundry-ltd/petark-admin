// components/dashboard/topbar.tsx
"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { useAuth } from "@/context/auth-context";

import { BrandMark, NAV_ITEMS, isActive, roleLabel } from "./sidebar";
import { useSidebar } from "@/context/sidebar-context";


export default function DashboardTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openMobile } = useSidebar();

  const title = NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-pry-clr px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openMobile}
          aria-label="Open menu"
          className="rounded-full p-2 text-txt-clr transition-colors hover:bg-pry-clr/10 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="lg:hidden">
          <BrandMark />
        </span>
        <h2 className="pry-ff hidden text-sm font-semibold text-txt-clr lg:block">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="pry-ff rounded-full bg-bg-clr px-4 py-1.5 text-sm font-semibold text-sec-clr">
          {roleLabel(user)}
        </span>
      </div>
    </header>
  );
}