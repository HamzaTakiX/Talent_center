import { FunctionComponent } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import EncadrantReportsStatGrid from '../components/EncadrantReportsStatGrid';
import EncadrantReportsTableSection from '../components/EncadrantReportsTableSection';

const EncadrantReportsPage: FunctionComponent = () => (
  <AdminLayout>
    <div className="w-full">
      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-[1600px] flex-col space-y-5 pb-6">
        <EncadrantReportsStatGrid />
        <EncadrantReportsTableSection />
      </div>
    </div>
  </AdminLayout>
);

export default EncadrantReportsPage;
