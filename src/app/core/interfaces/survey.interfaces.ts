export type SurveyStatus = 'published' | 'ended';

export interface Survey {
  id: number;
  title: string;
  description: string;
  category: string;
  endDate: Date | null;
  status: SurveyStatus;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  allowMultiple: boolean;
  answers: Answer[];
}

export interface Answer {
  id: string;
  label: string;
  text: string;
  order: number;
}

export interface VoteResult {
  label: string;
  percentage: number; // necessary?
}