import { Component, input } from '@angular/core';
import { SurveyCardComponent } from '../../../../shared/components/survey-card/survey-card';
import { Survey } from '../../../../core/interfaces/survey.interfaces';

@Component({
  selector: 'app-ending-soon-row',
  imports: [SurveyCardComponent],
  templateUrl: './ending-soon-row.html',
  styleUrl: './ending-soon-row.scss',
})
export class EndingSoonRow {
  surveys = input<Survey[]>([]);
}
