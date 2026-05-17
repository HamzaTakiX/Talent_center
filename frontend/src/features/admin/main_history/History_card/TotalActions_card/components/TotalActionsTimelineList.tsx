import { FunctionComponent, useMemo } from 'react';
import { totalActionsRows } from '../data/totalActionsHistoryMock';
import AdminHistoryTimelineList from '../../../../ui/AdminHistoryTimelineList';

const TotalActionsTimelineList: FunctionComponent = () => {
  const rows = useMemo(
    () =>
      totalActionsRows.map((row) => ({
        id: row.id,
        module: row.module,
        actionType: row.type,
        title: row.title,
        actor: row.actor,
        timestamp: row.timestamp,
      })),
    []
  );

  return <AdminHistoryTimelineList embedded rows={rows} />;
};

export default TotalActionsTimelineList;
