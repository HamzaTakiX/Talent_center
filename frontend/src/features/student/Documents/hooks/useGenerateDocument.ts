import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';
import { studentDocumentsApi } from '../api/studentDocumentsApi';
import type { StudentDocumentGenerateResponse } from '../../../admin/Documents_admin/types/documentServiceCatalog';

export function useGenerateDocument() {
  const { t } = useTranslation();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDocument = useCallback(
    async (serviceId: string): Promise<StudentDocumentGenerateResponse | null> => {
      setGenerating(true);
      setError(null);
      try {
        return await studentDocumentsApi.generateDocument(serviceId);
      } catch (err) {
        const parsed = parseAdminApiError(err, 'student.documents.errors.generateFailed');
        setError(parsed.message || t('student.documents.errors.generateFailed'));
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [t],
  );

  return { generating, error, generateDocument };
}
