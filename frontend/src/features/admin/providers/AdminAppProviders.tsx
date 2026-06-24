import { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminPreferencesProvider } from '../account/context/AdminPreferencesContext';
import { AdminThemeProvider } from '../dashboard/context/AdminThemeContext';
import { AdminToastProvider } from '../dashboard/context/AdminToastContext';
import AdminToastContainer from '../dashboard/components/AdminToastContainer';
import { AdminGlobalSearchProvider } from '../search/context/AdminGlobalSearchContext';
import { AcademicStructureCatalogProvider } from '../shared/academic-structure/context/AcademicStructureCatalogContext';
import { NotificationProvider } from '../../shared/notifications/context/NotificationContext';
import { ChatUnreadProvider } from '../../shared/contextual-chat/context/ChatUnreadContext';

/** Wraps all authenticated routes so admin hooks work on every page. */
const AdminAppProviders: FunctionComponent = () => (
  <AdminThemeProvider>
    <AdminPreferencesProvider>
      <NotificationProvider>
        <ChatUnreadProvider>
          <AdminToastProvider>
            <AdminGlobalSearchProvider>
              <AcademicStructureCatalogProvider>
                <Outlet />
                <AdminToastContainer />
              </AcademicStructureCatalogProvider>
            </AdminGlobalSearchProvider>
          </AdminToastProvider>
        </ChatUnreadProvider>
      </NotificationProvider>
    </AdminPreferencesProvider>
  </AdminThemeProvider>
);

export default AdminAppProviders;
