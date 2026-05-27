import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppHeader } from '../../shared/components/app-header/app-header';
import { Supabase } from '../../supabase';
import { Survey } from '../../core/interfaces/survey.interfaces';
import { formatDate } from '../../core/utils/survey.utils';

@Component({
  selector: 'app-survey-detail',
  imports: [AppHeader, RouterLink],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetailComponent {
  route = inject(ActivatedRoute);
  dbService = inject(Supabase);

  survey = signal<Survey | null>(null);
  loading = signal(true);

  constructor() {
    this.loadSurvey();
  }

  /**
   * Reads the id from the route and loads one survey from Supabase.
   * We set loading flags so the template can show loading / not-found states.
   */
  async loadSurvey(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    const data = await this.dbService.getSurveyById(id);
    this.survey.set(data);
    this.loading.set(false);
  }

  /**
   * Converts the survey end date into the same German date format
   * used in the rest of the project.
   */
  formattedEndDate(): string {
    const current = this.survey();
    if (!current) return '';
    return formatDate(current.end_date);
  }
}
