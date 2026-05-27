import { Routes } from '@angular/router';
import { StartComponent } from './sections/start/start'
import { CreateSurveyForm } from './sections/create-survey/create-survey-form/create-survey-form';
import { SurveyDetailComponent } from './sections/survey-detail/survey-detail';

export const routes: Routes = [
    { path: '', component: StartComponent },
    { path: 'create-survey', component: CreateSurveyForm },
    { path: 'survey/:id', component: SurveyDetailComponent }
];
