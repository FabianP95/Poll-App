import { Component, input, signal } from '@angular/core';
import { Answer, Question } from '../../../../core/interfaces/survey.interfaces';

@Component({
  selector: 'app-question-results',
  imports: [],
  templateUrl: './question-results.html',
  styleUrl: './question-results.scss',
})
export class QuestionResults {
  questionsArray = input<(Question & { answers: Answer[] }) | null>(null);

  votesCounted = signal(null)

  constructor() {

  }

 
}
