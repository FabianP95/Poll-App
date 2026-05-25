import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './supabase';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  dbService = inject(Supabase)

}
