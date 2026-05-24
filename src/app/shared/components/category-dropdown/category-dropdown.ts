import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-dropdown',
  imports: [FormsModule],
  templateUrl: './category-dropdown.html',
  styleUrl: './category-dropdown.scss',
})
export class CategoryDropdownComponent {
  label = input('');
  options = input<string[]>([
    'Team activities',
    'Health & Wellness',
    'Gaming',
    'Workplace culture',
  ]);
  value = model('');

  isOpen = false;
}
