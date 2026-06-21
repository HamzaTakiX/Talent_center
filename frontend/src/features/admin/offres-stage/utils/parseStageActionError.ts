import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';

const FALLBACK_KEYS: Record<number, string> = {
  403: 'admin.modules.offers.actions.errors.forbidden',
  404: 'admin.modules.offers.actions.errors.notFound',
  409: 'admin.modules.offers.actions.errors.conflict',
  500: 'admin.modules.offers.actions.errors.server',
};

export function parseStageActionError(err: unknown, fallbackKey: string): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const parsed = parseAdminApiError(err, fallbackKey);
  if (parsed.message && parsed.message !== fallbackKey) {
    return parsed.message;
  }
  if (status && FALLBACK_KEYS[status]) {
    return FALLBACK_KEYS[status];
  }
  return fallbackKey;
}
