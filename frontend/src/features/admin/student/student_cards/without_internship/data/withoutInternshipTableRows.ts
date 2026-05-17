/** Ligne tableau « sans stage » : statut de compte actif ou inactif (maquette). */
export interface WithoutInternshipTableRow {
  id: string;
  name: string;
  classLevel: string;
  field: string;
  /** Dans cette vue, toujours « None » côté maquette. */
  internshipStatus: 'None';
  statusLabel: 'Active' | 'Inactive';
}

export const withoutInternshipTableRows: WithoutInternshipTableRow[] = [
  {
    id: 'wi1',
    name: 'Youssef Benani',
    classLevel: 'Master 1',
    field: 'Software Engineering',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: 'wi2',
    name: 'Leila Mansouri',
    classLevel: 'Master 1',
    field: 'Data Engineering',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: 'wi3',
    name: 'Omar El Harti',
    classLevel: 'Master 1',
    field: 'DevOps',
    internshipStatus: 'None',
    statusLabel: 'Inactive'
  },
  {
    id: 'wi4',
    name: 'Sara Belkhayat',
    classLevel: 'Master 1',
    field: 'Web Development',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: 'wi5',
    name: 'Hamza Ouali',
    classLevel: 'Master 1',
    field: 'Software Engineering',
    internshipStatus: 'None',
    statusLabel: 'Inactive'
  },
  {
    id: 'wi6',
    name: 'Manal Cherkaoui',
    classLevel: 'Master 1',
    field: 'Data Engineering',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: 'wi7',
    name: 'Younes Amrani',
    classLevel: 'Master 1',
    field: 'DevOps',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: 'wi8',
    name: 'Ikram Bouhlal',
    classLevel: 'Master 1',
    field: 'Web Development',
    internshipStatus: 'None',
    statusLabel: 'Inactive'
  },
  {
    id: 'wi9',
    name: 'Rania Taibi',
    classLevel: 'Master 1',
    field: 'Software Engineering',
    internshipStatus: 'None',
    statusLabel: 'Active'
  },
  {
    id: 'wi10',
    name: 'Walid Messaoudi',
    classLevel: 'Master 1',
    field: 'Data Engineering',
    internshipStatus: 'None',
    statusLabel: 'Inactive'
  }
];
