import { Component, inject, signal, output, viewChild, viewChildren } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionBlock } from '../components/question-block/question-block';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { CategoryDropdownComponent } from '../../../shared/components/category-dropdown/category-dropdown';
import { Question } from '../../../core/interfaces/survey.interfaces';
import { Answer } from '../../../core/interfaces/survey.interfaces';
import { Supabase } from '../../../supabase';

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
  surveyName = signal('');
  description = signal('');
  endDate = signal('');
  category = signal('');
  questions = signal<Question[]>([createEmptyQuestion(1)]);
  closed = output<void>();
  questionBlocks = viewChildren(QuestionBlock);

  dbService = inject(Supabase)



  async onSubmit(event: Event) {
    event.preventDefault();
    const titleValid = this.surveyName().trim().length >= 4;
    const allQuestionsValid = this.questionBlocks().every(block => block.isValid());


    const survey_data = await this.createSurvey();

    await this.createQuestions(survey_data.id);


    console.log('magic happen');


    if (!titleValid || !allQuestionsValid) return;


  }
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

  async createAnswers(question_id: string, answers: Answer[]) {
    for (const [index, answer] of answers.entries()) {
      await this.dbService.setAnswers({
        question_id: question_id,
        text: answer.text,
        letter: answer.letter,
      });
    }

  }



  cancelCreation(): void {
    this.router.navigate([''])
  }

  addQuestion(): void {
    const next = this.questions().length + 1;
    this.questions.update((qs) => [...qs, createEmptyQuestion(next)]);
  }

  updateQuestion(index: number, question: Question): void {
    this.questions.update((qs) => qs.map((q, i) => (i === index ? question : q)));
  }

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
