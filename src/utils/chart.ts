export interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  minValue?: number;
  maxValue?: number;
}

const defaultPadding = { top: 20, right: 20, bottom: 40, left: 50 };

export const calculateChartPoints = (
  data: Array<{ label: string; value: number }>,
  config: ChartConfig
): ChartPoint[] => {
  const { width, height, padding = {}, minValue, maxValue } = config;
  const pad = { ...defaultPadding, ...padding };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;

  if (data.length === 0) return [];

  const values = data.map((d) => d.value);
  const actualMin = minValue !== undefined ? minValue : Math.min(...values);
  const actualMax = maxValue !== undefined ? maxValue : Math.max(...values);
  const valueRange = actualMax - actualMin || 1;

  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  return data.map((item, index) => ({
    x: pad.left + stepX * index,
    y: pad.top + chartHeight - ((item.value - actualMin) / valueRange) * chartHeight,
    value: item.value,
    label: item.label
  }));
};

export const generateSmoothPath = (points: ChartPoint[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

export const generateAreaPath = (points: ChartPoint[], config: ChartConfig): string => {
  if (points.length === 0) return '';

  const { height, padding = {} } = config;
  const pad = { ...defaultPadding, ...padding };
  const bottomY = height - pad.bottom;

  const linePath = generateSmoothPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
};

export const generateYAxisTicks = (
  config: ChartConfig,
  tickCount: number = 5
): Array<{ value: number; y: number; label: string }> => {
  const { height, padding = {}, minValue, maxValue } = config;
  const pad = { ...defaultPadding, ...padding };
  const chartHeight = height - pad.top - pad.bottom;

  if (minValue === undefined || maxValue === undefined) return [];

  const ticks: Array<{ value: number; y: number; label: string }> = [];
  const step = (maxValue - minValue) / tickCount;

  for (let i = 0; i <= tickCount; i++) {
    const value = minValue + step * i;
    const y = pad.top + chartHeight - (i / tickCount) * chartHeight;
    ticks.push({
      value: Math.round(value * 100) / 100,
      y,
      label: String(Math.round(value * 10) / 10)
    });
  }

  return ticks;
};

export const generateXAxisTicks = (
  points: ChartPoint[],
  config: ChartConfig
): Array<{ x: number; label: string }> => {
  const { height, padding = {} } = config;
  const pad = { ...defaultPadding, ...padding };

  return points.map((point) => ({
    x: point.x,
    label: point.label
  }));
};

export const getBarChartData = (
  data: Array<{ label: string; value: number }>,
  config: ChartConfig
): Array<{ x: number; y: number; width: number; height: number; value: number; label: string }> => {
  const { width, height, padding = {}, minValue = 0, maxValue } = config;
  const pad = { ...defaultPadding, ...padding };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;

  if (data.length === 0) return [];

  const actualMax = maxValue !== undefined ? maxValue : Math.max(...data.map((d) => d.value));
  const valueRange = actualMax - minValue || 1;
  const barWidth = (chartWidth / data.length) * 0.6;
  const gap = (chartWidth / data.length) * 0.4;

  return data.map((item, index) => {
    const barHeight = ((item.value - minValue) / valueRange) * chartHeight;
    const x = pad.left + gap / 2 + index * (barWidth + gap);
    const y = pad.top + chartHeight - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      value: item.value,
      label: item.label
    };
  });
};
