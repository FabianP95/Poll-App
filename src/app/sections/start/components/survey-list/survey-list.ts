import { Component, computed, input, signal } from '@angular/core';
import { Survey } from '../../../../core/interfaces/survey.interfaces';
import { filterSurveysByCategory, isSurveyActive } from '../../../../core/utils/survey.utils';
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
  activeCategory = signal('');

 
 filteredSurveys = computed(() => {
  const byTab = this.activeTab() === 'active'
    ? this.surveys().filter((s) => isSurveyActive(s))
    : this.surveys().filter((s) => !isSurveyActive(s));

  return filterSurveysByCategory(byTab, this.activeCategory());
});


  /**
   * Changes the active tab between active and past surveys.
   * @param tab The tab to set as active
   */
  setTab(tab: 'active' | 'past'): void {
    this.activeTab.set(tab);
     this.activeCategory.set('');
  }
}
