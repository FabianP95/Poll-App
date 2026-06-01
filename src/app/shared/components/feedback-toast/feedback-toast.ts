import { Component, inject } from '@angular/core';
import { FeedbackToastService } from '../../services/feedback-toast.service';


@Component({
  selector: 'app-feedback-toast',
  templateUrl: './feedback-toast.html',
  styleUrl: './feedback-toast.scss',
})
export class FeedbackToastComponent {
 
  toast = inject(FeedbackToastService);

  /**
   * Closes the toast notification.
   */
  close(): void {
    this.toast.hide();
  }
}
