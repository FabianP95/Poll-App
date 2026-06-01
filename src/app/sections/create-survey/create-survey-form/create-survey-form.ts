import { Component, inject, signal, output, viewChildren } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionBlock } from '../components/question-block/question-block';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { CategoryDropdownComponent } from '../../../shared/components/category-dropdown/category-dropdown';
import { Question } from '../../../core/interfaces/survey.interfaces';
import { Answer } from '../../../core/interfaces/survey.interfaces';
import { Supabase } from '../../../supabase';
import { FeedbackToastService } from '../../../shared/services/feedback-toast.service';
import { AppHeader } from "../../../shared/components/app-header/app-header";



function createEmptyQuestion(index: number): Question {
  return {
    id: `q-${index}`,
    order: index,
    survey_id: 0,
    text: '',
    allow_multiple_answers: false,
    answers: [
      { id: '', question_id: '', letter: 'A', text: '', votes: 0 },
      { id: '', question_id: '', letter: 'B', text: '', votes: 0 },
    ],
  };
}

@Component({
  selector: 'app-create-survey-form',
  imports: [ReactiveFormsModule, FormFieldComponent, CategoryDropdownComponent, QuestionBlock, AppHeader],
  templateUrl: './create-survey-form.html',
  styleUrl: './create-survey-form.scss',
})


export class CreateSurveyForm {
  router = inject(Router);
  feedbackToast = inject(FeedbackToastService);

  surveyName = signal('');
  description = signal('');
  endDate = signal('');
  category = signal('');
  questions = signal<Question[]>([createEmptyQuestion(1)]);
  closed = output<void>();
  questionBlocks = viewChildren(QuestionBlock);

  dbService = inject(Supabase)

  /**
   * Handles the form submission for creating a survey.
   * @param event The form submit event
   */
  async onSubmit(event: Event) {
    event.preventDefault();
    const errorMessage = this.getPublishErrorMessage();
    if (errorMessage) {
      this.feedbackToast.showError(errorMessage);
      return;
    }
    const survey_data = await this.createSurvey();
    if (!survey_data) {
      this.feedbackToast.showError('Could not save survey. Please try again.');
      return;
    }
    await this.createQuestions(survey_data.id);
    this.feedbackToast.showSuccess('Your survey is now published');
    setTimeout(() => {
      this.redirectToCreatedSurvey(survey_data.id);
    }, 3500);
  }

  /**
   * Redirects to the newly created survey.
   * @param id The ID of the created survey
   */
  redirectToCreatedSurvey(id: number) {
    this.router.navigate(['survey/' + id])
  }
  
  /**
   * Validates the survey before publishing.
   * @returns Error message if validation fails, null otherwise
   */
  getPublishErrorMessage(): string | null {
    const title = this.surveyName().trim();
    if (title.length < 4) {
      return 'Survey title invalid';
    }
    for (const block of this.questionBlocks()) {
      const questionText = block.question().text.trim();
      if (questionText.length < 4 || !questionText.endsWith('?')) {
        return 'A question must end with a question mark (?)';
      }
      const hasEmptyAnswer = block.question().answers.some(
        (answer) => answer.text.trim().length === 0,
      );
      if (hasEmptyAnswer) {
        return 'An answer option is missing';
      }
    }
    return null;
  }

  /**
   * Creates a new survey in the database.
   * @returns Promise that resolves to the created survey data
   */
  async createSurvey() {
    const survey = {
      title: this.surveyName(),
      description: this.description(),
      category: this.category(),
      end_date: this.endDate() ? new Date(this.endDate()) : null,
    };
    const surveyData = await this.dbService.setSurvey(survey);
    return surveyData;
  }
  
  /**
   * Creates all questions for a survey.
   * @param id The survey ID
   */
  async createQuestions(id: number) {
    for (const [index, block] of this.questionBlocks().entries()) {
      const question_data = await this.dbService.setQuestions({
        survey_id: id,
        text: block.question().text,
        allow_multiple_answers: block.question().allow_multiple_answers,
        order: index
      });
      if (!question_data) return;
      await this.createAnswers(question_data.id, block.question().answers)
    }
  }

  /**
   * Creates all answers for a question.
   * @param question_id The question ID
   * @param answers Array of answers to create
   */
  async createAnswers(question_id: string, answers: Answer[]) {
    for (const [index, answer] of answers.entries()) {
      await this.dbService.setAnswers({
        question_id: question_id,
        text: answer.text,
        letter: answer.letter,
      });
    }
  }

  /**
   * Cancels survey creation and returns to home.
   */
  cancelCreation(): void {
    this.router.navigate([''])
  }

  
  /**
   * Adds a new empty question to the survey.
   */
  addQuestion(): void {
    const next = this.questions().length + 1;
    this.questions.update((qs) => [...qs, createEmptyQuestion(next)]);
  }

  
  /**
   * Updates a question in the survey.
   * @param index The question index
   * @param question The updated question data
   */
  updateQuestion(index: number, question: Question): void {
    this.questions.update((qs) => qs.map((q, i) => (i === index ? question : q)));
  }

  
  /**
   * removes a question by filtering the array for all remaining questions
   */
  removeQuestion(index: number): void {
    if (this.questions().length <= 1) return;
    this.questions.update((qs) => qs.filter((_, i) => i !== index));
  }
}
