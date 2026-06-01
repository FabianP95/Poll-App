import { Component, computed, inject, signal } from '@angular/core';
import { AppHeader } from '../../shared/components/app-header/app-header';
import { HeroSection } from "./components/hero-section/hero-section";
import { EndingSoonRow } from "./components/ending-soon-row/ending-soon-row";
import { SurveyList } from './components/survey-list/survey-list';
import { Supabase } from '../../supabase';
import { Survey } from '../../core/interfaces/survey.interfaces';
import { getEndingSoonSurveys } from '../../core/utils/survey.utils';

@Component({
    selector: 'app-home',
    imports: [AppHeader, HeroSection, EndingSoonRow, SurveyList],
    templateUrl: './start.html',
    styleUrl: './start.scss',
})
export class StartComponent {
    dbService = inject(Supabase);

    surveys = signal<Survey[]>([]);

    endingSoonSurveys = computed(() => getEndingSoonSurveys(this.surveys(), 3));

    constructor() {
        this.loadSurveys();
        this.dbService.subscribeSurveyChanges(() => this.loadSurveys());
    }

    /**
     * Loads all surveys from the database.
     */
    async loadSurveys(): Promise<void> {
        const data = await this.dbService.getSurveyData();
        this.surveys.set(data);
    }

    /**
     * stops channel subscription
     */
    ngOnDestroy(): void {
        this.dbService.stopSurveySubscription();
    }

}