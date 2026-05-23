import { Component, HostBinding, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Survey } from '../../../core/interfaces/survey.interfaces';
/* import { formatEndLabel } from '../../../core/utils/survey.utils'; */

@Component({
  selector: 'app-survey-card',
  imports: [RouterLink],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCardComponent {
  survey = input.required<Survey>();
  variant = input<'horizontal' | 'list'>('list');
  clickable = input(true);

  @HostBinding('class')
  get hostClass(): string {
    return `survey-card survey-card--${this.variant()}`;
  }

  endLabel(): string {
    /* return formatEndLabel(this.survey().endDate); */
    return "Placeholder"
  }
}
