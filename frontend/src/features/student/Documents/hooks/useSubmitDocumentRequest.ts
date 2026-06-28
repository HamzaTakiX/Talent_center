import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { parseAdminApiError } from '../../../admin/shared/utils/parseAdminApiError';

import { studentDocumentsApi } from '../api/studentDocumentsApi';

import {

  resolveDocumentRequestError,

  type DocumentRequestErrorKind,

} from '../utils/mapDocumentRequestError';



export function useSubmitDocumentRequest() {

  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [errorKind, setErrorKind] = useState<DocumentRequestErrorKind | null>(null);



  const submitRequest = useCallback(async (serviceId: string) => {

    setSubmitting(true);

    setError(null);

    setErrorKind(null);

    try {

      const data = await studentDocumentsApi.createRequest(serviceId);

      return data;

    } catch (err) {

      const parsed = parseAdminApiError(err, t('student.documents.errors.submitFailed'));

      const resolved = resolveDocumentRequestError(parsed.message, t);

      setError(resolved.message);

      setErrorKind(resolved.kind);

      return null;

    } finally {

      setSubmitting(false);

    }

  }, [t]);



  return { submitting, error, errorKind, submitRequest };

}

