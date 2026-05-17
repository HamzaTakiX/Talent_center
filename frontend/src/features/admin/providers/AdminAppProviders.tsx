import { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminPreferencesProvider } from '../account/context/AdminPreferencesContext';
import { AdminThemeProvider } from '../dashboard/context/AdminThemeContext';
import { AdminToastProvider } from '../dashboard/context/AdminToastContext';
import AdminToastContainer from '../dashboard/components/AdminToastContainer';
import { AdminGlobalSearchProvider } from '../search/context/AdminGlobalSearchContext';

/** Wraps all authenticated routes so admin hooks work on every page. */
const AdminAppProviders: FunctionComponent = () => (
  <AdminThemeProvider>
    <AdminPreferencesProvider>
      <AdminToastProvider>
        <AdminGlobalSearchProvider>
          <Outlet />
          <AdminToastContainer />
        </AdminGlobalSearchProvider>
      </AdminToastProvider>
    </AdminPreferencesProvider>
  </AdminThemeProvider>
);

export default AdminAppProviders;
