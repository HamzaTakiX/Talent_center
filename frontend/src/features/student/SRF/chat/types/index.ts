export interface SrfChatMessage {
  id: string;
  direction: 'in' | 'out';
  text: string;
  time: string;
  topicTag?: string;
  separatorBefore?: string;
}

export interface SrfFinancialObligation {
  id: string;
  title: string;
  status: 'paid' | 'unpaid';
  detail: string;
}

export interface SrfFinancialSummary {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
}
