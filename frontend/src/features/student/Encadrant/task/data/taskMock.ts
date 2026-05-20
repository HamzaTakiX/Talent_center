import type { EncadrantTaskItem, TaskProgressSummary, TaskTab } from '../types';

export const taskProgressSummary: TaskProgressSummary = {
  completedCount: 1,
  totalCount: 5,
  percentLabel: '55%',
  stats: {
    todo: 2,
    in_progress: 1,
    in_review: 1,
    done: 1,
  },
};

export const taskUrgentAlert = {
  title: 'Échéance urgente demain !',
  message:
    'La tâche "Submit weekly progress report" doit être terminée demain (17 avril 2026). Statut actuel: En révision.',
};

export const taskTabs: TaskTab[] = [
  { id: 'all', label: 'Toutes', count: 5 },
  { id: 'todo', label: 'À faire', count: 2 },
  { id: 'in_progress', label: 'En cours', count: 1 },
  { id: 'in_review', label: 'Révision', count: 1 },
  { id: 'done', label: 'Terminé', count: 1 },
];

export const encadrantTasks: EncadrantTaskItem[] = [
  {
    id: 'task-1',
    title: 'Complete Chapter 2 - Literature Review',
    description:
      'Finir la revue de littérature en couvrant les approches traditionnelles et modernes de votre sujet de recherche. Inclure au moins 20 références récentes.',
    status: 'in_progress',
    priority: 'high',
    daysRemainingLabel: '4 jours restants',
    progress: 75,
  },
  {
    id: 'task-2',
    title: 'Prepare presentation slides',
    description:
      "Créer une présentation de 15-20 slides résumant l'avancement de votre travail pour la réunion de suivi.",
    status: 'todo',
    priority: 'medium',
    daysRemainingLabel: '9 jours restants',
    progress: 0,
  },
  {
    id: 'task-3',
    title: 'Submit weekly progress report',
    description:
      'Rédiger un rapport hebdomadaire décrivant les tâches accomplies, les défis rencontrés et les plans pour la semaine prochaine.',
    status: 'in_review',
    priority: 'high',
    daysRemainingLabel: '1 jours restants',
    progress: 100,
  },
  {
    id: 'task-4',
    title: 'Conduct user testing',
    description:
      'Organiser et mener des tests utilisateurs avec au moins 10 participants pour valider votre prototype.',
    status: 'todo',
    priority: 'medium',
    daysRemainingLabel: '12 jours restants',
    progress: 0,
  },
  {
    id: 'task-5',
    title: 'Update bibliography',
    description:
      'Mettre à jour la bibliographie avec toutes les nouvelles sources utilisées dans les chapitres récents.',
    status: 'done',
    priority: 'low',
    daysRemainingLabel: '14 jours restants',
    progress: 100,
  },
];
