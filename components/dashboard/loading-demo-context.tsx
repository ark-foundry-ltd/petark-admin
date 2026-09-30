// components/dashboard/loading-demo-context.tsx
"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface LoadingDemoValue {
  /** When on, dashboard sections show their loading skeletons */
  loadingDemo: boolean;
  setLoadingDemo: (value: boolean) => void;
}

const LoadingDemoContext = createContext<LoadingDemoValue | null>(null);

export default function LoadingDemoProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const value = useMemo(() => ({ loadingDemo, setLoadingDemo }), [loadingDemo]);

  return <LoadingDemoContext.Provider value={value}>{children}</LoadingDemoContext.Provider>;
}

export function useLoadingDemo(): LoadingDemoValue {
  const context = useContext(LoadingDemoContext);
  if (!context) {
    throw new Error("useLoadingDemo must be used inside <LoadingDemoProvider>");
  }
  return context;
}