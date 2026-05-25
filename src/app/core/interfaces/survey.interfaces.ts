export type SurveyStatus = 'published' | 'ended';

export interface Survey {
  id: number;
  title: string;
  description: string;
  category: string;
  end_date: Date | null;
}

export interface Question {
  id: string;
  survey_id: number;
  text: string;
  allow_multiple_answers: boolean;
  order:number;
  answers: Answer[];
}

export interface Answer {
  question_id: string,
  text: string;
  letter: string; 
  votes: number // check if necessary
}

export interface VoteResult {
  label: string;
  percentage: number; // necessary?
}

export interface QuestionValidationResult {
  isValid: boolean;
  question: Question;
}