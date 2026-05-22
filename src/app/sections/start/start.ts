import { Component, computed, signal } from '@angular/core';
import { AppHeader } from '../../shared/components/app-header/app-header';
import { HeroSection } from "./components/hero-section/hero-section";

@Component({
    selector: 'app-home',
    imports: [AppHeader, HeroSection],
    templateUrl: './start.html',
    styleUrl: './start.scss',
})
export class StartComponent {

}