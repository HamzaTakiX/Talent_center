import { FunctionComponent, useState } from 'react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import StudentFinancialSummaryGrid from '../components/StudentFinancialSummaryGrid';
import StudentFinancialStatusTable from '../components/StudentFinancialStatusTable';
import { studentFinancialTableRows } from '../data/srfFinancialMock';

const StudentFinancialStatusPage: FunctionComponent = () => {
  const [query, setQuery] = useState('');

  return (
    <AdminModulePageShell width="wide">
      <div data-admin-search-id="srf-stats">
        <StudentFinancialSummaryGrid />
      </div>
      <div data-admin-search-id="srf-table">
      <StudentFinancialStatusTable
        rows={studentFinancialTableRows}
        query={query}
        onQueryChange={setQuery}
      />
      </div>
    </AdminModulePageShell>
  );
};

export default StudentFinancialStatusPage;
