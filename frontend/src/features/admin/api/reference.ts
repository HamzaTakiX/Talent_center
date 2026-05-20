import apiClient from '../../../shared/api/client';
import type {
  AcademicLevelOption,
  AcademicSectorOption,
  AcademicYearOption,
  ApiEnvelope,
  ClassGroupOption,
  FiliereOption,
  InternshipTypeOption,
  SpecializationDomainOption,
} from './types';

const filiereIdsParam = (ids?: number[]) =>
  ids?.length ? { filiere_ids: ids.join(',') } : {};

const levelIdsParam = (ids?: number[]) =>
  ids?.length ? { level_ids: ids.join(',') } : {};

const withLang = (lang?: string) => (lang ? { lang } : {});

function buildQuery(entries: Record<string, string | undefined>): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== '') {
      query[key] = value;
    }
  }
  return query;
}

export const academicReferenceApi = {
  listFilieres: async (params?: {
    program_family?: string;
    lang?: string;
    /** When true, only official ESCA catalog filières (PGE, LME, IBA, Masters). */
    student_catalog?: boolean;
  }): Promise<FiliereOption[]> => {
    const response = await apiClient.get<ApiEnvelope<FiliereOption[]>>('/admin/filieres', {
      params: {
        ...withLang(params?.lang),
        program_family: params?.program_family,
        student_catalog: params?.student_catalog ? 'true' : undefined,
      },
    });
    return response.data.data;
  },

  listAcademicYears: async (params?: { structured?: boolean; lang?: string }): Promise<string[] | AcademicYearOption[]> => {
    const response = await apiClient.get<ApiEnvelope<string[] | AcademicYearOption[]>>('/admin/academic-years', {
      params: { structured: params?.structured ? 'true' : undefined, ...withLang(params?.lang) },
    });
    return response.data.data;
  },

  listAcademicLevels: async (params: {
    filiere_ids: number[];
    lang?: string;
    legacy?: boolean;
    academic_year?: string;
    class_group_ids?: number[];
  }): Promise<AcademicLevelOption[] | string[]> => {
    const query = buildQuery({
      ...filiereIdsParam(params.filiere_ids),
      ...withLang(params.lang),
      legacy: params.legacy ? 'true' : undefined,
      academic_year: params.academic_year,
      class_group_ids: params.class_group_ids?.length
        ? params.class_group_ids.join(',')
        : undefined,
    });
    const response = await apiClient.get<ApiEnvelope<AcademicLevelOption[] | string[]>>(
      '/admin/academic-levels',
      { params: query },
    );
    return response.data.data;
  },

  listAcademicSectors: async (params: { level_ids: number[]; lang?: string }): Promise<AcademicSectorOption[]> => {
    const response = await apiClient.get<ApiEnvelope<AcademicSectorOption[]>>('/admin/academic-sectors', {
      params: { ...levelIdsParam(params.level_ids), ...withLang(params.lang) },
    });
    return response.data.data;
  },

  listInternshipTypes: async (params: {
    level_ids: number[];
    sector_id?: number;
    lang?: string;
  }): Promise<InternshipTypeOption[]> => {
    const query = buildQuery({
      ...levelIdsParam(params.level_ids),
      ...withLang(params.lang),
      sector_id: params.sector_id != null ? String(params.sector_id) : undefined,
    });
    const response = await apiClient.get<ApiEnvelope<InternshipTypeOption[]>>('/admin/internship-types', {
      params: query,
    });
    return response.data.data;
  },

  listAllInternshipTypes: async (params?: { lang?: string }): Promise<InternshipTypeOption[]> => {
    const response = await apiClient.get<ApiEnvelope<InternshipTypeOption[]>>('/admin/internship-types', {
      params: { all: 'true', ...withLang(params?.lang) },
    });
    return response.data.data;
  },

  listClassGroups: async (params?: {
    filiere_id?: number;
    filiere_ids?: number[];
    academic_year?: string;
    level_ids?: number[];
    sector_id?: number;
    lang?: string;
  }): Promise<ClassGroupOption[]> => {
    const query = buildQuery({
      ...withLang(params?.lang),
      filiere_ids: params?.filiere_ids?.length ? params.filiere_ids.join(',') : undefined,
      filiere_id:
        !params?.filiere_ids?.length && params?.filiere_id
          ? String(params.filiere_id)
          : undefined,
      academic_year: params?.academic_year,
      level_ids: params?.level_ids?.length ? params.level_ids.join(',') : undefined,
      sector_id: params?.sector_id != null ? String(params.sector_id) : undefined,
    });
    const response = await apiClient.get<ApiEnvelope<ClassGroupOption[]>>('/admin/class-groups', {
      params: query,
    });
    return response.data.data;
  },

  /** @deprecated Use listAcademicYears with structured for legacy string[] by filiere */
  listSpecializationDomains: async (params?: {
    filiere_ids?: number[];
    program_families?: string[];
    category?: string;
    include_tech?: boolean;
    search?: string;
    lang?: string;
  }): Promise<SpecializationDomainOption[]> => {
    const query = buildQuery({
      ...withLang(params?.lang),
      filiere_ids: params?.filiere_ids?.length ? params.filiere_ids.join(',') : undefined,
      program_families: params?.program_families?.length
        ? params.program_families.join(',')
        : undefined,
      category: params?.category,
      include_tech: params?.include_tech ? 'true' : undefined,
      search: params?.search,
    });
    const response = await apiClient.get<ApiEnvelope<SpecializationDomainOption[]>>(
      '/admin/specialization-domains',
      { params: query },
    );
    return response.data.data;
  },

  listAcademicYearsByFiliere: async (filiereIds?: number[]): Promise<string[]> => {
    const response = await apiClient.get<ApiEnvelope<string[]>>('/admin/academic-years', {
      params: filiereIdsParam(filiereIds),
    });
    return response.data.data;
  },

  /** @deprecated Use listAcademicLevels with legacy:true for string codes */
  listAcademicLevelCodes: async (params?: {
    filiere_ids?: number[];
    academic_year?: string;
    class_group_ids?: number[];
  }): Promise<string[]> => {
    const data = await academicReferenceApi.listAcademicLevels({
      filiere_ids: params?.filiere_ids ?? [],
      legacy: true,
      academic_year: params?.academic_year,
      class_group_ids: params?.class_group_ids,
    });
    return data as string[];
  },
};
