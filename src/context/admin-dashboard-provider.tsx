"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type DashboardPeriod = "30d" | "90d" | "1y";

type AdminDashboardContextValue = {
  period: DashboardPeriod;
  setPeriod: (period: DashboardPeriod) => void;
  range: { start: Date; end: Date; label: string };
};

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function formatRangeDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminDashboardProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");

  const range = useMemo(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - (PERIOD_DAYS[period] - 1));
    start.setHours(0, 0, 0, 0);

    return {
      start,
      end,
      label: `${formatRangeDate(start)} – ${formatRangeDate(end)}`,
    };
  }, [period]);

  return (
    <AdminDashboardContext.Provider value={{ period, setPeriod, range }}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboardPeriod() {
  const value = useContext(AdminDashboardContext);
  if (!value) {
    throw new Error("useAdminDashboardPeriod must be used within AdminDashboardProvider");
  }
  return value;
}
