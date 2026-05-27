import { Component, computed, input, signal} from '@angular/core';
import { Survey } from '../../../../core/interfaces/survey.interfaces';
import { isSurveyActive } from '../../../../core/utils/survey.utils';
import { SurveyCardComponent } from '../../../../shared/components/survey-card/survey-card';
import { CategoryDropdownComponent } from "../../../../shared/components/category-dropdown/category-dropdown";


@Component({
  selector: 'app-survey-list',
  imports: [SurveyCardComponent, CategoryDropdownComponent],
  templateUrl: './survey-list.html',
  styleUrl: './survey-list.scss',
})
export class SurveyList {
  surveys = input<Survey[]>([]);
  activeTab = signal<'active' | 'past'>('active');

  /**
   * Builds the list that should be shown in the UI.
   * - "active" tab: only running surveys
   * - "past" tab: only finished surveys
   */
  filteredSurveys = computed(() => {
    if (this.activeTab() === 'active') {
      return this.surveys().filter((survey) => isSurveyActive(survey));
    }
    return this.surveys().filter((survey) => !isSurveyActive(survey));
  });

  /**
   * Switches between active and past survey tabs.
   * The computed list above automatically recalculates after this.
   */
  setTab(tab: 'active' | 'past'): void {
    this.activeTab.set(tab);
  }
}
