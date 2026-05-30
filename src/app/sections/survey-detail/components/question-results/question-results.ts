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

  votesCounted = signal(null)

  totalVotes = computed(() =>
    this.questionsArray()?.answers.reduce((sum, a) => sum + a.votes, 0) ?? 0
  );
  constructor() {

  }


}
