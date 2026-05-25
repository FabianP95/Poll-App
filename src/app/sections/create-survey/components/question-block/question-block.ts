import { Component, input, output, computed } from '@angular/core';
import { Question } from '../../../../core/interfaces/survey.interfaces';
import { QuestionValidationResult } from '../../../../core/interfaces/survey.interfaces';

@Component({
  selector: 'app-question-block',
  imports: [],
  templateUrl: './question-block.html',
  styleUrl: './question-block.scss',
})
export class QuestionBlock {
  questionNumber = input(1);
  question = input.required<Question>();
  questionChange = output<Question>();
  deleteQuestion = output<void>();
  validationChange = output<QuestionValidationResult>();

  private emit(updated: Question): void {
    this.questionChange.emit(updated);
    this.validationChange.emit({
      isValid: this.isValid(),
      question: updated
    });
  }

  isValid = computed(() => this.checkQuestionValidity() && this.checkAnswerValidity());

  checkAnswerValidity() {


    return this.question().answers.every(a => a.text.trim().length >= 0);
  }

  checkQuestionValidity() {
    console.log(1);
    return this.question().text.trim().length >= 4 && this.question().text.trim().endsWith('?');
  }

  updateQuestionText(text: string): void {
    this.emit({ ...this.question(), text });
  }

  onDeleteQuestion(): void {
    if (this.questionNumber() == 1) {
      this.question().text = "";
    } else {
      this.deleteQuestion.emit();
    }
  }

  updateAnswerText(index: number, text: string): void {
    const q = this.question();
    this.emit({
      ...q,
      answers: q.answers.map((a, i) => (i === index ? { ...a, text } : a)),
    });
  }

  addAnswer(): void {
    if (this.question().answers.length >= 6) return;
    const q = this.question();
    const nextLetter = String.fromCharCode(65 + q.answers.length);
    this.emit({
      ...q,
      answers: [
        ...q.answers,
        { question_id: '', letter: nextLetter, text: '', votes: 0 },
      ],
    });
  }

  removeAnswer(index: number): void {
    const q = this.question();
    if (q.answers.length <= 2) return;
    this.emit({
      ...q,
      answers: q.answers
        .filter((_, i) => i !== index)
        .map((a, i) => ({ ...a, letter: String.fromCharCode(65 + i) })),
    });

  }

  toggleMultiple(checked: boolean): void {
    this.emit({ ...this.question(), allow_multiple_answers: checked });
  }
}
