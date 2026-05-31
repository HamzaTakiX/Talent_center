/** Dashboard mock content (FR) — demo data shown on /student-dashboard */
export const studentDashboardMocksFr = {
  alerts: {
    '1': {
      message: 'Vous n\'avez candidaté à aucune offre ces 7 derniers jours',
      cta: 'Voir les offres',
    },
    '2': {
      message: 'Nouvelles offres de stage correspondant à votre profil',
      cta: 'Voir maintenant',
    },
    '3': {
      message: 'Votre score CV est passé à 82 %',
      cta: 'Voir le détail',
    },
  },
  offers: {
    o1: {
      title: 'Stage marketing digital',
      company: 'Maroc Telecom',
      location: 'Casablanca',
      tags: { marketing: 'Marketing', digital: 'Digital', strategy: 'Stratégie' },
    },
    o2: {
      title: 'Stage analyste business',
      company: 'OCP Group',
      location: 'Casablanca',
      tags: { analytics: 'Analytique', business: 'Business', data: 'Data' },
    },
    o3: {
      title: 'Stage brand management',
      company: 'Coca-Cola Maroc',
      location: 'Casablanca',
      tags: { branding: 'Branding', marketing: 'Marketing', consumer: 'Consommation' },
    },
  },
  announcements: {
    a1: {
      title: 'Invitation entretien — poste marketing',
      snippet: 'Félicitations ! Vous êtes sélectionné(e) pour un entretien…',
      company: 'Maroc Telecom',
      badge: 'Entretien',
    },
    a2: {
      title: 'Mise à jour de candidature',
      snippet: 'Votre candidature pour le stage business development est en cours d\'examen…',
      company: 'OCP Group',
      badge: 'En attente',
    },
  },
  progress: {
    profile: 'Complétion du profil',
    cv: 'Score CV',
    activity: 'Niveau d\'activité',
  },
  activity: {
    r1: { action: 'Nouveau message de l\'équipe RH Maroc Telecom', time: 'Il y a 2 heures' },
    r2: { action: 'Votre candidature OCP Group a été consultée', time: 'Il y a 5 heures' },
    r3: { action: 'Nouvelle annonce entretien Attijariwafa Bank', time: 'Il y a 1 jour' },
  },
};
