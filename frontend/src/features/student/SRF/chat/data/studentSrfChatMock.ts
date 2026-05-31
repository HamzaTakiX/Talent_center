import type { SrfChatMessage, SrfFinancialObligation, SrfFinancialSummary } from '../types';

export const studentSrfFinancialSummary: SrfFinancialSummary = {
  totalDue: 33600,
  totalPaid: 33300,
  totalRemaining: 300,
};

export const studentSrfFinancialObligations: SrfFinancialObligation[] = [
  {
    id: 'obl-1',
    title: 'Frais de bibliothèque',
    status: 'unpaid',
    detail: '300 MAD — Échéance : 30 avril',
  },
  {
    id: 'obl-2',
    title: 'Frais scolarité S2',
    status: 'paid',
    detail: '15 000 MAD — Payé le 15 janv.',
  },
  {
    id: 'obl-3',
    title: 'Frais scolarité S1',
    status: 'paid',
    detail: '15 000 MAD — Payé le 10 sept.',
  },
  {
    id: 'obl-4',
    title: "Frais d'inscription",
    status: 'paid',
    detail: '2 500 MAD — Payé le 1 sept.',
  },
];

export const studentSrfUpcomingDeadline = {
  label: '30 avril 2026 — 300 MAD',
};

export const studentSrfChatMessages: SrfChatMessage[] = [
  {
    id: 'srf-m1',
    direction: 'in',
    text: 'Bonjour Sarah, comment puis-je vous aider concernant vos frais ?',
    time: '09:00',
  },
  {
    id: 'srf-m2',
    direction: 'out',
    text: "Bonjour, j'aimerais savoir comment régler mes frais de bibliothèque de 300 MAD.",
    time: '09:02',
    topicTag: 'Frais de bibliothèque',
  },
  {
    id: 'srf-m3',
    direction: 'in',
    text:
      "Bien sûr ! Les frais de bibliothèque s'élèvent à 300 MAD avec une échéance le 30 avril. Vous pouvez effectuer le paiement par :\n• Virement bancaire\n• Chèque\n• Paiement en ligne via votre portail étudiant",
    time: '09:03',
    topicTag: 'Frais de bibliothèque — 300 MAD',
  },
  {
    id: 'srf-m4',
    direction: 'out',
    text: "Merci ! Je vais effectuer le virement bancaire aujourd'hui. Dois-je vous envoyer le reçu ?",
    time: '09:05',
  },
  {
    id: 'srf-m5',
    direction: 'in',
    text:
      'Parfait ! Oui, veuillez envoyer le reçu de virement via ce chat ou directement sur le portail SRF après paiement. Notre équipe validera votre paiement sous 48 h.',
    time: '09:06',
  },
];

/** @deprecated Legacy multi-conversation seed — kept for API compatibility. */
export { studentSrfChatParticipants, studentSrfChatInitialMessages } from './studentSrfChatLegacyMock';
