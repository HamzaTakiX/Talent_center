import type { SrfFeeRow, SrfFeeTab, SrfPaymentHistoryRow, SrfUpcomingDeadline } from '../types';

export const srfFeeTabs: SrfFeeTab[] = [
  { id: 'all', label: 'Tout', count: 5 },
  { id: 'unpaid', label: 'Non payé', count: 1 },
  { id: 'partial', label: 'Partiellement payé', count: 0 },
  { id: 'paid', label: 'Payé', count: 4 },
  { id: 'late', label: 'En retard', count: 0 },
];

export const srfFeeRows: SrfFeeRow[] = [
  {
    id: 'fee-1',
    feeType: 'Frais de scolarité - Semestre 1',
    dueDate: '15/09/2026',
    amountExpected: 15000,
    amountPaid: 15000,
    amountRemaining: 0,
    status: 'paid',
    canPay: false,
  },
  {
    id: 'fee-2',
    feeType: 'Frais de scolarité - Semestre 2',
    dueDate: '15/02/2026',
    amountExpected: 15000,
    amountPaid: 15000,
    amountRemaining: 0,
    status: 'paid',
    canPay: false,
  },
  {
    id: 'fee-3',
    feeType: "Frais d'inscription annuels",
    dueDate: '01/09/2026',
    amountExpected: 2500,
    amountPaid: 2500,
    amountRemaining: 0,
    status: 'paid',
    canPay: false,
  },
  {
    id: 'fee-4',
    feeType: 'Assurance étudiante',
    dueDate: '01/10/2026',
    amountExpected: 800,
    amountPaid: 800,
    amountRemaining: 0,
    status: 'paid',
    canPay: false,
  },
  {
    id: 'fee-5',
    feeType: 'Frais de bibliothèque',
    dueDate: '30/04/2026',
    amountExpected: 300,
    amountPaid: 0,
    amountRemaining: 300,
    status: 'unpaid',
    canPay: true,
  },
];

export const srfPaymentHistoryRows: SrfPaymentHistoryRow[] = [
  {
    id: 'hist-proof-1-reviewed',
    date: '20/01/2026',
    sortAt: new Date('2026-01-20').getTime(),
    type: 'verification',
    description: 'tranche_2 (VIR-2026-001)',
    amount: 11000,
    status: 'approved',
  },
  {
    id: 'hist-proof-1-submitted',
    date: '18/01/2026',
    sortAt: new Date('2026-01-18').getTime(),
    type: 'verification',
    description: 'Demande de verification — tranche_2 (VIR-2026-001)',
    amount: 11000,
    status: 'pending',
  },
  {
    id: 'hist-1',
    date: '15/01/2026',
    sortAt: new Date('2026-01-15').getTime(),
    type: 'payment',
    description: 'Paiement frais scolarité S2',
    amount: 15000,
    status: 'validated',
  },
];

export const srfPaymentMethods = [
  { value: '', label: 'Sélectionner une méthode' },
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'especes', label: 'Espèces' },
  { value: 'carte', label: 'Carte bancaire' },
];

export const srfUpcomingDeadline: SrfUpcomingDeadline = {
  id: 'deadline-1',
  feeType: 'Frais de bibliothèque',
  dueLabel: 'Échéance: 30 avril 2026',
  amount: 300,
  daysLabel: 'Dans 14 jours',
};
