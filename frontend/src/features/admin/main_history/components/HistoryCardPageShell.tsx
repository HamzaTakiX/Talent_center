import { FunctionComponent, ReactNode } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import { AdminBackToHistoryButton } from '../../ui';

interface HistoryCardPageShellProps {
  stats: ReactNode;
  chart?: ReactNode;
  timeline: ReactNode;
}

/** Layout détail history — largeur alignée modules principaux (stats + panneau liste). */
const HistoryCardPageShell: FunctionComponent<HistoryCardPageShellProps> = ({ stats, chart, timeline }) => (
  <AdminModulePageShell width="wide">
    <AdminBackToHistoryButton />
    <div className="flex w-full min-w-0 flex-col gap-5 md:gap-7">
      {stats}
      {chart}
      <section className="admin-history-page admin-history-page--panel admin-module-panel w-full min-w-0 overflow-hidden shadow-sm">
        <div className="flex min-w-0 max-w-full flex-col gap-3 overflow-x-hidden px-4 pb-4 pt-4 sm:gap-4 sm:px-6 sm:pb-6 sm:pt-5">
          {timeline}
        </div>
      </section>
    </div>
  </AdminModulePageShell>
);

export default HistoryCardPageShell;
