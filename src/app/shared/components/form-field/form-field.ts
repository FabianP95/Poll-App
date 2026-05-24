import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  imports: [FormsModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormFieldComponent {
  label = input('');
  placeholder = input('');
  optional = input(false);
  showDelete = input(false);
  type = input<'input' | 'textarea'>('input');
  value = model('');

  onDelete(): void {
    this.value.set('');
  }
}
