import { Component, input, output } from '@angular/core';
import { Question } from '../../../../core/interfaces/survey.interfaces';

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

  private emit(updated: Question): void {
    this.questionChange.emit(updated);
  }

  updateQuestionText(text: string): void {
    this.emit({ ...this.question(), text });
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
        { id: `new-${Date.now()}`, letter: nextLetter, text: '', votes: 0 },
      ],
    });
  }

  removeAnswer(index: number): void {
    const q = this.question();
    if (q.answers.length <= 2) return;
    this.emit({
      ...q,
      answers: q.answers.filter((_, i) => i !== index),
    });
  }

  toggleMultiple(checked: boolean): void {
    this.emit({ ...this.question(), allowMultiple: checked });
  }
}
