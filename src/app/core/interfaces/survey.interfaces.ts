export type SurveyStatus = 'published' | 'ended';

export interface Survey {
  id: number;
  title: string;
  description: string;
  category: string;
  endDate: Date | null;
}

export interface Question {
  id: string;
  text: string;
  allowMultiple: boolean;
  answers: Answer[];
}

export interface Answer {
  id: string;
  /* label: string; */
  text: string;
  /* order: number; */
  letter:string; // check if necessary
  votes:number // check if necessary
}

export interface VoteResult {
  label: string;
  percentage: number; // necessary?
}