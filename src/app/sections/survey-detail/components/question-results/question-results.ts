import { Component, computed, input, signal } from '@angular/core';
import { Answer, Question } from '../../../../core/interfaces/survey.interfaces';
import { DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-question-results',
  imports: [DecimalPipe],
  templateUrl: './question-results.html',
  styleUrl: './question-results.scss',
})
export class QuestionResults {
  questionsArray = input<(Question & { answers: Answer[] }) | null>(null);

  selectedAnswerIds = input<string[]>([]);

  votesCounted = signal(null)


  totalVotes = computed(() => {
    const selected = this.selectedAnswerIds();
    return this.questionsArray()?.answers.reduce((sum, a) => {
      const bonus = selected.includes(a.id) ? 1 : 0;
      return sum + (a.votes as number) + bonus;
    }, 0) ?? 0;
  });

  previewVotes = (answer: Answer): number => {
    const bonus = this.selectedAnswerIds().includes(answer.id) ? 1 : 0;
    return (answer.votes as number) + bonus;
  };

}
