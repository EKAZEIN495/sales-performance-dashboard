import type { Category } from "./constants";

export type MetricRow = {
  category: Category | "TOTAL";
  label: string;
  target: number;
  mtd: number;
  expect: number;
  achievement: number | null;
  gap: number;
  targetByDay: number | null;
};

export type SalesPerformance = {
  id: number;
  name: string;
  store: string;
  rows: MetricRow[];
  total: MetricRow;
  previousActual: number | null;
  growth: number | null;
};

export type DashboardData = {
  period: { month: number; year: number; elapsedDays: number; totalDays: number; label: string };
  sales: SalesPerformance[];
  categories: MetricRow[];
  grandTotal: MetricRow;
  previousActual: number | null;
  growth: number | null;
  lastUpdated: string;
};
