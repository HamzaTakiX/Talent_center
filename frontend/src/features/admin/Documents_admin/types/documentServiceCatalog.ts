/** Dynamic administrative document service — full catalog configuration. */

export type DocumentServiceCategory =
  | 'ATTESTATION'
  | 'CONVENTION'
  | 'CERTIFICATE'
  | 'AUTHORIZATION'
  | 'REPORT'
  | 'OTHER';

export interface ServiceAttachmentRule {
  code: string;
  labelKey: string;
  required: boolean;
}

export interface ServiceDynamicField {
  name: string;
  labelKey: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'file';
  required?: boolean;
  options?: { value: string; labelKey: string }[];
}

export interface ServiceWorkflowStep {
  code: string;
  labelKey: string;
  enabled: boolean;
}

export interface DocumentServiceConfig {
  availability: {
    isActive: boolean;
    visibleToStudents: boolean;
    onlineRequestEnabled: boolean;
    physicalOnly: boolean;
    autoGenerateEnabled: boolean;
  };
  eligibility: {
    programIds: string[];
    filiereIds: string[];
    levelIds: string[];
    classGroupIds: string[];
    academicYears: string[];
    internshipStudentsOnly: boolean;
    finalYearOnly: boolean;
  };
  processing: {
    estimatedHours: number;
    slaHours: number;
    urgencyRules: string;
    autoEscalation: boolean;
    escalationHours: number;
  };
  delivery: {
    online: {
      enabled: boolean;
      downloadablePdf: boolean;
      emailDelivery: boolean;
      portalDelivery: boolean;
    };
    physical: {
      enabled: boolean;
      pickupRequired: boolean;
      reservationRequired: boolean;
      signatureRequired: boolean;
      appointmentMandatory: boolean;
    };
  };
  pickup: {
    reservationMandatory: boolean;
    pickupOffice: string;
    responsibleService: string;
    maxReservationsPerDay: number;
    openingHours: string;
    delayBeforePickupHours: number;
    availableSlotCodes: string[];
  };
  requiredAttachments: ServiceAttachmentRule[];
  dynamicFields: ServiceDynamicField[];
  template?: {
    fileName?: string;
    fileType?: 'docx' | 'pdf';
    fileSize?: number;
    fileUrl?: string;
    templateId?: string;
    validated?: boolean;
    placeholdersFound?: string[];
  };
  validation: {
    automatic: boolean;
    manual: boolean;
    multiStep: boolean;
    serviceApprovalRequired: boolean;
    srfClearanceRequired: boolean;
    internshipRequired: boolean;
    activeStudentRequired: boolean;
    registrationCompleteRequired: boolean;
  };
  workflow: {
    steps: ServiceWorkflowStep[];
  };
  automation: {
    reminders: boolean;
    autoClose: boolean;
    escalation: boolean;
    notifications: boolean;
    expirationDays: number | null;
  };
}

export interface DocumentServiceCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: DocumentServiceCategory;
  iconKey: string;
  colorTheme: string;
  isActive: boolean;
  config: DocumentServiceConfig;
  slaHours: number;
  estimatedHours: number;
  onlineEnabled: boolean;
  physicalEnabled: boolean;
  reservationRequired: boolean;
  visibleToStudents: boolean;
  autoGenerate: boolean;
  requiresWorkflow: boolean;
  /** Present on student catalog API responses only. */
  studentRequest?: StudentDocumentRequestSummary;
}

export interface StudentDocumentRequestSummary {
  hasRequest: boolean;
  canRequestNew: boolean;
  isPending: boolean;
  hasGeneratedOutput?: boolean;
  canGenerate?: boolean;
  mode?: 'auto_generate' | 'manual_request';
  status?: string;
  reference?: string;
  requestId?: string;
  submittedAt?: string;
  generatedOutput?: {
    fileName: string;
    fileUrl?: string | null;
    generatedAt?: string;
  };
}

export interface StudentDocumentGenerateResponse {
  reference: string;
  requestId: string;
  status: string;
  output: {
    id: string;
    fileName: string;
    fileUrl?: string | null;
    format: string;
    generatedAt: string;
  };
}

export interface DocumentServiceWritePayload {
  code: string;
  name: string;
  description?: string;
  category: DocumentServiceCategory;
  iconKey?: string;
  colorTheme?: string;
  config: DocumentServiceConfig;
}

export type ServiceCatalogFormTab =
  | 'information'
  | 'visibility'
  | 'requestMode'
  | 'processing'
  | 'delivery'
  | 'pickup'
  | 'attachments'
  | 'validation'
  | 'workflowAutomation';
