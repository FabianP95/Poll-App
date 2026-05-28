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



function createEmptyQuestion(index: number): Question {
  return {
    id: `q-${index}`,
    order: index,
    survey_id: 0,
    text: '',
    allow_multiple_answers: false,
    answers: [
      { question_id: '', letter: 'A', text: '', votes: 0 },
      { question_id: '', letter: 'B', text: '', votes: 0 },
    ],
  };
}

@Component({
  selector: 'app-create-survey-form',
  imports: [ReactiveFormsModule, FormFieldComponent, CategoryDropdownComponent, QuestionBlock],
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
   * Runs when the user clicks "Publish".
   * First we validate the form, then we save to Supabase, then we show a toast.
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

  redirectToCreatedSurvey(id: number) {
    this.router.navigate(['survey/'+ id])
  }

  /**
   * Checks the form step by step and returns the first error message we find.
   * If everything is OK, it returns null (no error).
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
   * Saves the survey title, description, category and end date in Supabase.
   * Returns the new row from the database (we need the id for the questions).
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
   * Loops through every question block on the page and saves each question
   * plus its answers in Supabase.
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
   * Saves all answer options for one question.
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
   * Sends the user back to the start page without saving.
   */
  cancelCreation(): void {
    this.router.navigate([''])
  }

  /**
   * Adds another empty question block to the form.
   */
  addQuestion(): void {
    const next = this.questions().length + 1;
    this.questions.update((qs) => [...qs, createEmptyQuestion(next)]);
  }

  /**
   * Replaces one question in the questions array when the child component emits a change.
   */
  updateQuestion(index: number, question: Question): void {
    this.questions.update((qs) => qs.map((q, i) => (i === index ? question : q)));
  }

  /**
   * Removes a question from the list (but keeps at least one question).
   */
  removeQuestion(index: number): void {
    if (this.questions().length <= 1) return;
    this.questions.update((qs) => qs.filter((_, i) => i !== index));
  }

  onPublish(): void {

    // TODO: validate required fields and call SurveyService.create()
    this.closed.emit();
  }

  onCancel(): void {
    this.closed.emit();

  }



}
