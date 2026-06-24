export type OfferApplicationMethod = 'internal' | 'external' | 'email';

export interface OfferApplyRoutingInput {
  externalUrl?: string | null;
  applicationMethod?: string | null;
  metadata?: Record<string, unknown> | null;
}

export function resolveOfferApplicationMethod(
  offer: OfferApplyRoutingInput,
): OfferApplicationMethod {
  const fromMeta = String(
    offer.applicationMethod ?? offer.metadata?.application_method ?? '',
  )
    .trim()
    .toLowerCase();

  if (fromMeta === 'external' || fromMeta === 'email' || fromMeta === 'internal') {
    return fromMeta;
  }

  // Imported / LinkedIn offers: open the external site, track application on the platform.
  const url = String(offer.externalUrl ?? '').trim();
  if (url) {
    return 'external';
  }

  return 'internal';
}

/** Opens external site + confirmation modal when recruitment is external. */
export function getOfferExternalApplicationUrl(offer: OfferApplyRoutingInput): string | null {
  if (resolveOfferApplicationMethod(offer) !== 'external') {
    return null;
  }
  const url = String(offer.externalUrl ?? '').trim();
  return url || null;
}

export function openExternalApplicationUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
