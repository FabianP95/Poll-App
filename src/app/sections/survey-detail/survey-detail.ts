import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppHeader } from '../../shared/components/app-header/app-header';
import { Supabase } from '../../supabase';
import { Answer, Question, Survey } from '../../core/interfaces/survey.interfaces';
import { formatDate } from '../../core/utils/survey.utils';
import { QuestionAnswerBlock } from './components/question-answer-block/question-answer-block';
import { QuestionResults } from "./components/question-results/question-results";
import { FeedbackToastService } from '../../shared/services/feedback-toast.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CategoryDropdownComponent } from "../../shared/components/category-dropdown/category-dropdown";

@Component({
  selector: 'app-survey-detail',
  imports: [AppHeader, QuestionResults, QuestionAnswerBlock, CategoryDropdownComponent],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetailComponent {
  showFilters = true;
  route = inject(ActivatedRoute);
  dbService = inject(Supabase);
  feedbackToast = inject(FeedbackToastService);
  survey = signal<Survey | null>(null);
  questions = signal<(Question & { answers: Answer[] })[] | null>(null);
  channelVotes: RealtimeChannel;
  loading = signal(true);
  loadedQuestions = signal(true);
  loadedAnswers = signal(true);
  surveySubmitted = signal(false);

  votes = signal(null);
  selectedVotes = signal<{ questionId: string; answerIds: string[] }[]>([]);

  showError = signal(false);

  resetCounter = signal(0);

  showToggleDropdown = window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize() {
    this.showToggleDropdown = window.innerWidth <= 768;
  }

  constructor() {
    this.channelVotes = this.dbService.supabase.channel('surveys-live-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        (payload) => {
          const answerId = payload.new['answer_id'];

          this.questions.update(qs =>
            qs?.map(q => ({
              ...q,
              answers: q.answers.map(a =>
                a.id === answerId
                  ? { ...a, votes: (a.votes as number) + 1 }
                  : a
              )
            })) ?? null
          );
        }
      )
      .subscribe()
  }

  ngOnInit() {
    this.loadSurvey();
  }


  /**
   * Loads the survey data from the route parameter.
   */
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


  /**
   * Loads all questions for a survey.
   * @param id The survey ID
   */
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


  /**
   * Loads all answers for a question.
   * @param id The question ID
   */
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

  /**
   * Fetches vote counts for all answers.
   * @param data Array of answers
   * @returns Promise that resolves to answers with vote counts
   */
  async getVotesByAnswer(data: Answer[]): Promise<Answer[]> {
    return await Promise.all(
      data.map(async answer => ({
        ...answer,
        votes: await this.dbService.getVotesByAnswerId(answer.id) ?? 0
      }))
    );
  }

  /**
   * Updates selected answers when user makes a selection.
   * @param questionId The question ID
   * @param answerIds Array of selected answer IDs
   */
  onAnswersChange(questionId: string, answerIds: string[]): void {
    this.selectedVotes.update(votes => {
      const existing = votes.find(v => v.questionId === questionId);
      if (existing) {
        return votes.map(v => v.questionId === questionId ? { ...v, answerIds } : v);
      }
      return [...votes, { questionId, answerIds }];
    });
  }

  /**
   * Checks if all questions in the survey have been answered.
   * @returns True if all questions are answered
   */
  allQuestionsAnswered(): boolean {
    const questionIds = this.questions()?.map(q => q.id) ?? [];
    return questionIds.every(id =>
      this.selectedVotes().some(v => v.questionId === id && v.answerIds.length > 0)
    );
  }

  /**
   * Submits the survey responses to the database.
   */
  submitSurvey(): void {
    if (!this.allQuestionsAnswered()) {
      this.showError.set(true);
      setTimeout(() => this.showError.set(false), 3000);
      return;
    }
    this.feedbackToast.showSuccess('Thank you for participating. Go back by clicking the icon in the top left.');
    this.showError.set(false);
    this.dbService.setVotes(this.survey()!.id, this.selectedVotes());
    this.selectedVotes.set([]);
    this.surveySubmitted.set(true);
    this.resetCounter.update(c => c + 1);
  }

  /**
  * formats the enddate of the survey
  * @returns formatted enddate
  */
  formattedEndDate(): string {
    const current = this.survey();
    if (!current) return '';
    return formatDate(current.end_date);
  }


  /**
  * checks the selected answer/answers per question
  * @returns an array of answer ids
  */
  getSelectedForQuestion(questionId: string): string[] {
    return this.selectedVotes().find(v => v.questionId === questionId)?.answerIds ?? [];
  }

  /**
  * removes the channel listening for changes on destroy
  */
  ngOnDestroy() {
    this.dbService.supabase.removeChannel(this.channelVotes)
  }
}
