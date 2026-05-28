import { Component, Host, HostBinding, inject, input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-app-header',
  imports: [],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  variant = input<'dark' | 'light'>('dark');
  showButton = input(false);
  router = inject(Router)

  @HostBinding('class')
  get hostClass(): string {
    return `app-header--${this.variant()}`;
  }

  directToCreate(){
    this.router.navigate(['create-survey'])
  }
}
