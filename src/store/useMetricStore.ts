import { create } from 'zustand';
import type { BodyMetric, MetricKey } from '../types';
import { metrics as mockMetrics } from '../data/metrics';

export interface MetricSummary {
  latest: BodyMetric | null;
  previous: BodyMetric | null;
  change: number | null;
  trend: 'up' | 'down' | 'stable' | null;
}

interface MetricState {
  metrics: BodyMetric[];
  loading: boolean;
  loadMetrics: () => Promise<void>;
  getMetricById: (id: string) => BodyMetric | undefined;
  getMetricsByMember: (memberId: string) => BodyMetric[];
  getLatestMetric: (memberId: string) => BodyMetric | null;
  getMetricSummary: (memberId: string, type: MetricKey) => MetricSummary;
  getMetricChartData: (memberId: string, type: MetricKey) => Array<{ label: string; value: number }>;
  addMetric: (metric: Omit<BodyMetric, 'id'>) => BodyMetric;
  updateMetric: (id: string, data: Partial<BodyMetric>) => BodyMetric | undefined;
  deleteMetric: (id: string) => boolean;
}

export const useMetricStore = create<MetricState>((set, get) => ({
  metrics: [],
  loading: false,

  loadMetrics: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 100));
    set({ metrics: [...mockMetrics], loading: false });
  },

  getMetricById: (id: string) => {
    return get().metrics.find((m) => m.id === id);
  },

  getMetricsByMember: (memberId: string) => {
    return get()
      .metrics.filter((m) => m.memberId === memberId)
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
  },

  getLatestMetric: (memberId: string) => {
    const memberMetrics = get().getMetricsByMember(memberId);
    return memberMetrics.length > 0 ? memberMetrics[memberMetrics.length - 1] : null;
  },

  getMetricSummary: (memberId: string, type: MetricKey) => {
    const memberMetrics = get().getMetricsByMember(memberId);
    if (memberMetrics.length === 0) {
      return { latest: null, previous: null, change: null, trend: null };
    }

    const latest = memberMetrics[memberMetrics.length - 1];
    const previous = memberMetrics.length >= 2 ? memberMetrics[memberMetrics.length - 2] : null;

    if (!previous) {
      return { latest, previous: null, change: null, trend: null };
    }

    const change = latest[type] - previous[type];
    const threshold = 0.1;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > threshold) trend = 'up';
    else if (change < -threshold) trend = 'down';

    return {
      latest,
      previous,
      change: Math.round(change * 100) / 100,
      trend
    };
  },

  getMetricChartData: (memberId: string, type: MetricKey) => {
    const memberMetrics = get().getMetricsByMember(memberId);
    return memberMetrics.map((m) => ({
      label: m.measuredAt.slice(5, 10),
      value: m[type]
    }));
  },

  addMetric: (metric: Omit<BodyMetric, 'id'>) => {
    const id = `met-${Date.now()}`;
    const newMetric: BodyMetric = { ...metric, id };
    set((state) => ({ metrics: [...state.metrics, newMetric] }));
    return newMetric;
  },

  updateMetric: (id: string, data: Partial<BodyMetric>) => {
    let updated: BodyMetric | undefined;
    set((state) => {
      const metrics = state.metrics.map((m) => {
        if (m.id === id) {
          updated = { ...m, ...data };
          return updated;
        }
        return m;
      });
      return { metrics };
    });
    return updated;
  },

  deleteMetric: (id: string) => {
    const exists = get().metrics.some((m) => m.id === id);
    if (!exists) return false;
    set((state) => ({ metrics: state.metrics.filter((m) => m.id !== id) }));
    return true;
  }
}));
