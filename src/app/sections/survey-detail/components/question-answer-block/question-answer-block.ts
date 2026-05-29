import { Component, input, signal } from '@angular/core';
import { Answer, Question } from '../../../../core/interfaces/survey.interfaces';

@Component({
  selector: 'app-question-answer-block',
  imports: [],
  templateUrl: './question-answer-block.html',
  styleUrl: './question-answer-block.scss',
})
export class QuestionAnswerBlock {
  singleQ = input<(Question & { answers: Answer[] }) | null>(null);
}
