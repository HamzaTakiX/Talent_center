import { FunctionComponent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Legacy route — redirects to Service Catalog. */
const DocumentTypesPage: FunctionComponent = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/documents/catalog', { replace: true });
  }, [navigate]);
  return null;
};

export default DocumentTypesPage;
