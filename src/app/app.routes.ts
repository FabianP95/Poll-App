import { Routes } from '@angular/router';
import { StartComponent } from './sections/start/start'
import { CreateSurveyForm } from './sections/create-survey/create-survey-form/create-survey-form';

export const routes: Routes = [
    { path: '', component: StartComponent },
    { path: 'create-survey', component: CreateSurveyForm }
];
