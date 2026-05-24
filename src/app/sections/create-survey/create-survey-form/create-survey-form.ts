import { Component, inject, signal, output } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionBlock } from '../components/question-block/question-block';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field';
import { CategoryDropdownComponent } from '../../../shared/components/category-dropdown/category-dropdown';
import { Question } from '../../../core/interfaces/survey.interfaces';

function createEmptyQuestion(index: number): Question {
  return {
    id: `q-${index}`,
    text: '',
    allowMultiple: false,
    answers: [
      { id: `a-${index}-1`, letter: 'A', text: '', votes: 0 },
      { id: `a-${index}-2`, letter: 'B', text: '', votes: 0 },
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

  surveyForm = new FormGroup({

  })


  onSubmit() {
    this.router.navigate([''])
    if (this.surveyForm.valid) {
      console.log(1);
    }
  }

  cancelCreation(): void {
    this.router.navigate([''])
  }

  closed = output<void>();

  

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
