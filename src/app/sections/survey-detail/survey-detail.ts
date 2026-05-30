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

  votes = signal(null);
  selectedVotes = signal<{ questionId: string; answerIds: string[] }[]>([]);

  showError = signal(false);

  resetCounter = signal(0);

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
    if (!id || !data) {
      this.loadedAnswers.set(false);
      return;
    }
    const answersWithVotes = await this.getVotesByAnswer(data)

    this.questions.update(qs =>
      qs?.map(q => q.id === id ? { ...q, answers: answersWithVotes } : q) ?? null
    );
    this.loadedAnswers.set(false);
  }

  async getVotesByAnswer(data: Answer[]): Promise<Answer[]> {
    return await Promise.all(
      data.map(async answer => ({
        ...answer,
        votes: await this.dbService.getVotesByAnswerId(answer.id) ?? 0
      }))
    );
  }

  onAnswersChange(questionId: string, answerIds: string[]): void {
    this.selectedVotes.update(votes => {
      const existing = votes.find(v => v.questionId === questionId);
      if (existing) {
        return votes.map(v => v.questionId === questionId ? { ...v, answerIds } : v);
      }
      return [...votes, { questionId, answerIds }];
    });
    console.log(this.selectedVotes());
  }

  allQuestionsAnswered(): boolean {
    const questionIds = this.questions()?.map(q => q.id) ?? [];
    return questionIds.every(id =>
      this.selectedVotes().some(v => v.questionId === id && v.answerIds.length > 0)
    );
  }

  submitSurvey(): void {
    if (!this.allQuestionsAnswered()) {
      this.showError.set(true);
      setTimeout(() => this.showError.set(false), 3000);
      return;
    }
    this.showError.set(false);
    this.dbService.setVotes(this.survey()!.id, this.selectedVotes());
    this.selectedVotes.set([]);
    this.resetCounter.update(c => c + 1);
  }

  formattedEndDate(): string {
    const current = this.survey();
    if (!current) return '';
    return formatDate(current.end_date);
  }
}
