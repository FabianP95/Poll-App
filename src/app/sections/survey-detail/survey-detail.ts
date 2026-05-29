import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppHeader } from '../../shared/components/app-header/app-header';
import { Supabase } from '../../supabase';
import { Answer, Question, Survey } from '../../core/interfaces/survey.interfaces';
import { formatDate } from '../../core/utils/survey.utils';
import { QuestionAnswerBlock } from './components/question-answer-block/question-answer-block';
import { QuestionResults } from "./components/question-results/question-results";

@Component({
  selector: 'app-survey-detail',
  imports: [AppHeader, QuestionResults, QuestionAnswerBlock],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetailComponent {
  route = inject(ActivatedRoute);
  dbService = inject(Supabase);

  survey = signal<Survey | null>(null);
  questions = signal<(Question & { answers: Answer[] })[] | null>(null);

  loading = signal(true);
  loadedQuestions = signal(true);
  loadedAnswers = signal(true);

  constructor() {
    this.loadSurvey();
  }

  
  async loadSurvey(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    const data = await this.dbService.getSurveyById(id);
    if (data) await this.loadQuestions(data.id);
    this.survey.set(data);
    this.loading.set(false);
  }


  async loadQuestions(id: number): Promise<void> {
    const data = await this.dbService.getQuestionsBySurveyId(id);
    if (!id) {
      this.loadedQuestions.set(false);
      return;
    }
    this.questions.set(data?.map(q => ({ ...q, answers: [] })) ?? null);
    if (data) await Promise.all(data.map(question => this.loadAnswers(question.id)));
    this.loadedQuestions.set(false);
  }


  async loadAnswers(id: string): Promise<void> {
    const data = await this.dbService.getAnswersByQuestionId(id);
    if (!id) {
      this.loadedAnswers.set(false);
      return;
    }

    this.questions.update(qs =>
      qs?.map(q => q.id === id ? { ...q, answers: data ?? [] } : q) ?? null
    );
    this.loadedAnswers.set(false);
  }

  
  formattedEndDate(): string {
    const current = this.survey();
    if (!current) return '';
    return formatDate(current.end_date);
  }
}
