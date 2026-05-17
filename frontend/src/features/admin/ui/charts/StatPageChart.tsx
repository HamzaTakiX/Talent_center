import { FunctionComponent } from 'react';
import { useTranslatedStatChart } from '../../i18n/useTranslatedStatChart';
import AdminBarChart from './AdminBarChart';
import AdminDonutChart from './AdminDonutChart';
import AdminLineChart from './AdminLineChart';
import { applyChartPageTones } from './statChartTones';
import type { StatPageChartId } from './types';

interface StatPageChartProps {
  chartId: StatPageChartId;
}

const StatPageChart: FunctionComponent<StatPageChartProps> = ({ chartId }) => {
  const translated = useTranslatedStatChart(chartId);
  const config = translated ? applyChartPageTones(chartId, translated) : null;
  if (!config) return null;

  if (config.type === 'donut' && config.segments) {
    return <AdminDonutChart segments={config.segments} ariaLabel={config.ariaLabel} />;
  }

  if (config.type === 'line' && config.labels && config.series) {
    return (
      <AdminLineChart
        labels={config.labels}
        series={config.series}
        max={config.max}
        showArea={config.showArea}
        ariaLabel={config.ariaLabel}
      />
    );
  }

  if (config.type === 'bar' && config.labels && config.series) {
    return (
      <AdminBarChart
        labels={config.labels}
        series={config.series}
        max={config.max}
        stacked={config.stacked}
        ariaLabel={config.ariaLabel}
      />
    );
  }

  return null;
};

export default StatPageChart;
