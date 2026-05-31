import { Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import type {
  DocumentCatalogItem,
  DocumentsStatIconKey,
  DocumentsStatItem,
} from '../types';

export const documentsStatIconMap: Record<DocumentsStatIconKey, typeof FileText> = {
  total: FileText,
  pending: Clock,
  validated: CheckCircle2,
  reserved: Calendar,
};

export const documentsStatColorMap: Record<DocumentsStatIconKey, string> = {
  total: 'bg-[#2b7fff]',
  pending: 'bg-[#a855f7]',
  validated: 'bg-[#22c55e]',
  reserved: 'bg-[#6366f1]',
};

export const documentsStats: DocumentsStatItem[] = [
  {
    label: 'Total Requests',
    value: '24',
    subtitle: 'Toutes demandes',
    iconKey: 'total',
  },
  {
    label: 'Pending Requests',
    value: '7',
    subtitle: 'En cours de traitement',
    iconKey: 'pending',
  },
  {
    label: 'Validated Documents',
    value: '15',
    subtitle: 'Documents validés',
    iconKey: 'validated',
  },
  {
    label: 'Reserved Requests',
    value: '2',
    subtitle: 'Créneaux réservés',
    iconKey: 'reserved',
  },
];

export const documentsMissingAlert = {
  title: 'Documents manquants détectés',
  message:
    'Votre demande "Documents financiers" nécessite 2 pièces justificatives supplémentaires. Veuillez les soumettre avant le 18 avril 2026.',
  actionLabel: 'Voir détails',
};

export const documentCatalogItems: DocumentCatalogItem[] = [
  {
    id: 'doc-1',
    title: 'Attestation de scolarité',
    categoryKey: 'administrative',
    delayLabel: 'Délai: 2-3 jours',
    requirement: 'Étudiant inscrit pour l\'année en cours',
    badgeType: 'auto',
  },
  {
    id: 'doc-2',
    title: 'Convention de stage',
    categoryKey: 'internship',
    delayLabel: 'Délai: 5-7 jours',
    requirement: 'Avoir une offre de stage validée',
    badgeType: 'reservation',
  },
  {
    id: 'doc-3',
    title: 'Relevé de notes',
    categoryKey: 'academic',
    delayLabel: 'Délai: 3-5 jours',
    requirement: 'Fin de semestre validé',
    badgeType: 'auto',
  },
  {
    id: 'doc-4',
    title: 'Attestation de réussite',
    categoryKey: 'academic',
    delayLabel: 'Délai: 2-3 jours',
    requirement: 'Semestre validé avec moyenne ≥ 10',
    badgeType: 'auto',
  },
  {
    id: 'doc-5',
    title: 'Certificat de scolarité bilingue',
    categoryKey: 'administrative',
    delayLabel: 'Délai: 3-5 jours',
    requirement: 'Demande en ligne avec motif précisé',
    badgeType: 'reservation',
  },
  {
    id: 'doc-6',
    title: 'Attestation de stage',
    categoryKey: 'internship',
    delayLabel: 'Délai: 4-6 jours',
    requirement: 'Stage en cours ou terminé',
    badgeType: 'auto',
  },
  {
    id: 'doc-7',
    title: 'Relevé de paiement des frais',
    categoryKey: 'financial',
    delayLabel: 'Délai: 2-3 jours',
    requirement: 'Compte SRF à jour ou plan de paiement actif',
    badgeType: 'auto',
  },
  {
    id: 'doc-8',
    title: 'Attestation de non-imposition',
    categoryKey: 'financial',
    delayLabel: 'Délai: 5-7 jours',
    requirement: 'Bourse ou aide sociale en cours',
    badgeType: 'reservation',
  },
  {
    id: 'doc-9',
    title: 'Duplicata de diplôme',
    categoryKey: 'academic',
    delayLabel: 'Délai: 10-15 jours',
    requirement: 'Diplôme délivré par l\'établissement',
    badgeType: 'reservation',
  },
];
