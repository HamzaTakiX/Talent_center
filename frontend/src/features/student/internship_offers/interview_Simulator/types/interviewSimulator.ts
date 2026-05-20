export type InterviewSimulatorActionVariant = 'upload' | 'offer' | 'company';

export interface InterviewSimulatorAction {
  id: string;
  label: string;
  variant: InterviewSimulatorActionVariant;
}
