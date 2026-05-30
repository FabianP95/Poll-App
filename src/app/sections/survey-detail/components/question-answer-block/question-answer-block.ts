import { Component, effect, input, output, signal } from '@angular/core';
import { Answer, Question } from '../../../../core/interfaces/survey.interfaces';

@Component({
  selector: 'app-question-answer-block',
  imports: [],
  templateUrl: './question-answer-block.html',
  styleUrl: './question-answer-block.scss',
})
export class QuestionAnswerBlock {
  questionsArray = input<(Question & { answers: Answer[] }) | null>(null);
  selectedAnswers = signal<string[]>([]);
  answersChange = output<string[]>();
  resetSignal = input<number>(0);
  
  constructor() {
    effect(() => {
      this.resetSignal();
      this.selectedAnswers.set([]);
    });
  }
  toggleAnswer(answerId: string): void {
    const allowMultiple = this.questionsArray()?.allow_multiple_answers;

    if (allowMultiple) {
      this.selectedAnswers.update(selected =>
        selected.includes(answerId)
          ? selected.filter(id => id !== answerId)
          : [...selected, answerId]
      );
    } else {
      this.selectedAnswers.set(
        this.selectedAnswers()[0] === answerId ? [] : [answerId]
      );
    }
    this.answersChange.emit(this.selectedAnswers());
  }

  isSelected(answerId: string): boolean {
    return this.selectedAnswers().includes(answerId);
  }
}
