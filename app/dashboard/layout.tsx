// app/dashboard/layout.tsx
import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/require-auth";
import LoadingDemoProvider from "@/components/dashboard/loading-demo-context";
import Sidebar from "@/components/dashboard/sidebar";
import SidebarProvider from "@/context/sidebar-context";
import DashboardTopbar  from "@/components/dashboard/topbar";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RequireAuth fallback={<div className="min-h-screen bg-bg-clr" aria-busy="true" />}>
      <SidebarProvider>
        <LoadingDemoProvider>
          <div className="flex min-h-screen bg-pry-clr">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
              <DashboardTopbar />
              {/* bottom padding on mobile keeps content clear of the fixed bottom bar */}
              <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
            </div>
          </div>
        </LoadingDemoProvider>
      </SidebarProvider>
    </RequireAuth>
  );
}