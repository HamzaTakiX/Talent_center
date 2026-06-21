/** Limites de caractères — module Internship Offers */
export const OFFER_FIELD_LIMITS = {
  offerTitle: 120,
  companyName: 80,
  location: 80,
  department: 80,
  skillName: 40,
  tag: 30,
  chatMessage: 2000,
  internalNotes: 5000,
  description: 10000,
  descriptionSection: 2500,
  externalUrl: 512,
  email: 254,
  searchQuery: 120,
  fileName: 255,
} as const;

export type OfferFieldLimitKey = keyof typeof OFFER_FIELD_LIMITS;

/** Hauteur max des textareas auto-resize (px) */
export const TEXTAREA_MAX_HEIGHT = {
  default: 240,
  description: 320,
  chat: 160,
  notes: 400,
} as const;
