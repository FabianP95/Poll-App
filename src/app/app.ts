import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './supabase';
import { FeedbackToastComponent } from './shared/components/feedback-toast/feedback-toast';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  dbService = inject(Supabase)

}
