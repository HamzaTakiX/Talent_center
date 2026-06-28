import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';

export function documentServiceHasAutoGenerate(item: DocumentServiceCatalogItem): boolean {
  return Boolean(item.autoGenerate || item.config.availability.autoGenerateEnabled);
}

export function documentServiceIsAutoGenerateMode(item: DocumentServiceCatalogItem): boolean {
  return item.studentRequest?.mode === 'auto_generate' || documentServiceHasAutoGenerate(item);
}
