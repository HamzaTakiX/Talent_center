import { FunctionComponent } from 'react';
import { Navigate } from 'react-router-dom';

/** Redirection vers la section Paramètres de la page compte unifiée. */
const AdminSettingsPage: FunctionComponent = () => (
  <Navigate to="/admin/profile#settings" replace />
);

export default AdminSettingsPage;
