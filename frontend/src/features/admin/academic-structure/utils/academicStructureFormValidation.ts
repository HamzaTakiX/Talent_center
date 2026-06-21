import type { AcademicStructureTab } from '../types/academicStructureTypes';

import type { AcademicStructureFormValues } from '../types/academicStructureFormTypes';



export type FormValidationErrors = Partial<

  Record<keyof AcademicStructureFormValues | 'duplicate', string>

>;



interface ValidationContext {

  tab: AcademicStructureTab;

  values: AcademicStructureFormValues;

  editId?: number;

  existingRows: Array<{

    id: number;

    code?: string;

    name?: string;

    name_fr?: string;

    name_en?: string;

    filiere_id?: number;

    academic_level_id?: number;

  }>;

}



function normalizeCode(code: string): string {

  return code.trim().toUpperCase();

}



function normalizeName(name: string): string {

  return name.trim().toLowerCase();

}



function rowDisplayNames(row: ValidationContext['existingRows'][number]): string[] {

  return [row.name_fr, row.name_en, row.name]

    .map((value) => normalizeName(value ?? ''))

    .filter(Boolean);

}



export function validateAcademicStructureForm(ctx: ValidationContext): FormValidationErrors {

  const { tab, values, editId, existingRows } = ctx;

  const errors: FormValidationErrors = {};

  const nameFr = values.name_fr.trim();

  const nameEn = values.name_en.trim();

  const code = values.code.trim();



  if (!nameFr && !nameEn) {

    errors.name_fr = 'required';

    errors.name_en = 'required';

  } else {

    const submittedNames = [nameFr, nameEn].map(normalizeName).filter(Boolean);

    const duplicateName = existingRows.some((row) => {

      if (row.id === editId) return false;

      const existing = rowDisplayNames(row);

      return submittedNames.some((candidate) => existing.includes(candidate));

    });

    if (duplicateName) {

      errors.name_fr = 'duplicateName';

      errors.name_en = 'duplicateName';

    }

  }



  if (tab === 'tracks' || tab === 'levels' || tab === 'work-modes') {

    if (!code) {

      errors.code = 'required';

    } else if (

      existingRows.some(

        (row) => row.id !== editId && normalizeCode(row.code ?? '') === normalizeCode(code),

      )

    ) {

      errors.code = 'duplicateCode';

    }

  }



  if (tab === 'levels' || tab === 'classes' || tab === 'internship-framework') {

    if (!values.filiere_id) errors.filiere_id = 'required';

  }



  if (tab === 'classes' || tab === 'internship-framework') {

    if (!values.academic_level_id) errors.academic_level_id = 'required';

  }



  if (tab === 'internship-framework') {

    if (values.duration_value < 1) {

      errors.duration_value = 'invalidDuration';

    }



    const duplicate = existingRows.some((row) => {

      if (row.id === editId) return false;

      const existing = rowDisplayNames(row);

      const submitted = [nameFr, nameEn].map(normalizeName).filter(Boolean);

      return (

        row.filiere_id === values.filiere_id &&

        row.academic_level_id === values.academic_level_id &&

        submitted.some((candidate) => existing.includes(candidate))

      );

    });

    if (duplicate) errors.duplicate = 'duplicateFramework';

  }



  if (tab !== 'classes' && values.sort_order < 0) {

    errors.sort_order = 'invalidOrder';

  }



  return errors;

}



export function hasValidationErrors(errors: FormValidationErrors): boolean {

  return Object.keys(errors).length > 0;

}

