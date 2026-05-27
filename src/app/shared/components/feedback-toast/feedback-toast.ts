import { Component, inject } from '@angular/core';
import { FeedbackToastService } from '../../services/feedback-toast.service';

/**
 * Toast overlay component. Put <app-feedback-toast /> once in app.html.
 * You do not pass inputs here – use FeedbackToastService from other components.
 */
@Component({
  selector: 'app-feedback-toast',
  templateUrl: './feedback-toast.html',
  styleUrl: './feedback-toast.scss',
})
export class FeedbackToastComponent {
  /** Same service instance as in create-survey-form (providedIn: 'root'). */
  toast = inject(FeedbackToastService);

  /**
   * Called when the user clicks the X or the blurred backdrop.
   * Delegates to the service so the close animation always works the same way.
   */
  close(): void {
    this.toast.hide();
  }
}
