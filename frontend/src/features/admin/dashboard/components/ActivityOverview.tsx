import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import DashboardSectionHeader from './DashboardSectionHeader';
import DashboardPanel from '../ui/DashboardPanel';
import { easePremium } from '../ui/animations';
import AdminChartLegend from '../../ui/charts/AdminChartLegend';
import { legendFromSeries } from '../../ui/charts/chartPalette';

const CHART_HEIGHT_DESKTOP = 148;
const CHART_HEIGHT_MOBILE = 124;

const useChartHeight = () => {
  const [height, setHeight] = useState(CHART_HEIGHT_DESKTOP);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setHeight(mq.matches ? CHART_HEIGHT_MOBILE : CHART_HEIGHT_DESKTOP);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return height;
};

const seriesColors = {
  applications: '#06b6d4',
  documents: '#eab308',
  announcements: '#8b5cf6',
  studentActivity: '#2563eb',
} as const;

const keys = ['applications', 'documents', 'announcements', 'studentActivity'] as const;

const AnimatedBar: FunctionComponent<{
  value: number;
  color: string;
  delay: number;
  chartHeight: number;
  maxValue: number;
}> = ({ value, color, delay, chartHeight, maxValue }) => {
  const target =
    value <= 0 ? 0 : Math.max((Math.min(value, maxValue) / maxValue) * chartHeight, 3);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setHeight(target), 60 + delay);
    return () => window.clearTimeout(t);
  }, [target, delay]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0.5 }}
      animate={{ height, opacity: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: easePremium }}
      title={`${value}`}
      className="min-w-0 flex-1 rounded-t-md opacity-90 transition-opacity hover:opacity-100"
      style={{ backgroundColor: color, maxHeight: chartHeight }}
    />
  );
};

const ActivityOverview: FunctionComponent = () => {
  const { t } = useTranslation();
  const { chartLabels, chartData, legend, chartMaxValue } = useAdminDashboardData();
  const chartHeight = useChartHeight();
  const maxValue = Math.max(10, Math.ceil(chartMaxValue * 1.15));
  const yTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(maxValue / 4));
    const top = step * 4;
    return [top, step * 3, step * 2, step, 0];
  }, [maxValue]);

  return (
    <DashboardPanel data-admin-search-id="dashboard-chart" className="admin-section-panel w-full">
      <DashboardSectionHeader
        icon={<BarChart3 strokeWidth={1.75} aria-hidden />}
        title={t('admin.dashboard.chart.title')}
        subtitle={t('admin.dashboard.chart.subtitle')}
      />

      <motion.div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <AdminChartLegend items={legendFromSeries(legend)} />

        <motion.div className="admin-chart-inset -mx-0.5 overflow-x-auto overscroll-x-contain rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3 sm:mx-0 sm:p-4">
          <motion.div className="w-full min-w-[280px] sm:min-w-[480px]">
            <motion.div className="flex gap-1.5 sm:gap-2">
              <motion.div
                className="flex w-6 shrink-0 flex-col justify-between pb-5 text-[9px] tabular-nums text-[var(--admin-text-muted)] sm:w-7 sm:text-[10px]"
                style={{ height: chartHeight }}
              >
                {yTicks.map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </motion.div>

              <motion.div className="min-w-0 flex-1">
                <motion.div className="relative" style={{ height: chartHeight }}>
                  <motion.div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div key={i} className="border-t border-dashed border-[var(--admin-border)]" />
                    ))}
                  </motion.div>

                  <motion.div className="absolute inset-x-0 bottom-5 top-0 grid grid-cols-7 items-end gap-0.5 sm:gap-2">
                    {chartLabels.map((dayLabel, index) => (
                      <motion.div key={dayLabel} className="flex h-full min-w-0 flex-col items-center justify-end">
                        <motion.div className="flex h-full w-full max-w-[2.25rem] items-end gap-px sm:max-w-[3rem] sm:gap-0.5 md:max-w-[3.5rem]">
                          {keys.map((k, ki) => (
                            <AnimatedBar
                              key={k}
                              value={chartData[k][index]}
                              color={seriesColors[k]}
                              delay={index * 35 + ki * 15}
                              chartHeight={chartHeight}
                              maxValue={maxValue}
                            />
                          ))}
                        </motion.div>
                        <span className="mt-1.5 max-w-full truncate text-center text-[9px] font-medium text-[var(--admin-text-muted)] sm:mt-2 sm:text-[10px]">
                          {dayLabel}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </DashboardPanel>
  );
};

export default ActivityOverview;
