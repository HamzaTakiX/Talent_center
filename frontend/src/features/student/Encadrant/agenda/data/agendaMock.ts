import type { AgendaCalendarConfig, AgendaEventItem, AgendaLegendItem } from '../types';

export const agendaCalendarConfig: AgendaCalendarConfig = {
  monthLabel: 'April',
  year: 2026,
  monthIndex: 3,
  selectedDay: 16,
};

export const agendaLegendItems: AgendaLegendItem[] = [
  { id: 'meetings', label: 'Réunions', dotClassName: 'bg-[#2b7fff]' },
  { id: 'deadlines', label: 'Échéances', dotClassName: 'bg-[#ef4444]' },
  { id: 'events', label: 'Événements', dotClassName: 'bg-[#a855f7]' },
];

export const agendaUpcomingEvents: AgendaEventItem[] = [
  {
    id: 'evt-1',
    title: 'Weekly Progress Review',
    description: 'Réunion hebdomadaire de suivi avec Dr. Bennani',
    dateLabel: 'samedi 18 avril',
    timeLabel: '14:00',
    kind: 'meeting',
    actionLabel: 'Rejoindre la réunion',
  },
  {
    id: 'evt-2',
    title: 'Submit Chapter 2',
    description: 'Soumettre le chapitre 2 - Revue de littérature',
    dateLabel: 'lundi 20 avril',
    kind: 'deadline',
    priority: 'high',
  },
  {
    id: 'evt-3',
    title: 'Report Discussion',
    description: "Discussion sur l'avancement du rapport",
    dateLabel: 'mercredi 22 avril',
    timeLabel: '10:00',
    kind: 'meeting',
    actionLabel: 'Rejoindre la réunion',
  },
  {
    id: 'evt-4',
    title: 'Prepare Presentation',
    description: 'Préparer les slides de présentation',
    dateLabel: 'samedi 25 avril',
    kind: 'deadline',
    priority: 'medium',
  },
  {
    id: 'evt-5',
    title: 'Mid-term Evaluation',
    description: 'Évaluation à mi-parcours du stage',
    dateLabel: 'jeudi 30 avril',
    timeLabel: '15:00',
    kind: 'evaluation',
    priority: 'high',
  },
];

export const agendaEventsCountLabel = `${agendaUpcomingEvents.length} événements`;
