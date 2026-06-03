import { Component, HostBinding, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-dropdown',
  imports: [FormsModule],
  templateUrl: './category-dropdown.html',
  styleUrl: './category-dropdown.scss',
})
export class CategoryDropdownComponent {
  label = input('');
  toggleLabel = signal('');
  mode = input<'select' | 'toggle'>('select');
  options = input<string[]>([
    'Show all',
    'Team Activities',
    'Health & Wellness',
    'Gaming & Entertainment',
    'Education & Learning',
    'Lifestyle & Preferences',
    'Technology & Innovation',
  ]);
  value = model('');
  onToggle = output<boolean>();
  isOpen = false;

  @HostBinding('class')
  get hostClass() {
    return `category-dropdown--${this.mode()}`;
  }

  /**
   * Toggles the dropdown menu open/closed.
   */
  toggle() {
    this.isOpen = !this.isOpen;
    if (this.mode() === 'toggle') {
      this.onToggle.emit(this.isOpen);
      this.toggleLabel.set(this.isOpen ? 'Close results' : this.label());
    }
  }
}
