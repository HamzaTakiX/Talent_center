import { CHART_PADDING } from './useAdminChartHeight';

export function computeMax(values: number[][], fallback = 100): number {
  const max = Math.max(...values.flat(), 1);
  return Math.ceil(max / 10) * 10 || fallback;
}

export function linePath(
  values: number[],
  width: number,
  height: number,
  max: number,
  padding = CHART_PADDING
): string {
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = padding.left + index * stepX;
      const y = padding.top + innerH - (Math.min(value, max) / max) * innerH;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function areaPath(
  values: number[],
  width: number,
  height: number,
  max: number,
  padding = CHART_PADDING
): string {
  const line = linePath(values, width, height, max, padding);
  const innerW = width - padding.left - padding.right;
  const baseY = height - padding.bottom;
  const lastX =
    padding.left + (values.length - 1) * (values.length > 1 ? innerW / (values.length - 1) : 0);
  return `${line} L ${lastX.toFixed(1)} ${baseY} L ${padding.left} ${baseY} Z`;
}
