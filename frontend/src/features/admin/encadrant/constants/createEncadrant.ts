export const ENCADRANT_DEPARTMENT_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'computerScience', labelKey: 'computerScience' },
  { value: 'aiDataScience', labelKey: 'aiDataScience' },
  { value: 'softwareEngineering', labelKey: 'softwareEngineering' },
  { value: 'networksSecurity', labelKey: 'networksSecurity' },
  { value: 'businessIntelligence', labelKey: 'businessIntelligence' },
] as const;

export const ENCADRANT_ROLE_OPTIONS = [
  { value: '', labelKey: 'select' },
  { value: 'professor', labelKey: 'professor' },
  { value: 'associateProfessor', labelKey: 'associateProfessor' },
  { value: 'doctor', labelKey: 'doctor' },
  { value: 'lecturer', labelKey: 'lecturer' },
] as const;

export type EncadrantDepartmentValue = (typeof ENCADRANT_DEPARTMENT_OPTIONS)[number]['value'];
export type EncadrantRoleValue = (typeof ENCADRANT_ROLE_OPTIONS)[number]['value'];
