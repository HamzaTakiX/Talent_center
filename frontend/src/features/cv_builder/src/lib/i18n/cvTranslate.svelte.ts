import i18n from '../../../../../i18n/config';

/** Bump on language change so Svelte `$derived`/`$effect` re-run translations. */
let cvI18nTick = $state(0);

export function getCvI18nTick(): number {
  return cvI18nTick;
}

export function cvT(key: string, options?: Record<string, unknown>): string {
  void getCvI18nTick();
  return i18n.t(key, options ?? {});
}

export function initCvI18n(): () => void {
  const bump = () => {
    cvI18nTick += 1;
  };
  i18n.on('languageChanged', bump);
  i18n.on('loaded', bump);
  bump();
  return () => {
    i18n.off('languageChanged', bump);
    i18n.off('loaded', bump);
  };
}
