import { InternshipOfferDetail } from '../types';
import { internshipOffersMockData } from './internshipOffersMockData';

type DetailExtra = Pick<
  InternshipOfferDetail,
  'location' | 'postedOn' | 'description' | 'skills' | 'studentApplications'
>;

const detailExtras: Record<string, DetailExtra> = {
  '1': {
    location: 'Casablanca, Morocco',
    postedOn: '20/03/2026',
    description:
      "Nous recherchons un stagiaire passionné par l'Intelligence Artificielle et le Machine Learning pour rejoindre notre équipe d'innovation. Le candidat idéal aura l'opportunité de travailler sur des projets réels utilisant des technologies de pointe.",
    skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Data Analysis', 'Deep Learning'],
    studentApplications: [
      {
        id: 'a1',
        studentName: 'Sarah Alami',
        classLabel: 'Master 2',
        field: 'AI & Data Science',
        matchScore: 95,
        status: 'Pending',
      },
      {
        id: 'a2',
        studentName: 'Youssef Benani',
        classLabel: 'Master 2',
        field: 'AI & Data Science',
        matchScore: 88,
        status: 'Pending',
      },
      {
        id: 'a3',
        studentName: 'Amina Khalil',
        classLabel: 'Master 1',
        field: 'Software Engineering',
        matchScore: 82,
        status: 'Accepted',
      },
      {
        id: 'a4',
        studentName: 'Mohamed Idrissi',
        classLabel: 'Master 2',
        field: 'Data Science',
        matchScore: 79,
        status: 'Pending',
      },
      {
        id: 'a5',
        studentName: 'Fatima Zahra',
        classLabel: 'Master 1',
        field: 'AI & Data Science',
        matchScore: 91,
        status: 'Pending',
      },
    ],
  },
  '2': {
    location: 'Rabat, Morocco',
    postedOn: '12/03/2026',
    description:
      "Analyste Data Science pour missions de visualisation, modélisation et reporting. Maîtrise de Python, SQL et outils BI attendue. Vous participerez à des projets clients variés au sein d'une équipe agile.",
    skills: ['Python', 'SQL', 'Power BI', 'Pandas', 'Statistics'],
    studentApplications: [
      {
        id: 'b1',
        studentName: 'Karim El Amrani',
        classLabel: 'Master 2',
        field: 'Data Science',
        matchScore: 92,
        status: 'Pending',
      },
      {
        id: 'b2',
        studentName: 'Leila Tazi',
        classLabel: 'Master 1',
        field: 'Statistics',
        matchScore: 85,
        status: 'Accepted',
      },
      {
        id: 'b3',
        studentName: 'Omar Fariss',
        classLabel: 'Master 2',
        field: 'Business Analytics',
        matchScore: 78,
        status: 'Pending',
      },
    ],
  },
  '3': {
    location: 'Casablanca, Morocco',
    postedOn: '05/03/2026',
    description:
      'Poste de développeur Full Stack (React, Node.js) pour concevoir et maintenir des applications web modernes. Bonne culture DevOps et Git appréciée.',
    skills: ['React', 'Node.js', 'TypeScript', 'REST API', 'Git'],
    studentApplications: [
      {
        id: 'c1',
        studentName: 'Hicham Bennis',
        classLabel: 'Master 2',
        field: 'Software Engineering',
        matchScore: 90,
        status: 'Pending',
      },
      {
        id: 'c2',
        studentName: 'Salma Idrissi',
        classLabel: 'Master 1',
        field: 'Web Development',
        matchScore: 84,
        status: 'Pending',
      },
    ],
  },
  '4': {
    location: 'Remote',
    postedOn: '18/04/2026',
    description:
      'Mission de conseil IT : accompagnement transformation digitale, audit de systèmes et recommandations stratégiques. Profil autonome et rigoureux.',
    skills: ['Consulting', 'IT Strategy', 'UML', 'Agile'],
    studentApplications: [],
  },
  '5': {
    location: 'Casablanca, Morocco',
    postedOn: '01/02/2026',
    description:
      'Ingénieur DevOps pour industrialiser le déploiement (CI/CD, Kubernetes, cloud). Environnement technique exigeant.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    studentApplications: [
      {
        id: 'e1',
        studentName: 'Mehdi Chaoui',
        classLabel: 'Master 2',
        field: 'Cloud & DevOps',
        matchScore: 81,
        status: 'Pending',
      },
    ],
  },
  '6': {
    location: 'Casablanca, Morocco',
    postedOn: '15/02/2026',
    description:
      'Mission clôturée — analyse métier, cadrage besoins et support à la prise de décision pour les projets clients du cabinet.',
    skills: ['Business Analysis', 'Requirements', 'SQL', 'Agile'],
    studentApplications: [],
  },
  '7': {
    location: 'Casablanca, Morocco',
    postedOn: '25/04/2026',
    description: "Conception d'interfaces utilisateur et prototypes Figma pour produits SaaS.",
    skills: ['Figma', 'UI Design', 'Prototyping'],
    studentApplications: [],
  },
  '8': {
    location: 'Casablanca, Morocco',
    postedOn: '15/03/2026',
    description: 'Audit de sécurité, durcissement systèmes et sensibilisation équipes.',
    skills: ['SOC', 'Risk', 'Network Security'],
    studentApplications: [],
  },
  '9': {
    location: 'Casablanca, Morocco',
    postedOn: '02/03/2026',
    description:
      'Analyse des menaces, supervision SOC et mise en conformité des politiques de sécurité pour les clients SecureNet.',
    skills: ['SIEM', 'Penetration Testing', 'SOC', 'GRC'],
    studentApplications: [],
  },
};

export function getInternshipOfferDetail(id: string): InternshipOfferDetail | undefined {
  const base = internshipOffersMockData.find((o) => o.id === id);
  const extra = detailExtras[id];
  if (!base || !extra) return undefined;
  return { ...base, ...extra };
}
