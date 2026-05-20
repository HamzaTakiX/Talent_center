/** Classes partagées pour tous les formulaires admin (inputs, boutons, grilles). */
export const adminFormPanelClass = 'admin-form admin-module-panel shadow-sm';

/** Panneau formulaire (défile avec la page, pas de pied fixe). */
export const adminFormPanelFlexClass = `${adminFormPanelClass} w-full`;

export const adminFormBodyClass = 'admin-form__body px-4 py-5 sm:px-6 sm:py-6';

/** Corps du formulaire (alias — défile avec la page). */
export const adminFormBodyScrollClass = adminFormBodyClass;

/** Empilement des sections à l’intérieur du formulaire. */
export const adminFormSectionsStackClass = 'flex flex-col gap-5';

export const adminFormHeaderClass = 'admin-form__header mb-10';

export const adminFormTitleClass =
  'admin-form__title text-xl font-semibold leading-7 tracking-tight text-[var(--admin-text)]';

export const adminFormSubtitleClass =
  'admin-form__subtitle mt-2 text-base leading-6 text-[var(--admin-text-secondary)]';

export const adminFormGridClass =
  'admin-form__grid grid grid-cols-1 gap-6 md:grid-cols-2 sm:gap-x-8 sm:gap-y-6';

export const adminFormLabelClass =
  'admin-form-label flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]';

export const adminFormRequiredClass = 'admin-form-required text-red-600';

export const adminFormHintClass = 'admin-form-hint m-0 text-xs leading-4 text-[var(--admin-text-secondary)]';

export const adminFormInputClass = 'admin-form-input admin-field';

export const adminFormTextareaClass = 'admin-form-textarea admin-field';

export const adminFormFileClass = 'admin-form-file admin-field';

export const adminFormDateInputClass = 'admin-form-input admin-form-input--date admin-field';

export const adminFormDateWrapClass = 'admin-form-date relative';

export const adminFormActionsClass =
  'admin-form-actions grid min-w-0 shrink-0 grid-cols-1 gap-4 px-4 py-6 sm:px-10 md:grid-cols-2 lg:px-12';

/** Pied d’actions — sticky en bas du viewport sur formulaires longs. */
export const adminFormActionsFooterClass = `${adminFormActionsClass} admin-form-actions--sticky`;

/** @deprecated Utiliser adminFormActionsFooterClass */
export const adminFormActionsStickyClass = adminFormActionsFooterClass;

/** @deprecated Utiliser AdminFormSection */
export const adminFormSectionClass =
  'space-y-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 p-4 sm:p-6';

/** @deprecated Utiliser AdminFormSection */
export const adminFormSectionTitleClass = 'text-sm font-semibold text-[var(--admin-text)]';

export const adminFormBtnSecondaryClass =
  'admin-btn-secondary admin-form-btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-admin-sm text-sm font-semibold';

export const adminFormBtnPrimaryClass =
  'admin-btn-primary admin-form-btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-admin-sm text-sm font-semibold text-white';

export const adminFormFieldClass = 'admin-form-field flex flex-col gap-1.5';
