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
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ]);
  value = model('');

  isOpen = false;
}
